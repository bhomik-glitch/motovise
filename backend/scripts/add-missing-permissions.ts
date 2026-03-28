
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_PERMISSIONS = [
    'order.read',
    'order.update',
    'category.create',
    'category.update',
    'category.delete'
];

async function main() {
    console.log('🔧 Adding missing permissions...');

    const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
    if (!adminRole) throw new Error('Admin role not found');

    for (const key of NEW_PERMISSIONS) {
        // 1. Create Permission if not exists
        let perm = await prisma.permission.findUnique({ where: { key } });
        if (!perm) {
            perm = await prisma.permission.create({
                data: {
                    key,
                    description: `Permission for ${key}`
                }
            });
            console.log(`   + Created permission: ${key}`);
        } else {
            console.log(`   = Permission exists: ${key}`);
        }

        // 2. Assign to Admin
        const exists = await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: perm.id
                }
            }
        });

        if (!exists) {
            await prisma.rolePermission.create({
                data: {
                    roleId: adminRole.id,
                    permissionId: perm.id,
                    assignedBy: 'FIX_SCRIPT'
                }
            });
            console.log(`   -> Assigned ${key} to Admin`);
        } else {
            console.log(`   -> Already assigned to Admin`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
