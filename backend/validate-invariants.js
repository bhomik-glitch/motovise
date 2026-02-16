/**
 * SQL Invariant Validation
 * Executes all 4 invariant queries and reports results
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validateInvariants() {
    console.log('='.repeat(80));
    console.log('  SQL INVARIANT VALIDATION');
    console.log('='.repeat(80));
    console.log();

    try {
        // ========================================
        // INVARIANT A: No CONFIRMED without stockDeducted
        // ========================================
        console.log('INVARIANT A: No CONFIRMED order without stock deduction');
        console.log('-'.repeat(80));

        const invariantA = await prisma.$queryRaw`
            SELECT 
                id,
                "orderNumber",
                "orderStatus",
                "stockDeducted",
                "createdAt"
            FROM "Order"
            WHERE "orderStatus" = 'CONFIRMED'
            AND "stockDeducted" = false
        `;

        console.log(`Query: SELECT * FROM "Order" WHERE orderStatus = 'CONFIRMED' AND stockDeducted = false`);
        console.log(`Result: ${invariantA.length} rows`);
        if (invariantA.length > 0) {
            console.log('❌ FAILED - Found orders:');
            console.log(JSON.stringify(invariantA, null, 2));
        } else {
            console.log('✅ PASSED - No CONFIRMED orders without stock deduction');
        }
        console.log();

        // ========================================
        // INVARIANT B: No PAID without gatewayPaymentId
        // ========================================
        console.log('INVARIANT B: No PAID order without payment ID');
        console.log('-'.repeat(80));

        const invariantB = await prisma.$queryRaw`
            SELECT 
                id,
                "orderNumber",
                "paymentStatus",
                "gatewayPaymentId",
                "createdAt"
            FROM "Order"
            WHERE "paymentStatus" = 'PAID'
            AND "gatewayPaymentId" IS NULL
        `;

        console.log(`Query: SELECT * FROM "Order" WHERE paymentStatus = 'PAID' AND gatewayPaymentId IS NULL`);
        console.log(`Result: ${invariantB.length} rows`);
        if (invariantB.length > 0) {
            console.log('❌ FAILED - Found orders:');
            console.log(JSON.stringify(invariantB, null, 2));
        } else {
            console.log('✅ PASSED - No PAID orders without payment ID');
        }
        console.log();

        // ========================================
        // INVARIANT C: No negative stock
        // ========================================
        console.log('INVARIANT C: No negative stock');
        console.log('-'.repeat(80));

        const invariantC = await prisma.$queryRaw`
            SELECT 
                id,
                name,
                stock,
                "updatedAt"
            FROM "Product"
            WHERE stock < 0
        `;

        console.log(`Query: SELECT * FROM "Product" WHERE stock < 0`);
        console.log(`Result: ${invariantC.length} rows`);
        if (invariantC.length > 0) {
            console.log('❌ FAILED - Found products with negative stock:');
            console.log(JSON.stringify(invariantC, null, 2));
        } else {
            console.log('✅ PASSED - No products with negative stock');
        }
        console.log();

        // ========================================
        // INVARIANT D: One log per order item
        // ========================================
        console.log('INVARIANT D: Exactly one inventory log per confirmed order item');
        console.log('-'.repeat(80));

        const invariantD = await prisma.$queryRaw`
            SELECT 
                o.id as "orderId",
                o."orderNumber",
                COUNT(DISTINCT oi.id) as "orderItemCount",
                COUNT(il.id) as "inventoryLogCount"
            FROM "Order" o
            JOIN "OrderItem" oi ON oi."orderId" = o.id
            LEFT JOIN "InventoryLog" il ON il.reference = o.id AND il.type = 'SALE'
            WHERE o."orderStatus" = 'CONFIRMED'
            GROUP BY o.id, o."orderNumber"
            HAVING COUNT(DISTINCT oi.id) != COUNT(il.id)
        `;

        console.log(`Query: Check for mismatched inventory logs in CONFIRMED orders`);
        console.log(`Result: ${invariantD.length} rows`);
        if (invariantD.length > 0) {
            console.log('❌ FAILED - Found mismatches:');
            console.log(JSON.stringify(invariantD, null, 2));
        } else {
            console.log('✅ PASSED - All CONFIRMED orders have correct inventory logs');
        }
        console.log();

        // ========================================
        // SUMMARY
        // ========================================
        console.log('='.repeat(80));
        console.log('  VALIDATION SUMMARY');
        console.log('='.repeat(80));
        console.log();

        const results = [
            { name: 'Invariant A (No CONFIRMED without stockDeducted)', passed: invariantA.length === 0 },
            { name: 'Invariant B (No PAID without gatewayPaymentId)', passed: invariantB.length === 0 },
            { name: 'Invariant C (No negative stock)', passed: invariantC.length === 0 },
            { name: 'Invariant D (One log per item)', passed: invariantD.length === 0 },
        ];

        results.forEach(r => {
            console.log(`${r.passed ? '✅' : '❌'} ${r.name}`);
        });

        const allPassed = results.every(r => r.passed);

        console.log();
        console.log('='.repeat(80));
        if (allPassed) {
            console.log('✅ ALL INVARIANTS PASSED');
            console.log('🔒 PHASE 5 CAN BE LOCKED');
        } else {
            console.log('❌ SOME INVARIANTS FAILED');
            console.log('⚠️  PHASE 5 CANNOT BE LOCKED');
        }
        console.log('='.repeat(80));

        return allPassed;

    } catch (error) {
        console.error('Error executing invariant validation:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run validation
validateInvariants()
    .then(passed => {
        process.exit(passed ? 0 : 1);
    })
    .catch(error => {
        console.error('Validation failed:', error);
        process.exit(1);
    });
