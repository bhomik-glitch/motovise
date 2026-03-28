
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking migration history...');

        // Check _prisma_migrations table
        // Note: We use $queryRawUnsafe because _prisma_migrations is internal and not in our schema
        const migrations = await prisma.$queryRawUnsafe('SELECT * FROM "_prisma_migrations" ORDER BY started_at DESC LIMIT 5');
        console.log('Recent migrations:', migrations);

        // Drop the problematic migration record if it exists
        const deleted = await prisma.$executeRawUnsafe("DELETE FROM \"_prisma_migrations\" WHERE migration_name = '20260219075717_init_rbac'");
        console.log(`Deleted ${deleted} records from _prisma_migrations.`);

        // Check for leftover tables/types
        const tables = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('roles', 'permissions', 'role_permissions', 'AuthRole', 'Role')");
        console.log('Existing tables:', tables);

        const types = await prisma.$queryRawUnsafe("SELECT typname FROM pg_type WHERE typname IN ('Role', 'UserRole', 'RoleEnum')");
        console.log('Existing types:', types);

        // Only if necessary: DROP leftovers?
        // Be careful not to drop UserRole if it's the one we want to keep (renamed from Role)
        // But currently in DB it should be 'Role' (the enum).

    } catch (e: any) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
