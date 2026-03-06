import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting permission restoration...');

    try {
        // 1. Find the "order.read" permission
        const permission = await prisma.permission.findUnique({
            where: { key: 'order.read' },
        });

        if (!permission) {
            console.error('❌ Error: Permission with key "order.read" not found in database.');
            return;
        }

        console.log(`✅ Found permission: ${permission.key} (ID: ${permission.id})`);

        // 2. Find the "Admin" role
        const role = await prisma.role.findUnique({
            where: { name: 'Admin' },
        });

        if (!role) {
            console.error('❌ Error: Role with name "Admin" not found in database.');
            return;
        }

        console.log(`✅ Found role: ${role.name} (ID: ${role.id})`);

        // 3. Check if RolePermission already exists
        const existingRelation = await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: {
                    roleId: role.id,
                    permissionId: permission.id,
                },
            },
        });

        if (existingRelation) {
            console.log('ℹ️  Info: "order.read" is already assigned to the "Admin" role. No changes made.');
            return;
        }

        // 4. Create the RolePermission record
        await prisma.rolePermission.create({
            data: {
                roleId: role.id,
                permissionId: permission.id,
                assignedBy: 'SYSTEM_RESTORE',
            },
        });

        console.log('✨ Success: "order.read" permission has been restored to the "Admin" role.');
    } catch (error) {
        console.error('❌ An unexpected error occurred:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
