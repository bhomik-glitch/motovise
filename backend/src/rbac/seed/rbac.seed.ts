
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const ROLES = [
    'Admin',
    'Manager',
    'Product Manager',
    'Inventory Manager',
    'Support',
    'Finance',
    'Analyst',
    'Developer',
    'Customer', // Added default role for backfill safety
];

const PERMISSIONS = [
    'product.create',
    'product.update',
    'product.delete',
    'price.change.request',
    'price.change.approve.manager',
    'price.change.approve.admin',
    'refund.initiate',
    'refund.approve.manager',
    'refund.approve.finance',
    'user.manage',
    'audit.view',
    'analytics.view',
    'export.bulk',
    // Phase 8E: Manual Review
    'order.review.view',   // View the review queue (Admin, Finance, Support)
    'order.review.action', // Take review actions (Admin, Finance only)
    'ALERT_VIEW',           // Phase A8: View alerts monitoring
    'fraud.view',          // Phase A9: View risk & fraud
    'fraud.config.update', // Phase A9: Update fraud config
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
    'Admin': PERMISSIONS, // Admin gets all permissions including order.review.view + order.review.action
    'Manager': [
        'product.create', 'product.update', 'product.delete',
        'price.change.approve.manager',
        'refund.approve.manager',
        'user.manage',
        'analytics.view',
        'export.bulk'
    ],
    'Product Manager': [
        'product.create', 'product.update',
        'price.change.request'
    ],
    'Inventory Manager': [
        'product.update', // Restricted to stock/inventory ideally, but basic permission for now
        'export.bulk'
    ],
    'Support': [
        'user.manage', // View users
        'refund.initiate',
        'order.review.view',   // Phase 8E: Support can view queue but NOT take action
    ],
    'Finance': [
        'refund.approve.finance',
        'analytics.view',
        'export.bulk',
        'order.review.view',   // Phase 8E
        'order.review.action', // Phase 8E
    ],
    'Analyst': [
        'analytics.view',
        'export.bulk',
        'audit.view',
        // Phase 8E: Analyst has NO review permissions
    ],
    'Developer': [
        'audit.view',
        'analytics.view'
    ],
    'Customer': [] // No specific permissions by default in this matrix
};

async function main() {
    console.log('Seeding RBAC...');

    // 1. Seed Permissions
    for (const key of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { key },
            update: {},
            create: { key, description: `Permission for ${key}` },
        });
    }
    console.log('Permissions seeded.');

    // 2. Seed Roles
    for (const name of ROLES) {
        await prisma.role.upsert({
            where: { name },
            update: {},
            create: { name, description: `Role ${name}` },
        });
    }
    console.log('Roles seeded.');

    // 3. Assign Permissions to Roles (RolePermission)
    for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
        const role = await prisma.role.findUnique({ where: { name: roleName } });
        if (!role) continue;

        for (const permKey of perms) {
            const permission = await prisma.permission.findUnique({ where: { key: permKey } });
            if (!permission) continue;

            // Idempotent insert: checking if exists or using createMany with skipDuplicates?
            // Prisma createMany skipDuplicates is efficient.
            // But here we iterate. Let's try upsert or ignore constraint error.
            // Better: check existence.
            const exists = await prisma.rolePermission.findUnique({
                where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
            });

            if (!exists) {
                await prisma.rolePermission.create({
                    data: {
                        roleId: role.id,
                        permissionId: permission.id,
                        assignedBy: 'SYSTEM_SEED',
                    },
                });
            }
        }
    }
    console.log('RolePermissions seeded.');

    // 4. Backfill Users
    // Note: roleId is required in schema; users without a valid roleId would have
    // failed validation at creation. We use a raw query approach to find users
    // whose roleId does not match any existing role (orphaned), instead of null-filter.
    console.log('Backfilling Users...');
    const allRoleIds = (await prisma.role.findMany({ select: { id: true } })).map(r => r.id);
    const usersWithoutRole = await prisma.user.findMany({
        where: { roleId: { notIn: allRoleIds.length > 0 ? allRoleIds : ['__none__'] } },
    });

    console.log(`Found ${usersWithoutRole.length} users without roleId.`);

    // Mapping from Enum to Role Name
    const enumMap: Record<UserRole, string> = {
        [UserRole.ADMIN]: 'Admin',
        [UserRole.MANAGER]: 'Manager',
        [UserRole.CUSTOMER]: 'Customer',
    };

    for (const user of usersWithoutRole) {
        const targetRoleName = enumMap[user.role] || 'Customer';
        const role = await prisma.role.findUnique({ where: { name: targetRoleName } });

        if (role) {
            await prisma.user.update({
                where: { id: user.id },
                data: { roleId: role.id },
            });
            // console.log(`Assigned ${targetRoleName} to user ${user.email}`);
        } else {
            console.error(`Role ${targetRoleName} not found cleanly for user ${user.id}`);
        }
    }
    console.log('Backfill complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
