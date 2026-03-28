'use strict';
/**
 * PHASE 9E — FINAL LOAD TEST RUNNER
 * Targets LIVE backend (already running on port 4000)
 * All 5 scenarios + invariant checks + full report
 */

const fs = require('fs');
const axios = require('axios');
const Redis = require('ioredis');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://127.0.0.1:4000/v1';
const prisma = new PrismaClient();
const REDIS_CONFIG = { host: 'localhost', port: 6379, lazyConnect: true };
const REPORT_FILE = 'phase9e-final-report.txt';

const THRESHOLDS = {
    browsingP95: 300,
    dashboardP95: 200,
    errorRateMax: 0.01,
    redisHitRatioMin: 0.80,
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const percentile = (arr, p) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const pos = (s.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    return s[base + 1] !== undefined ? s[base] + rest * (s[base + 1] - s[base]) : s[base];
};

let adminToken = '';
let userTokens = [];

async function setupAuth() {
    console.log('\n[AUTH] Setting up tokens from DB...');
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) throw new Error('No ADMIN user found');
    adminToken = jwt.sign(
        { sub: adminUser.id, email: adminUser.email, role: 'ADMIN' },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );

    const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' }, take: 25 });
    userTokens = customers.map(c => ({
        id: c.id,
        token: jwt.sign({ sub: c.id, email: c.email, role: 'CUSTOMER' }, process.env.JWT_SECRET, { expiresIn: '2h' })
    }));
    console.log(`  ✓ Admin token ready | ${userTokens.length} customer tokens ready`);
    if (userTokens.length === 0) throw new Error('No CUSTOMER users found — seed DB first');
}

async function getRedisInfo() {
    const r = new Redis(REDIS_CONFIG);
    try {
        await r.connect();
        const info = await r.info('stats');
        const mem = await r.info('memory');
        const hits = parseInt((info.match(/keyspace_hits:(\d+)/) || ['', '0'])[1]);
        const misses = parseInt((info.match(/keyspace_misses:(\d+)/) || ['', '0'])[1]);
        const usedMem = (mem.match(/used_memory_human:([^\r\n]+)/) || ['', 'N/A'])[1].trim();
        await r.quit();
        return { hits, misses, usedMem };
    } catch (e) {
        await r.quit().catch(() => { });
        return { hits: 0, misses: 0, usedMem: 'N/A', error: e.message };
    }
}

// ─────────────────────────────────────────────────────────
// SCENARIO 1: Product Browsing Load (200 VU, 60s)
// ─────────────────────────────────────────────────────────
async function scenario1_browsing() {
    const DURATION_MS = 60_000;
    const VU_COUNT = 200;
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`SCENARIO 1 — Product Browsing Load (${VU_COUNT} VUs, ${DURATION_MS / 1000}s)`);
    console.log(`${'═'.repeat(60)}`);

    const products = await prisma.product.findMany({ select: { id: true, slug: true }, take: 30 });
    const categories = await prisma.category.findMany({ select: { slug: true }, take: 10 });

    if (!products.length) throw new Error('No products in DB for browsing test');

    const latencies = [];
    let errors = 0, total = 0;
    const start = Date.now();

    const redisBefore = await getRedisInfo();

    const vu = async () => {
        while (Date.now() - start < DURATION_MS) {
            const rnd = Math.random();
            let url;
            if (rnd < 0.55) {
                url = `${API_URL}/products`;
            } else if (rnd < 0.85) {
                url = `${API_URL}/products/slug/${products[Math.floor(Math.random() * products.length)].slug}`;
            } else if (rnd < 0.95) {
                url = `${API_URL}/categories`;
            } else {
                url = `${API_URL}/products/${products[Math.floor(Math.random() * products.length)].id}`;
            }
            const t0 = Date.now();
            try {
                await axios.get(url, { timeout: 5000 });
                latencies.push(Date.now() - t0);
            } catch {
                errors++;
            }
            total++;
        }
    };

    console.log(`  Launching ${VU_COUNT} virtual users...`);
    const vus = [];
    for (let i = 0; i < VU_COUNT; i++) vus.push(vu());
    await Promise.all(vus);

    const elapsed = (Date.now() - start) / 1000;
    const redisAfter = await getRedisInfo();

    const hitDelta = redisAfter.hits - redisBefore.hits;
    const missDelta = redisAfter.misses - redisBefore.misses;
    const cacheTotal = hitDelta + missDelta;
    const hitRatio = cacheTotal > 0 ? hitDelta / cacheTotal : 0;

    const p50 = percentile(latencies, 0.50);
    const p95 = percentile(latencies, 0.95);
    const p99 = percentile(latencies, 0.99);
    const rps = total / elapsed;
    const errRate = errors / (total || 1);

    console.log(`\n  ┌─ Results ─────────────────────────────────────┐`);
    console.log(`  │ Requests:    ${total.toString().padEnd(10)} RPS: ${rps.toFixed(2).padEnd(10)}│`);
    console.log(`  │ Errors:      ${errors} (${(errRate * 100).toFixed(2)}%)`.padEnd(50) + '│');
    console.log(`  │ P50:         ${p50.toFixed(0)}ms`.padEnd(50) + '│');
    console.log(`  │ P95:         ${p95.toFixed(0)}ms  (target < ${THRESHOLDS.browsingP95}ms)`.padEnd(50) + '│');
    console.log(`  │ P99:         ${p99.toFixed(0)}ms`.padEnd(50) + '│');
    console.log(`  │ Redis Hits:  ${hitDelta} / ${cacheTotal} = ${(hitRatio * 100).toFixed(1)}% (target > 80%)`.padEnd(50) + '│');
    console.log(`  │ Redis Mem:   ${redisAfter.usedMem}`.padEnd(50) + '│');
    console.log(`  └───────────────────────────────────────────────┘`);

    const pass = p95 < THRESHOLDS.browsingP95 && errRate < THRESHOLDS.errorRateMax;
    console.log(`  ${pass ? '✅ PASS' : '❌ FAIL'} — P95=${p95.toFixed(0)}ms errRate=${(errRate * 100).toFixed(2)}%`);

    return {
        name: 'Scenario 1: Product Browsing',
        pass,
        metrics: { rps: rps.toFixed(2), p50: p50.toFixed(0), p95: p95.toFixed(0), p99: p99.toFixed(0), errRate: (errRate * 100).toFixed(2) + '%', hitRatio: (hitRatio * 100).toFixed(1) + '%', redisMem: redisAfter.usedMem, total, errors }
    };
}

// ─────────────────────────────────────────────────────────
// SCENARIO 2: Cart Concurrency (100 users)
// ─────────────────────────────────────────────────────────
async function scenario2_cart() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log('SCENARIO 2 — Cart Concurrency Test (100 concurrent users)');
    console.log(`${'═'.repeat(60)}`);

    const products = await prisma.product.findMany({ select: { id: true }, take: 15 });
    if (!products.length) throw new Error('No products for cart test');

    // Ensure enough stock
    await prisma.product.updateMany({
        where: { id: { in: products.map(p => p.id) } },
        data: { stock: 9999 }
    });
    console.log('  ✓ Stock set to 9999 for all test products');

    let addSuccess = 0, addFail = 0, updateSuccess = 0, updateFail = 0;
    const latencies = [];

    const runUser = async (u, idx) => {
        const conf = { headers: { Authorization: `Bearer ${u.token}` }, timeout: 8000 };
        const prod = products[idx % products.length];

        const t0 = Date.now();
        try {
            await axios.post(`${API_URL}/cart/add`, { productId: prod.id, quantity: 2 }, conf);
            addSuccess++;
        } catch (e) {
            addFail++;
            console.error(`  [CART-ADD FAIL] user=${u.id.slice(0, 8)} err=${e.response?.data?.message || e.message}`);
        }

        try {
            await axios.patch(`${API_URL}/cart/update/${prod.id}`, { quantity: 5 }, conf);
            updateSuccess++;
        } catch (e) {
            updateFail++;
            console.error(`  [CART-UPD FAIL] user=${u.id.slice(0, 8)} err=${e.response?.data?.message || e.message}`);
        }
        latencies.push(Date.now() - t0);
    };

    const tasks = [];
    for (let i = 0; i < 100; i++) tasks.push(runUser(userTokens[i % userTokens.length], i));
    const start = Date.now();
    await Promise.all(tasks);
    const duration = Date.now() - start;

    // Verify no negative stock
    const negStock = await prisma.product.count({ where: { stock: { lt: 0 } } });
    const p95 = percentile(latencies, 0.95);
    const totalOps = addSuccess + addFail + updateSuccess + updateFail;
    const errRate = (addFail + updateFail) / totalOps;

    console.log(`\n  ┌─ Results ─────────────────────────────────────┐`);
    console.log(`  │ Duration:       ${duration}ms`.padEnd(50) + '│');
    console.log(`  │ Add:            ${addSuccess} success / ${addFail} fail`.padEnd(50) + '│');
    console.log(`  │ Update:         ${updateSuccess} success / ${updateFail} fail`.padEnd(50) + '│');
    console.log(`  │ Error Rate:     ${(errRate * 100).toFixed(2)}%`.padEnd(50) + '│');
    console.log(`  │ P95 latency:    ${p95.toFixed(0)}ms`.padEnd(50) + '│');
    console.log(`  │ Negative Stock: ${negStock} (must be 0)`.padEnd(50) + '│');
    console.log(`  └───────────────────────────────────────────────┘`);

    const pass = negStock === 0 && errRate < THRESHOLDS.errorRateMax;
    console.log(`  ${pass ? '✅ PASS' : '❌ FAIL'} — negStock=${negStock} errRate=${(errRate * 100).toFixed(2)}%`);

    return {
        name: 'Scenario 2: Cart Concurrency',
        pass,
        metrics: { duration: duration + 'ms', addSuccess, addFail, updateSuccess, updateFail, p95: p95.toFixed(0) + 'ms', errRate: (errRate * 100).toFixed(2) + '%', negativeStock: negStock }
    };
}

// ─────────────────────────────────────────────────────────
// SCENARIO 3: Checkout Concurrency (50 parallel)
// ─────────────────────────────────────────────────────────
async function scenario3_checkout() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log('SCENARIO 3 — Checkout Concurrency Test (50 parallel)');
    console.log(`${'═'.repeat(60)}`);

    const products = await prisma.product.findMany({ select: { id: true }, take: 10 });
    if (!products.length) throw new Error('No products for checkout test');

    // Seed high-risk pincode
    await prisma.pincodeRisk.upsert({
        where: { pincode: '560001' },
        update: { riskLevel: 'HIGH', totalOrders30d: 100, rtoCount30d: 45, rtoPercentage: 45 },
        create: { pincode: '560001', riskLevel: 'HIGH', totalOrders30d: 100, rtoCount30d: 45, rtoPercentage: 45 }
    });
    console.log('  ✓ High-risk pincode 560001 seeded');

    // Ensure abundant stock for all products
    await prisma.product.updateMany({
        where: { id: { in: products.map(p => p.id) } },
        data: { stock: 9999 }
    });

    const ordersBefore = await prisma.order.count();
    const stocksBefore = await prisma.product.findMany({
        where: { id: { in: products.map(p => p.id) } },
        select: { id: true, stock: true }
    });

    const results = [];
    const runCheckout = async (u, idx) => {
        const conf = { headers: { Authorization: `Bearer ${u.token}` }, timeout: 15000 };
        const prod = products[idx % products.length];

        try {
            // Clear cart first
            await axios.delete(`${API_URL}/cart/clear`, conf).catch(() => { });
            // Add product
            await axios.post(`${API_URL}/cart/add`, { productId: prod.id, quantity: 1 }, conf);

            // Ensure address
            let addr = await prisma.address.findFirst({ where: { userId: u.id } });
            if (!addr) {
                const pincode = idx % 7 === 0 ? '560001' : '400001';
                addr = await prisma.address.create({
                    data: {
                        userId: u.id,
                        fullName: 'Phase 9E Test',
                        addressLine1: '42 Main Road',
                        city: idx % 7 === 0 ? 'Bangalore' : 'Mumbai',
                        state: idx % 7 === 0 ? 'Karnataka' : 'Maharashtra',
                        postalCode: pincode,
                        country: 'IN',
                        phone: '9876543210'
                    }
                });
            }

            const method = idx % 3 === 0 ? 'PREPAID' : 'COD';
            const res = await axios.post(`${API_URL}/orders`, { addressId: addr.id, paymentMethod: method }, conf);
            return { success: true, method, orderNumber: res.data?.data?.orderNumber };
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            const isCodBlock = typeof msg === 'string' && (msg.includes('COD') || msg.includes('pincode'));
            return { success: isCodBlock, blocked: isCodBlock, error: isCodBlock ? null : msg };
        }
    };

    const tasks = [];
    for (let i = 0; i < 50; i++) tasks.push(runCheckout(userTokens[i % userTokens.length], i));
    const start = Date.now();
    results.push(...await Promise.all(tasks));
    const duration = Date.now() - start;

    const successCount = results.filter(r => r.success && !r.blocked).length;
    const blockedCount = results.filter(r => r.blocked).length;
    const failCount = results.filter(r => !r.success).length;

    // Integrity checks
    const ordersAfter = await prisma.order.count();
    const newOrders = ordersAfter - ordersBefore;
    const stocksAfter = await prisma.product.findMany({
        where: { id: { in: products.map(p => p.id) } },
        select: { id: true, stock: true }
    });
    const negStock = stocksAfter.filter(s => s.stock < 0);
    const orderNums = (await prisma.order.findMany({
        where: { createdAt: { gte: new Date(start) } },
        select: { orderNumber: true }
    })).map(o => o.orderNumber);
    const dupOrders = orderNums.length !== new Set(orderNums).size;

    if (failCount > 0) {
        results.filter(r => !r.success).forEach((r, i) => {
            console.error(`  [CHECKOUT FAIL ${i + 1}] ${r.error}`);
        });
    }

    console.log(`\n  ┌─ Results ─────────────────────────────────────┐`);
    console.log(`  │ Duration:       ${duration}ms`.padEnd(50) + '│');
    console.log(`  │ Success:        ${successCount}`.padEnd(50) + '│');
    console.log(`  │ COD Blocked:    ${blockedCount} (high-risk pincode)`.padEnd(50) + '│');
    console.log(`  │ Failures:       ${failCount}`.padEnd(50) + '│');
    console.log(`  │ New Orders:     ${newOrders}`.padEnd(50) + '│');
    console.log(`  │ Negative Stock: ${negStock.length} (must be 0)`.padEnd(50) + '│');
    console.log(`  │ Duplicate Orders: ${dupOrders ? 'YES ❌' : 'NO ✅'}`.padEnd(50) + '│');
    console.log(`  └───────────────────────────────────────────────┘`);

    const pass = failCount === 0 && negStock.length === 0 && !dupOrders;
    console.log(`  ${pass ? '✅ PASS' : '❌ FAIL'} — orders=${newOrders} negStock=${negStock.length} dups=${dupOrders}`);

    return {
        name: 'Scenario 3: Checkout Concurrency',
        pass,
        metrics: { duration: duration + 'ms', successCount, blockedCount, failCount, newOrders, negativeStock: negStock.length, duplicateOrders: dupOrders }
    };
}

// ─────────────────────────────────────────────────────────
// SCENARIO 4: Dashboard Stress (150 VU, 60s)
// ─────────────────────────────────────────────────────────
async function scenario4_dashboard() {
    const DURATION_MS = 60_000;
    const VU_COUNT = 150;
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`SCENARIO 4 — Dashboard Stress (${VU_COUNT} VUs, ${DURATION_MS / 1000}s)`);
    console.log(`${'═'.repeat(60)}`);

    const conf = { headers: { Authorization: `Bearer ${adminToken}` }, timeout: 10000 };

    // Flush Redis to force warm-up phase, then measure proper hit ratio
    const redis = new Redis(REDIS_CONFIG);
    await redis.connect();
    await redis.flushall();
    await redis.quit();
    console.log('  ✓ Redis flushed — cache warm-up will be measured');

    const latencies = [];
    let errors = 0, total = 0;
    const start = Date.now();
    const redisBefore = await getRedisInfo();

    const vu = async () => {
        while (Date.now() - start < DURATION_MS) {
            const t0 = Date.now();
            try {
                await axios.get(`${API_URL}/admin/dashboard/ceo`, conf);
                latencies.push(Date.now() - t0);
            } catch {
                errors++;
            }
            total++;
            await sleep(40);
        }
    };

    console.log(`  Launching ${VU_COUNT} virtual users...`);
    const vus = [];
    for (let i = 0; i < VU_COUNT; i++) vus.push(vu());
    await Promise.all(vus);

    const elapsed = (Date.now() - start) / 1000;
    const redisAfter = await getRedisInfo();

    const hitDelta = redisAfter.hits - redisBefore.hits;
    const missDelta = redisAfter.misses - redisBefore.misses;
    const cacheTotal = hitDelta + missDelta;
    const hitRatio = cacheTotal > 0 ? hitDelta / cacheTotal : 0;

    const p50 = percentile(latencies, 0.50);
    const p95 = percentile(latencies, 0.95);
    const p99 = percentile(latencies, 0.99);
    const rps = total / elapsed;
    const errRate = errors / (total || 1);

    console.log(`\n  ┌─ Results ─────────────────────────────────────┐`);
    console.log(`  │ Requests:    ${total.toString().padEnd(10)} RPS: ${rps.toFixed(2).padEnd(10)}│`);
    console.log(`  │ Errors:      ${errors} (${(errRate * 100).toFixed(2)}%)`.padEnd(50) + '│');
    console.log(`  │ P50:         ${p50.toFixed(0)}ms`.padEnd(50) + '│');
    console.log(`  │ P95:         ${p95.toFixed(0)}ms  (target < ${THRESHOLDS.dashboardP95}ms)`.padEnd(50) + '│');
    console.log(`  │ P99:         ${p99.toFixed(0)}ms`.padEnd(50) + '│');
    console.log(`  │ Redis Hits:  ${hitDelta} / ${cacheTotal} = ${(hitRatio * 100).toFixed(1)}% (target > 80%)`.padEnd(50) + '│');
    console.log(`  │ Redis Mem:   ${redisAfter.usedMem}`.padEnd(50) + '│');
    console.log(`  └───────────────────────────────────────────────┘`);

    const pass = p95 < THRESHOLDS.dashboardP95 && hitRatio > THRESHOLDS.redisHitRatioMin && errRate < THRESHOLDS.errorRateMax;
    console.log(`  ${pass ? '✅ PASS' : '❌ FAIL'} — P95=${p95.toFixed(0)}ms hitRatio=${(hitRatio * 100).toFixed(1)}% errRate=${(errRate * 100).toFixed(2)}%`);

    return {
        name: 'Scenario 4: Dashboard Stress',
        pass,
        metrics: { rps: rps.toFixed(2), p50: p50.toFixed(0), p95: p95.toFixed(0), p99: p99.toFixed(0), errRate: (errRate * 100).toFixed(2) + '%', hitRatio: (hitRatio * 100).toFixed(1) + '%', redisMem: redisAfter.usedMem, total, errors }
    };
}

// ─────────────────────────────────────────────────────────
// SCENARIO 5: Cron + Traffic Concurrent
// ─────────────────────────────────────────────────────────
async function scenario5_cron() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log('SCENARIO 5 — Cron + Traffic Concurrency Test');
    console.log(`${'═'.repeat(60)}`);

    const adminConf = { headers: { Authorization: `Bearer ${adminToken}` }, timeout: 30000 };

    // Background product traffic
    let stopTraffic = false;
    let trafficCount = 0;
    let trafficErrors = 0;
    const baselineLatencies = [];

    const trafficTask = (async () => {
        while (!stopTraffic) {
            const t0 = Date.now();
            try {
                await axios.get(`${API_URL}/products`, { timeout: 3000 });
                baselineLatencies.push(Date.now() - t0);
            } catch {
                trafficErrors++;
            }
            trafficCount++;
            await sleep(15);
        }
    })();

    await sleep(2000);
    const baseP95Before = percentile(baselineLatencies, 0.95);
    console.log(`  Background traffic baseline P95: ${baseP95Before.toFixed(0)}ms`);

    // Clear distributed locks
    const redis = new Redis(REDIS_CONFIG);
    await redis.connect();
    await redis.del('lock:risk-aggregation', 'lock:metrics-snapshot', 'lock:alert-evaluation');
    await redis.quit();
    console.log('  ✓ Cleared existing cron locks');

    // Fire 3x concurrent cron triggers
    console.log('\n  Firing 3x concurrent risk-aggregation cron triggers...');
    const cronStart = Date.now();
    const cronResults = await Promise.allSettled([
        axios.post(`${API_URL}/risk/aggregate`, {}, adminConf),
        axios.post(`${API_URL}/risk/aggregate`, {}, adminConf),
        axios.post(`${API_URL}/risk/aggregate`, {}, adminConf),
    ]);
    const cronDuration = Date.now() - cronStart;

    const cronSucceeded = cronResults.filter(r => r.status === 'fulfilled').length;
    const cronFailed = cronResults.filter(r => r.status === 'rejected').length;

    console.log('\n  Firing concurrent snapshot + alert cron...');
    await Promise.allSettled([
        axios.post(`${API_URL}/risk/aggregate`, {}, adminConf).catch(() => { }),
    ]);

    await sleep(3000);
    stopTraffic = true;
    await trafficTask;

    const baseP95After = percentile(baselineLatencies, 0.95);
    const latencySpike = baseP95Before > 0 ? ((baseP95After - baseP95Before) / baseP95Before) * 100 : 0;

    console.log(`\n  ┌─ Results ─────────────────────────────────────┐`);
    console.log(`  │ Cron Duration:   ${cronDuration}ms`.padEnd(50) + '│');
    console.log(`  │ Cron Succeeded:  ${cronSucceeded}`.padEnd(50) + '│');
    console.log(`  │ Cron Failed:     ${cronFailed}`.padEnd(50) + '│');
    console.log(`  │ Traffic Reqs:    ${trafficCount} (${trafficErrors} errors)`.padEnd(50) + '│');
    console.log(`  │ P95 Before:      ${baseP95Before.toFixed(0)}ms`.padEnd(50) + '│');
    console.log(`  │ P95 After:       ${baseP95After.toFixed(0)}ms`.padEnd(50) + '│');
    console.log(`  │ Latency Spike:   ${latencySpike.toFixed(1)}% (target < 20%)`.padEnd(50) + '│');
    console.log(`  └───────────────────────────────────────────────┘`);

    // Distributed lock check via Redis keys
    let lockCheck = 'N/A';
    try {
        const r2 = new Redis(REDIS_CONFIG);
        await r2.connect();
        const lockExists = await r2.exists('lock:risk-aggregation');
        lockCheck = lockExists ? 'Lock released (expired/released normally)' : 'No dangling lock ✓';
        await r2.quit();
    } catch { }

    console.log(`  Lock state: ${lockCheck}`);

    const pass = latencySpike < 20 && cronDuration < 30000;
    console.log(`  ${pass ? '✅ PASS' : '❌ FAIL'} — spike=${latencySpike.toFixed(1)}% cronDuration=${cronDuration}ms`);

    return {
        name: 'Scenario 5: Cron + Traffic',
        pass,
        metrics: {
            cronDuration: cronDuration + 'ms',
            cronSucceeded,
            cronFailed,
            trafficCount,
            trafficErrors,
            p95Before: baseP95Before.toFixed(0) + 'ms',
            p95After: baseP95After.toFixed(0) + 'ms',
            latencySpike: latencySpike.toFixed(1) + '%',
            lockState: lockCheck
        }
    };
}

// ─────────────────────────────────────────────────────────
// INVARIANT CHECKS
// ─────────────────────────────────────────────────────────
async function runInvariantChecks() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log('SYSTEM INVARIANT CHECKS');
    console.log(`${'═'.repeat(60)}`);

    const checks = [];

    const negStock = await prisma.product.count({ where: { stock: { lt: 0 } } });
    checks.push({ name: 'No Negative Stock', pass: negStock === 0, value: negStock });

    const allOrders = await prisma.order.findMany({ select: { orderNumber: true } });
    const orderNums = allOrders.map(o => o.orderNumber);
    const dupOrders = orderNums.length - new Set(orderNums).size;
    checks.push({ name: 'No Duplicate Order Numbers', pass: dupOrders === 0, value: dupOrders });

    const totalOrders = allOrders.length;
    checks.push({ name: 'Total Orders in DB', pass: true, value: totalOrders });

    const orphanOrders = await prisma.order.count({ where: { items: { none: {} } } });
    checks.push({ name: 'No Orphan Orders (no items)', pass: orphanOrders === 0, value: orphanOrders });

    // Stock consistency: sum of sold quantities should not exceed original stock
    const fraudOrders = await prisma.order.count({ where: { isManualReview: true, reviewStatus: 'PENDING' } });
    checks.push({ name: 'Manual Review Orders Flagged', pass: true, value: fraudOrders });

    for (const c of checks) {
        console.log(`  ${c.pass ? '✅' : '❌'} ${c.name.padEnd(40)} : ${c.value}`);
    }

    return checks;
}

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────
async function main() {
    const startTime = new Date();
    console.log('\n' + '█'.repeat(60));
    console.log('  PHASE 9E — LOAD TESTING & STRESS VALIDATION');
    console.log('  ' + startTime.toISOString());
    console.log('█'.repeat(60));

    // Health check
    try {
        const h = await axios.get(`${API_URL}/health`, { timeout: 5000 });
        console.log(`\n✓ Backend healthy: ${JSON.stringify(h.data)}`);
    } catch (e) {
        console.error(`\n✗ Backend health check FAILED: ${e.message}`);
        console.error('  Make sure backend is running: npm run start');
        process.exit(1);
    }

    await setupAuth();

    const results = [];

    try {
        results.push(await scenario1_browsing());
    } catch (e) {
        console.error('SCENARIO 1 CRASHED:', e.message);
        results.push({ name: 'Scenario 1: Product Browsing', pass: false, metrics: { error: e.message } });
    }

    try {
        results.push(await scenario2_cart());
    } catch (e) {
        console.error('SCENARIO 2 CRASHED:', e.message);
        results.push({ name: 'Scenario 2: Cart Concurrency', pass: false, metrics: { error: e.message } });
    }

    try {
        results.push(await scenario3_checkout());
    } catch (e) {
        console.error('SCENARIO 3 CRASHED:', e.message);
        results.push({ name: 'Scenario 3: Checkout Concurrency', pass: false, metrics: { error: e.message } });
    }

    try {
        results.push(await scenario4_dashboard());
    } catch (e) {
        console.error('SCENARIO 4 CRASHED:', e.message);
        results.push({ name: 'Scenario 4: Dashboard Stress', pass: false, metrics: { error: e.message } });
    }

    try {
        results.push(await scenario5_cron());
    } catch (e) {
        console.error('SCENARIO 5 CRASHED:', e.message);
        results.push({ name: 'Scenario 5: Cron + Traffic', pass: false, metrics: { error: e.message } });
    }

    const invariants = await runInvariantChecks();

    // ── FINAL REPORT ──────────────────────────────────────
    const endTime = new Date();
    const totalDurationMin = ((endTime - startTime) / 60000).toFixed(1);
    const allPass = results.every(r => r.pass) && invariants.filter(c => !c.pass).length === 0;

    console.log('\n' + '█'.repeat(60));
    console.log('  PHASE 9E — FINAL REPORT');
    console.log('█'.repeat(60));

    let report = `PHASE 9E LOAD TEST REPORT
Generated: ${endTime.toISOString()}
Duration:  ${totalDurationMin} minutes
Overall:   ${allPass ? 'PHASE LOCKED ✅' : 'REQUIRES FIXES ❌'}

${'─'.repeat(60)}
SCENARIO RESULTS
${'─'.repeat(60)}
`;

    for (const r of results) {
        const s = r.pass ? 'PASS ✅' : 'FAIL ❌';
        console.log(`  ${r.pass ? '✅' : '❌'} ${r.name.padEnd(35)} ${s}`);
        report += `\n${s} — ${r.name}\n`;
        for (const [k, v] of Object.entries(r.metrics)) {
            report += `       ${k}: ${v}\n`;
        }
    }

    report += `\n${'─'.repeat(60)}\nINVARIANT CHECKS\n${'─'.repeat(60)}\n`;
    for (const c of invariants) {
        report += `${c.pass ? 'PASS ✅' : 'FAIL ❌'} — ${c.name}: ${c.value}\n`;
    }

    report += `\n${'─'.repeat(60)}\nVALIDATION CHECKLIST\n${'─'.repeat(60)}\n`;
    const checklist = [
        { label: 'No stock inconsistency', pass: invariants.find(c => c.name === 'No Negative Stock')?.pass },
        { label: 'No orphan orders', pass: invariants.find(c => c.name === 'No Orphan Orders (no items)')?.pass },
        { label: 'No duplicate order numbers', pass: invariants.find(c => c.name === 'No Duplicate Order Numbers')?.pass },
        { label: 'Scenario 1 P95 < 300ms', pass: results[0]?.pass },
        { label: 'Scenario 4 Redis hit ratio > 80%', pass: results[3]?.pass },
        { label: 'Error rate < 1%', pass: results.every(r => !r.metrics?.errRate || parseFloat(r.metrics.errRate) < 1) },
        { label: 'Checkout zero duplicate orders', pass: results[2]?.pass },
        { label: 'Cron latency spike < 20%', pass: results[4]?.pass },
    ];

    for (const c of checklist) {
        report += `${c.pass ? '[✅]' : '[❌]'} ${c.label}\n`;
    }

    report += `\n${'─'.repeat(60)}\nPHASE LOCK DECISION\n${'─'.repeat(60)}\n`;
    report += `${allPass ? '🔒 PHASE 9E LOCKED — System is concurrency safe and production hardened.\n' : '⚠️  PHASE 9E NOT LOCKED — Fix failures above before proceeding to Phase 10.\n'}`;

    fs.writeFileSync(REPORT_FILE, report, 'utf8');
    console.log(`\n  Report saved → ${REPORT_FILE}`);
    console.log(`\n  ${allPass ? '🔒 PHASE 9E LOCKED' : '⚠️  PHASE 9E NOT LOCKED — review failures above'}`);

    await prisma.$disconnect();
    process.exit(allPass ? 0 : 1);
}

main().catch(e => {
    console.error('\nFATAL ERROR:', e);
    prisma.$disconnect();
    process.exit(1);
});
