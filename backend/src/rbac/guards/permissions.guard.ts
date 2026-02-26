
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../rbac.service';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    private readonly logger = new Logger(PermissionsGuard.name);

    constructor(
        private reflector: Reflector,
        private rbacService: RbacService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const userId = user.userId || user.sub;

        if (!userId) {
            this.logger.error('User object missing userId/sub property');
            return false;
        }

        // Dynamic Permission Check
        const userPermissions = await this.rbacService.getUserPermissions(userId);
        const roleName = await this.rbacService.getRoleName(userId);

        // Check if user has ALL required permissions? Or ANY?
        // Usually RBAC decorator is "Require ALL listed" or "Require specific capability".
        // If multiple args @RequirePermissions('A', 'B'), typically it means A AND B?
        // Or A OR B? NestJS docs usually imply matching required roles.
        // Let's assume ANY for now unless specified.
        // "Must support multiple permissions" - "Compare required permission keys".
        // If I require 'product.create', user must have it.
        // If I require 'product.create' AND 'product.publish', user must have both?
        // Standard logic: AND. User needs to meet all requirements.

        // HOWEVER, typical usage might be "Require one of these".
        // Let's implement AND logic: User must have ALL permissions listed in the specific decorator call.
        // But if we want OR, we usually pass array of arrays?
        // Let's go with: User must have ALL permissions specified.

        const missingPermissions = requiredPermissions.filter(p => !userPermissions.includes(p));

        // Audit Context
        request.auditContext = {
            userId: user.userId,
            role: roleName,
            permissionsChecked: requiredPermissions,
            accessGranted: missingPermissions.length === 0,
            missingPermissions: missingPermissions // detail
        };

        if (missingPermissions.length > 0) {
            this.logger.warn(`User ${user.userId} (Role: ${roleName}) denied access. Missing: ${missingPermissions.join(', ')}`);
            throw new ForbiddenException(`Missing required permissions: ${missingPermissions.join(', ')}`);
        }

        return true;
    }
}
