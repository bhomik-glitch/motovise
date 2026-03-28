import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminRbacService {
    private readonly logger = new Logger(AdminRbacService.name);

    constructor(private prisma: PrismaService) { }

    async getRoles() {
        return this.prisma.role.findMany({
            include: {
                _count: {
                    select: { permissions: true }
                },
                permissions: {
                    include: { permission: true }
                }
            }
        });
    }

    async getRolePermissions(roleId: string) {
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
            include: {
                permissions: {
                    include: { permission: true }
                }
            }
        });

        return role ? role.permissions.map(rp => rp.permission) : [];
    }

    async updateRolePermissions(roleId: string, permissionIds: string[], currentUser: any) {
        // Self-demotion protection for permissions
        const user = await this.prisma.user.findUnique({ where: { id: currentUser.sub } });

        if (user && user.roleId === roleId) {
            const currentPermissions = await this.getRolePermissions(roleId);
            const currentPermissionIds = currentPermissions.map(p => p.id);

            const criticalPermissions = ['rbac.manage', 'system.config', 'orders.manage', 'manual_review.handle'];

            // Check if any critical permission is being removed
            for (const criticalKey of criticalPermissions) {
                const hasCritical = currentPermissions.some(p => p.key === criticalKey);
                if (hasCritical) {
                    // We need the ID of this critical permission to see if it's in the new list
                    const criticalId = currentPermissions.find(p => p.key === criticalKey)?.id;
                    if (criticalId && !permissionIds.includes(criticalId)) {
                        throw new ForbiddenException(`You cannot remove the ${criticalKey} permission from your own role.`);
                    }
                }
            }
        }

        const existingPermissions = await this.getRolePermissions(roleId);

        return this.prisma.$transaction(async (tx) => {
            // Delete existing relations
            await tx.rolePermission.deleteMany({
                where: { roleId }
            });

            // Create new relations
            if (permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissionIds.map(permissionId => ({
                        roleId,
                        permissionId
                    }))
                });
            }

            // Audit Logging Hook (Phase 10A Preparation)
            // await auditService.log({
            //   actorId: currentUser.id,
            //   actionType: 'RBAC_PERMISSION_UPDATE',
            //   entityType: 'ROLE',
            //   entityId: roleId,
            //   beforeSnapshot: existingPermissions,
            //   afterSnapshot: permissionIds
            // })

            this.logger.log(`Updated permissions for role ${roleId} by user ${currentUser.id}`);

            return { success: true };
        });
    }

    async getUsers() {
        return this.prisma.user.findMany({
            include: {
                roleRef: true
            }
        });
    }

    async assignUserRole(userId: string, roleId: string, currentUserId: string) {
        // Self-demotion protection for role assignment
        if (userId === currentUserId) {
            throw new ForbiddenException('You cannot modify your own role assignment.');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { roleId },
            include: { roleRef: true }
        });

        this.logger.log(`Changed role for user ${userId} to ${roleId} by admin ${currentUserId}`);

        return updatedUser;
    }
}
