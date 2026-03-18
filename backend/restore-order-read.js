"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 Starting permission restoration...');
    try {
        const permission = await prisma.permission.findUnique({
            where: { key: 'order.read' },
        });
        if (!permission) {
            console.error('❌ Error: Permission with key "order.read" not found in database.');
            return;
        }
        console.log(`✅ Found permission: ${permission.key} (ID: ${permission.id})`);
        const role = await prisma.role.findUnique({
            where: { name: 'Admin' },
        });
        if (!role) {
            console.error('❌ Error: Role with name "Admin" not found in database.');
            return;
        }
        console.log(`✅ Found role: ${role.name} (ID: ${role.id})`);
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
        await prisma.rolePermission.create({
            data: {
                roleId: role.id,
                permissionId: permission.id,
                assignedBy: 'SYSTEM_RESTORE',
            },
        });
        console.log('✨ Success: "order.read" permission has been restored to the "Admin" role.');
    }
    catch (error) {
        console.error('❌ An unexpected error occurred:');
        console.error(error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=restore-order-read.js.map