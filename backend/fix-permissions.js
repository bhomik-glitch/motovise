const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const permKey = 'ALERT_VIEW';

    // Upsert the permission
    const permission = await prisma.permission.upsert({
        where: { key: permKey },
        update: {},
        create: { key: permKey, description: 'Phase A8: View alerts monitoring' },
    });

    console.log(`Permission ${permKey} ensured.`);

    // Find Admin role
    const adminRole = await prisma.role.findUnique({
        where: { name: 'Admin' },
    });

    if (!adminRole) {
        console.error('Admin role not found');
        return;
    }

    // Assign to Admin role
    const roleId_permissionId = { roleId: adminRole.id, permissionId: permission.id };
    await prisma.rolePermission.upsert({
        where: { roleId_permissionId },
        update: {},
        create: {
            ...roleId_permissionId,
            assignedBy: 'SYSTEM_FIX',
        },
    });

    console.log(`Permission ${permKey} assigned to Admin role.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
