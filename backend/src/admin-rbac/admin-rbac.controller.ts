import { Controller, Get, Patch, Param, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { AdminRbacService } from './admin-rbac.service';
import { Request } from 'express';

@ApiTags('Admin RBAC')
@Controller('admin/rbac')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminRbacController {
    constructor(private readonly adminRbacService: AdminRbacService) { }

    @Get('roles')
    @RequirePermissions('rbac.manage')
    @ApiOperation({ summary: 'Get all roles' })
    async getRoles() {
        return this.adminRbacService.getRoles();
    }

    @Get('roles/:id/permissions')
    @RequirePermissions('rbac.manage')
    @ApiOperation({ summary: 'Get permissions for a role' })
    async getRolePermissions(@Param('id') roleId: string) {
        return this.adminRbacService.getRolePermissions(roleId);
    }

    @Patch('roles/:id/permissions')
    @RequirePermissions('rbac.manage')
    @ApiOperation({ summary: 'Update permissions for a role' })
    async updateRolePermissions(
        @Param('id') roleId: string,
        @Body() body: { permissions: string[] },
        @Req() req: any
    ) {
        if (!body.permissions || !Array.isArray(body.permissions)) {
            throw new ForbiddenException('Permissions array is required');
        }
        return this.adminRbacService.updateRolePermissions(roleId, body.permissions, req.user);
    }

    @Get('users')
    @RequirePermissions('rbac.manage')
    @ApiOperation({ summary: 'Get all users and their roles' })
    async getUsers() {
        // Here we format the response to match the expected format for the UI
        const users = await this.adminRbacService.getUsers();
        return users.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            roleRef: u.roleRef
        }));
    }

    @Patch('users/:id/role')
    @RequirePermissions('rbac.manage')
    @ApiOperation({ summary: 'Assign a role to a user' })
    async assignUserRole(
        @Param('id') userId: string,
        @Body() body: { roleId: string },
        @Req() req: any
    ) {
        if (!body.roleId) {
            throw new ForbiddenException('Role ID is required');
        }
        return this.adminRbacService.assignUserRole(userId, body.roleId, req.user.sub);
    }
}
