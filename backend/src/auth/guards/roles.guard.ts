import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Validate JWT payload structure
        if (!user || !user.sub) {
            return false;
        }

        // SECURITY: Validate role from database, not JWT payload
        // This prevents role escalation attacks where an attacker
        // crafts a JWT with role: "ADMIN" for a non-admin user ID
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.sub }, // JWT strategy returns 'sub', not 'id'
            select: { role: true },
        });

        if (!dbUser) {
            return false;
        }

        return requiredRoles.some((role) => dbUser.role === role);
    }
}
