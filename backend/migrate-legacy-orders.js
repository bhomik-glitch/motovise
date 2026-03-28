/**
 * Migrate Legacy Orders
 * Sets stockDeducted=true for all CONFIRMED orders created before the migration
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateLegacyOrders() {
    console.log('='.repeat(80));
    console.log('  LEGACY ORDER MIGRATION');
    console.log('='.repeat(80));
    console.log();

    try {
        // Find all CONFIRMED orders with stockDeducted = false
        const legacyOrders = await prisma.order.findMany({
            where: {
                orderStatus: 'CONFIRMED',
                stockDeducted: false,
            },
            select: {
                id: true,
                orderNumber: true,
                createdAt: true,
            },
        });

        console.log(`Found ${legacyOrders.length} legacy CONFIRMED orders without stockDeducted flag`);
        console.log();

        if (legacyOrders.length === 0) {
            console.log('✅ No legacy orders to migrate');
            return;
        }

        console.log('These orders were created BEFORE the stockDeducted migration:');
        legacyOrders.forEach(order => {
            console.log(`  - ${order.orderNumber} (${order.createdAt.toISOString()})`);
        });
        console.log();

        console.log('Migrating legacy orders...');

        // Update all legacy CONFIRMED orders to have stockDeducted = true
        const result = await prisma.order.updateMany({
            where: {
                orderStatus: 'CONFIRMED',
                stockDeducted: false,
            },
            data: {
                stockDeducted: true,
                stockDeductedAt: new Date(),
            },
        });

        console.log(`✅ Migrated ${result.count} legacy orders`);
        console.log();

        // Verify migration
        const remaining = await prisma.order.count({
            where: {
                orderStatus: 'CONFIRMED',
                stockDeducted: false,
            },
        });

        if (remaining === 0) {
            console.log('✅ Migration successful - all CONFIRMED orders now have stockDeducted = true');
        } else {
            console.log(`⚠️  Warning: ${remaining} orders still have stockDeducted = false`);
        }

        console.log();
        console.log('='.repeat(80));
        console.log('  MIGRATION COMPLETE');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateLegacyOrders()
    .then(() => {
        console.log('\nYou can now re-run: node validate-invariants.js');
        process.exit(0);
    })
    .catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
