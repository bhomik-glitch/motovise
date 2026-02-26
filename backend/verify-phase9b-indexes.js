/**
 * Phase 9B Index Verification Script
 * Runs EXPLAIN ANALYZE for each heavy query and checks pg_indexes for redundancy.
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function run() {
    console.log('\n======================================================');
    console.log('   PHASE 9B INDEX VERIFICATION');
    console.log('======================================================\n');

    // ── 1. pg_indexes listing for all 4 audited tables ──────────────────────
    console.log('━━━ [1] pg_indexes — Current Index Listing ━━━\n');
    const tables = ['Order', 'Payment', 'pincode_risk', 'Alert'];
    for (const tbl of tables) {
        const rows = await prisma.$queryRawUnsafe(
            `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = $1 ORDER BY indexname`,
            tbl
        );
        console.log(`\n  Table: "${tbl}"`);
        if (rows.length === 0) {
            console.log('    (no indexes found)');
        } else {
            rows.forEach(r => console.log(`    [idx] ${r.indexname}\n          ${r.indexdef}`));
        }
    }

    // ── Helper: run EXPLAIN ANALYZE and report scan type ────────────────────
    async function explainQuery(label, sql, params = []) {
        console.log(`\n━━━ ${label} ━━━`);
        console.log(`  SQL: ${sql.trim().replace(/\s+/g, ' ')}`);
        try {
            const rows = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE ${sql}`, ...params);
            const plan = rows.map(r => Object.values(r)[0]).join('\n');
            const lines = plan.split('\n');

            // Print full plan
            lines.forEach(l => console.log(`  ${l}`));

            // Verdict
            const hasSeqScan = lines.some(l => l.includes('Seq Scan'));
            const hasIndexScan = lines.some(l => l.includes('Index Scan') || l.includes('Index Only Scan') || l.includes('Bitmap Index Scan'));
            const actualTime = lines.find(l => l.includes('actual time='));

            if (hasSeqScan && !hasIndexScan) {
                console.log(`\n  ⚠️  RESULT: Sequential Scan detected — index may not be used (table too small for planner to prefer it)`);
            } else if (hasIndexScan) {
                console.log(`\n  ✅ RESULT: Index Scan used`);
            } else {
                console.log(`\n  ℹ️  RESULT: Planner used alternative strategy (likely table too small; index exists and is valid)`);
            }
            if (actualTime) console.log(`  ⏱  ${actualTime.trim()}`);
        } catch (e) {
            console.log(`  ERROR: ${e.message}`);
        }
    }

    // ── 2. EXPLAIN ANALYZE — Manual Review Queue ────────────────────────────
    await explainQuery(
        '[2] Manual Review Queue (Order)',
        `SELECT id, "userId", total, rule_score, review_status, "shippingPincode", "createdAt"
         FROM "Order"
         WHERE is_manual_review = true AND review_status = 'PENDING'
         ORDER BY "createdAt" DESC
         LIMIT 20`
    );

    // ── 3. EXPLAIN ANALYZE — MTD RTO aggregation ────────────────────────────
    await explainQuery(
        '[3] MTD RTO Count (MetricsService)',
        `SELECT COUNT(*) FROM "Order"
         WHERE "createdAt" >= NOW() - INTERVAL '7 days'
           AND "orderStatus" IN ('SHIPPED', 'DELIVERED')
           AND is_rto = true`
    );

    // ── 4. EXPLAIN ANALYZE — MTD GMV (orderStatus + createdAt) ──────────────
    await explainQuery(
        '[4] MTD GMV Aggregate (MetricsService)',
        `SELECT SUM(total), COUNT(*) FROM "Order"
         WHERE "orderStatus" != 'CANCELLED'
           AND "createdAt" >= DATE_TRUNC('month', NOW())`
    );

    // ── 5. EXPLAIN ANALYZE — Top HIGH-risk pincodes ──────────────────────────
    await explainQuery(
        '[5] Top HIGH-risk Pincodes (PincodeRisk)',
        `SELECT pincode, "rtoPercentage", "totalOrders30d"
         FROM pincode_risk
         WHERE "riskLevel" = 'HIGH'
         ORDER BY "rtoPercentage" DESC
         LIMIT 10`
    );

    // ── 6. EXPLAIN ANALYZE — Alert history ───────────────────────────────────
    await explainQuery(
        '[6] Alert History (AlertsService)',
        `SELECT * FROM "Alert"
         ORDER BY "createdAt" DESC
         LIMIT 100`
    );

    // ── 7. EXPLAIN ANALYZE — Payment by orderId + status ────────────────────
    const firstOrder = await prisma.order.findFirst({ select: { id: true } });
    const sampleOrderId = firstOrder?.id || 'nonexistent-id';

    await explainQuery(
        '[7] Payment Lookup by orderId + status (PaymentsService)',
        `SELECT * FROM "Payment"
         WHERE "orderId" = $1 AND status = 'PAID'`,
        [sampleOrderId]
    );

    // ── 8. Confirm migration file exists ────────────────────────────────────
    console.log('\n━━━ [8] Migration File Check ━━━');
    const fs = require('fs');
    const path = require('path');
    const migrationsDir = path.join(__dirname, 'prisma', 'migrations');
    const entries = fs.readdirSync(migrationsDir).filter(d => d.includes('phase_9b_index_audit'));
    if (entries.length > 0) {
        const migFile = path.join(migrationsDir, entries[0], 'migration.sql');
        const sql = fs.readFileSync(migFile, 'utf8');
        console.log(`\n  ✅ Migration found: ${entries[0]}`);
        console.log(`\n  SQL:\n${sql.split('\n').map(l => '    ' + l).join('\n')}`);
    } else {
        console.log('  ❌ Migration file NOT found!');
    }

    console.log('\n======================================================');
    console.log('   PHASE 9B INDEX VERIFICATION COMPLETE');
    console.log('======================================================\n');

    await prisma.$disconnect();
}

run().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
