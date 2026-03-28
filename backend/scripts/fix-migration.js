
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking migration history...');

        // Check _prisma_migrations table
        const migrations = await prisma.$queryRawUnsafe('SELECT * FROM "_prisma_migrations" ORDER BY started_at DESC LIMIT 5');
        console.log('Recent migrations:', migrations);

        // Drop the problematic migration record if it exists
        const deleted = await prisma.$executeRawUnsafe("DELETE FROM \"_prisma_migrations\" WHERE migration_name = '20260219075717_init_rbac'");
        console.log(`Deleted ${deleted} records from _prisma_migrations.`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
