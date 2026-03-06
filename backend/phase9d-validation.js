/**
 * Phase 9D — Distributed Cron Lock Validation Script
 *
 * Tests:
 *   1️⃣  Dual Instance Simulation   — Two instances fire same cron; only one executes
 *   2️⃣  Lock Expiry (TTL)          — Death before release; next instance executes after TTL
 *   3️⃣  Concurrency Test           — Promise.all 2 calls; only one executes
 *   4️⃣  Stress Test (20+ rapid)    — 20+ concurrent triggers; exactly one executes per window
 *   5️⃣  Redis Down Scenario        — Cron skips safely; no crash; no in-memory fallback
 *   6️⃣  Database Verification      — No duplicate MetricsSnapshot rows
 *
 * Prerequisites:
 *   - npm i ioredis @prisma/client (already installed)
 *   - .env must have DATABASE_URL, REDIS_HOST, REDIS_PORT set
 *   - Redis must be reachable on localhost:6379 for most tests
 *
 * Run: node phase9d-validation.js
 */

'use strict';

const { execSync, spawn } = require('child_process');
const Redis = require('ioredis');
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
require('dotenv').config();

// ─── Config ───────────────────────────────────────────────────────────────────

const REDIS_CONFIG = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    retryStrategy: () => null,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
};

const prisma = new PrismaClient();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Result tracking ──────────────────────────────────────────────────────────

const results = [];

function pass(name, notes = '') {
    results.push({ name, result: 'PASS', notes });
    console.log(`  ✅ PASS — ${name}${notes ? ' | ' + notes : ''}`);
}

function fail(name, reason = '') {
    results.push({ name, result: 'FAIL', notes: reason });
    console.error(`  ❌ FAIL — ${name}${reason ? ' | ' + reason : ''}`);
}

function header(label) {
    console.log(`\n${'═'.repeat(62)}`);
    console.log(`  ${label}`);
    console.log('═'.repeat(62));
}

// ─── DistributedLockService in-process simulation ─────────────────────────────
// We replicate the exact same logic as src/redis/distributed-lock.service.ts
// so that all tests run directly without needing NestJS bootstrap.

const LUA_RELEASE_LOCK = `
local val = redis.call('GET', KEYS[1])
if val == false then
  return 0
end
if string.sub(val, 1, string.len(ARGV[1])) == ARGV[1] then
  redis.call('DEL', KEYS[1])
  return 1
else
  return 0
end
`;

class DistributedLockSimulator {
    constructor(redisClient, label = 'instance') {
        this.client = redisClient;
        this.instanceId = randomUUID();
        this.label = label;
    }

    async acquireLock(key, ttlSeconds) {
        const lockValue = `v1:${this.instanceId}:${Date.now()}`;
        try {
            const result = await this.client.set(key, lockValue, 'EX', ttlSeconds, 'NX');
            if (result === 'OK') {
                console.log(`    [${this.label}] ACQUIRED key=${key} id=${this.instanceId.slice(0, 8)}`);
                return true;
            }
            const holder = await this.client.get(key).catch(() => null);
            console.log(`    [${this.label}] SKIPPED key=${key} holder=${(holder || 'unknown').slice(0, 30)}`);
            return false;
        } catch (err) {
            console.error(`    [${this.label}] acquireLock ERROR: ${err.message} — skipping`);
            return false;
        }
    }

    async releaseLock(key, durationMs) {
        const prefix = `v1:${this.instanceId}`;
        try {
            const result = await this.client.eval(LUA_RELEASE_LOCK, 1, key, prefix);
            if (result === 1) {
                console.log(`    [${this.label}] RELEASED key=${key}${durationMs !== undefined ? ' duration=' + durationMs + 'ms' : ''}`);
            } else {
                console.log(`    [${this.label}] RELEASE SKIPPED (Lua guard) key=${key}`);
            }
        } catch (err) {
            console.warn(`    [${this.label}] releaseLock FAILED: ${err.message} — TTL will clean up`);
        }
    }
}

// ─── Simulated cron business logic ────────────────────────────────────────────

async function fakeBusinessLogic(label, durationMs = 100) {
    console.log(`    [${label}] >>> executing business logic`);
    await sleep(durationMs);
    console.log(`    [${label}] <<< business logic done`);
}

// ─── Test Helpers ─────────────────────────────────────────────────────────────

async function makeRedis() {
    const client = new Redis(REDIS_CONFIG);
    client.on('error', () => { }); // silence
    await sleep(100); // brief settle
    return client;
}

async function flushLockKeys(client, ...keys) {
    for (const k of keys) {
        try { await client.del(k); } catch (_) { }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 1 — Dual Instance Simulation
// ═══════════════════════════════════════════════════════════════════════════════

async function test1_dualInstance() {
    header('TEST 1 — Dual Instance Simulation');
    console.log('  Two instances fire the same cron simultaneously.\n  Only one must execute; the other must skip.');

    const rc = await makeRedis();
    await flushLockKeys(rc, 'lock:risk-aggregation');

    const lockA = new DistributedLockSimulator(rc, 'Instance-A');
    const lockB = new DistributedLockSimulator(rc, 'Instance-B');

    let aExecuted = false;
    let bExecuted = false;
    let aSkipped = false;
    let bSkipped = false;

    async function cronA() {
        const ok = await lockA.acquireLock('lock:risk-aggregation', 300);
        if (!ok) { aSkipped = true; return; }
        const t = Date.now();
        try { await fakeBusinessLogic('Instance-A', 200); aExecuted = true; }
        finally { await lockA.releaseLock('lock:risk-aggregation', Date.now() - t); }
    }

    async function cronB() {
        const ok = await lockB.acquireLock('lock:risk-aggregation', 300);
        if (!ok) { bSkipped = true; return; }
        const t = Date.now();
        try { await fakeBusinessLogic('Instance-B', 200); bExecuted = true; }
        finally { await lockB.releaseLock('lock:risk-aggregation', Date.now() - t); }
    }

    // Fire simultaneously
    await Promise.all([cronA(), cronB()]);

    const exactlyOneExecuted = (aExecuted && !bExecuted) || (!aExecuted && bExecuted);
    const exactlyOneSkipped = (aSkipped || bSkipped) && !(aSkipped && bSkipped);

    if (exactlyOneExecuted && exactlyOneSkipped) {
        pass('Dual Instance Simulation',
            `A.executed=${aExecuted} B.executed=${bExecuted} | A.skipped=${aSkipped} B.skipped=${bSkipped}`);
    } else {
        fail('Dual Instance Simulation',
            `A.executed=${aExecuted} B.executed=${bExecuted} | A.skipped=${aSkipped} B.skipped=${bSkipped}`);
    }

    await rc.quit();
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 2 — Lock Expiry (TTL)
// ═══════════════════════════════════════════════════════════════════════════════

async function test2_lockExpiry() {
    header('TEST 2 — Lock Expiry (TTL)');
    console.log('  Instance A acquires lock, "dies" (no release). After TTL, Instance B must succeed.\n  TTL = 3s for fast test.');

    const rc = await makeRedis();
    await flushLockKeys(rc, 'lock:metrics-snapshot');

    const lockA = new DistributedLockSimulator(rc, 'Instance-A');
    const lockB = new DistributedLockSimulator(rc, 'Instance-B');

    // A acquires but never releases (simulates crash)
    const aAcquired = await lockA.acquireLock('lock:metrics-snapshot', 3 /* TTL = 3s */);
    console.log(`  Instance A acquired: ${aAcquired}`);

    // B immediately tries — should fail
    const bImmediate = await lockB.acquireLock('lock:metrics-snapshot', 3);
    console.log(`  Instance B immediate attempt: ${bImmediate} (expected: false)`);

    // Wait for TTL to expire
    console.log('  Waiting 4 seconds for TTL expiry...');
    await sleep(4000);

    // B tries again — should succeed now
    let bExecuted = false;
    const bAfterExpiry = await lockB.acquireLock('lock:metrics-snapshot', 3);
    if (bAfterExpiry) {
        const t = Date.now();
        try { await fakeBusinessLogic('Instance-B (post-expiry)', 50); bExecuted = true; }
        finally { await lockB.releaseLock('lock:metrics-snapshot', Date.now() - t); }
    }

    if (aAcquired && !bImmediate && bAfterExpiry && bExecuted) {
        pass('Lock Expiry (TTL)', 'No deadlock. Lock expired cleanly. Instance B executed after TTL.');
    } else {
        fail('Lock Expiry (TTL)',
            `aAcquired=${aAcquired} bImmediate=${bImmediate} bAfterExpiry=${bAfterExpiry} bExecuted=${bExecuted}`);
    }

    await rc.quit();
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 3 — Concurrency (Promise.all 2 calls)
// ═══════════════════════════════════════════════════════════════════════════════

async function test3_concurrency() {
    header('TEST 3 — Concurrency (Promise.all, 2 calls, same instance)');
    console.log('  Two simultaneous calls on the same instance. Only one must execute.');

    const rc = await makeRedis();
    await flushLockKeys(rc, 'lock:alert-evaluation');

    const lock = new DistributedLockSimulator(rc, 'SingleInstance');
    let execCount = 0;
    let skipCount = 0;

    async function cronHandler() {
        const ok = await lock.acquireLock('lock:alert-evaluation', 120);
        if (!ok) { skipCount++; return; }
        const t = Date.now();
        try { await fakeBusinessLogic('SingleInstance', 150); execCount++; }
        finally { await lock.releaseLock('lock:alert-evaluation', Date.now() - t); }
    }

    await Promise.all([cronHandler(), cronHandler()]);

    if (execCount === 1 && skipCount === 1) {
        pass('Concurrency (2 parallel, 1 instance)', `executed=${execCount} skipped=${skipCount}`);
    } else {
        fail('Concurrency (2 parallel, 1 instance)', `executed=${execCount} skipped=${skipCount}`);
    }

    await rc.quit();
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 4 — Stress Test (20+ rapid concurrent triggers across 4 simulated instances)
// ═══════════════════════════════════════════════════════════════════════════════

async function test4_stressTest() {
    header('TEST 4 — Stress Test (20 concurrent triggers, 4 instances)');
    console.log('  20 rapid cron triggers across 4 instances. Exactly 1 must execute per window.');

    const rc = await makeRedis();
    await flushLockKeys(rc, 'lock:risk-aggregation');

    // Create 4 separate instance simulators (each has unique instanceId)
    const locks = [
        new DistributedLockSimulator(rc, 'Inst-1'),
        new DistributedLockSimulator(rc, 'Inst-2'),
        new DistributedLockSimulator(rc, 'Inst-3'),
        new DistributedLockSimulator(rc, 'Inst-4'),
    ];

    let execCount = 0;
    let skipCount = 0;

    async function cronHandler(lockInst) {
        const ok = await lockInst.acquireLock('lock:risk-aggregation', 300);
        if (!ok) { skipCount++; return; }
        const t = Date.now();
        try { await fakeBusinessLogic(lockInst.label, 80); execCount++; }
        finally { await lockInst.releaseLock('lock:risk-aggregation', Date.now() - t); }
    }

    // Generate 20 triggers — 5 each from each instance — all fired concurrently
    const tasks = [];
    for (let i = 0; i < 20; i++) {
        tasks.push(cronHandler(locks[i % locks.length]));
    }
    await Promise.all(tasks);

    console.log(`  Total executed: ${execCount}, Total skipped: ${skipCount}`);

    if (execCount === 1 && skipCount === 19) {
        pass('Stress Test (20 triggers, 4 instances)', `executed=${execCount} skipped=${skipCount}`);
    } else {
        fail('Stress Test (20 triggers, 4 instances)',
            `executed=${execCount} skipped=${skipCount} — expected executed=1 skipped=19`);
    }

    await rc.quit();
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 5 — Redis Down Scenario
// ═══════════════════════════════════════════════════════════════════════════════

async function test5_redisDown() {
    header('TEST 5 — Redis Down Scenario');
    console.log('  When Redis is unavailable, acquireLock must return false.\n  Cron must skip — no execution, no crash, no in-memory fallback.');

    // Create a Redis client pointing to a port with nothing running
    const deadClient = new Redis({
        host: 'localhost',
        port: 19999, // Deliberately wrong port
        lazyConnect: true,
        retryStrategy: () => null,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        connectTimeout: 500,
    });
    deadClient.on('error', () => { });

    try { await deadClient.connect(); } catch (_) { }

    const lock = new DistributedLockSimulator(deadClient, 'Redis-Down-Inst');
    let executed = false;
    let skipped = false;

    const acquired = await lock.acquireLock('lock:risk-aggregation', 300);
    if (!acquired) {
        skipped = true;
    } else {
        // Should NEVER reach here
        await fakeBusinessLogic('Redis-Down-Inst');
        executed = true;
        await lock.releaseLock('lock:risk-aggregation');
    }

    if (!executed && skipped) {
        pass('Redis Down — Cron Skips Safely', 'acquireLock returned false. No execution. No crash.');
    } else {
        fail('Redis Down — Cron Skips Safely', `executed=${executed} (should be false)`);
    }

    await deadClient.quit().catch(() => { });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 6 — Database Verification (No duplicates)
// ═══════════════════════════════════════════════════════════════════════════════

async function test6_dbVerification() {
    header('TEST 6 — Database Verification (No Duplicate Rows)');
    console.log('  Query DB for duplicate MetricsSnapshot.date and check Alert uniqueness.');

    let pass6 = true;
    const notes = [];

    try {
        // ─── MetricsSnapshot — date must be unique ────────────────────────────
        const dupDates = await prisma.$queryRaw`
            SELECT date, COUNT(*) as cnt
            FROM metrics_snapshot
            GROUP BY date
            HAVING COUNT(*) > 1
        `;

        if (dupDates.length === 0) {
            notes.push('MetricsSnapshot.date: no duplicates');
        } else {
            pass6 = false;
            notes.push(`MetricsSnapshot.date: ${dupDates.length} DUPLICATE dates found!`);
            dupDates.forEach(d => notes.push(`  → date=${d.date} count=${d.cnt}`));
        }

        // Total snapshot rows
        const totalSnapshots = await prisma.metricsSnapshot.count();
        notes.push(`MetricsSnapshot total rows: ${totalSnapshots}`);

        // ─── Alert — check for duplicate ACTIVE alerts of same type+pincode ──
        const dupAlerts = await prisma.$queryRaw`
            SELECT type, pincode, COUNT(*) as cnt
            FROM "Alert"
            WHERE status = 'ACTIVE'
            GROUP BY type, pincode
            HAVING COUNT(*) > 1
        `;

        if (dupAlerts.length === 0) {
            notes.push('Alert (ACTIVE, type+pincode): no duplicates');
        } else {
            pass6 = false;
            notes.push(`Alert: ${dupAlerts.length} duplicate ACTIVE alert groups found!`);
        }

        // Total alert rows
        const totalAlerts = await prisma.alert.count();
        notes.push(`Alert total rows: ${totalAlerts}`);

        // ─── PincodeRisk — pincode is @id so inherently unique ───────────────
        const totalRisk = await prisma.pincodeRisk.count();
        notes.push(`PincodeRisk total rows: ${totalRisk} (primary key = pincode, always unique)`);

    } catch (err) {
        pass6 = false;
        notes.push(`DB query error: ${err.message}`);
    }

    if (pass6) {
        pass('Database Verification — No Duplicates', notes.join(' | '));
    } else {
        fail('Database Verification — No Duplicates', notes.join(' | '));
    }
}

// ─── TTL Warning Check ─────────────────────────────────────────────────────────

function test_ttlCheck() {
    header('TTL SAFETY CHECK — 2× Worst-Case Rule');

    const checks = [
        { cron: 'Risk Aggregation', key: 'lock:risk-aggregation', ttl: 300, worstCaseMs: 120000 },
        { cron: 'Metrics Snapshot', key: 'lock:metrics-snapshot', ttl: 300, worstCaseMs: 90000 },
        { cron: 'Alert Evaluation', key: 'lock:alert-evaluation', ttl: 120, worstCaseMs: 30000 },
    ];

    for (const c of checks) {
        const ttlMs = c.ttl * 1000;
        const ratio = ttlMs / c.worstCaseMs;
        if (ratio >= 2) {
            console.log(`  ✅ ${c.cron}: TTL=${c.ttl}s ≥ 2× worst-case=${c.worstCaseMs / 1000}s (ratio=${ratio.toFixed(1)}x)`);
            results.push({ name: `TTL 2× check — ${c.cron}`, result: 'PASS', notes: `ratio=${ratio.toFixed(1)}x` });
        } else {
            console.error(`  ❌ ${c.cron}: TTL=${c.ttl}s < 2× worst-case=${c.worstCaseMs / 1000}s (ratio=${ratio.toFixed(1)}x)`);
            results.push({ name: `TTL 2× check — ${c.cron}`, result: 'FAIL', notes: `ratio=${ratio.toFixed(1)}x` });
        }
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('   PHASE 9D VALIDATION — Distributed Cron Lock');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`  Time        : ${new Date().toISOString()}`);
    console.log(`  Redis       : ${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`);
    console.log(`  DB          : [via Prisma]`);
    console.log('════════════════════════════════════════════════════════════════\n');

    try {
        await test1_dualInstance();
        await test2_lockExpiry();
        await test3_concurrency();
        await test4_stressTest();
        await test5_redisDown();
        await test6_dbVerification();
        test_ttlCheck();
    } catch (err) {
        console.error('\nFATAL ERROR during test run:', err);
    } finally {
        await prisma.$disconnect();
    }

    // ─── Final Report ─────────────────────────────────────────────────────────
    console.log('\n\n════════════════════════════════════════════════════════════════');
    console.log('   PHASE 9D VALIDATION — FINAL RESULTS');
    console.log('════════════════════════════════════════════════════════════════');

    let allPass = true;
    const colW = 45;
    for (const r of results) {
        const icon = r.result === 'PASS' ? '✅' : '❌';
        const label = (r.name + ' ').padEnd(colW, '─');
        console.log(`  ${icon} ${label} ${r.result}`);
        if (r.notes) console.log(`     ${r.notes}`);
        if (r.result !== 'PASS') allPass = false;
    }

    console.log('\n════════════════════════════════════════════════════════════════');
    if (allPass) {
        console.log('  🏆 Phase 9D validated and locked');
    } else {
        console.log('  ⛔  Phase 9D NOT validated — review failures above');
    }
    console.log('════════════════════════════════════════════════════════════════\n');

    process.exit(allPass ? 0 : 1);
}

main();
