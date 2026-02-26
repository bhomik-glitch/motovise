
import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @ApiOperation({ summary: 'List all users (User Manager)' })
    @RequirePermissions('user.manage')
    async findAll() {
        this.logger.log('Listing all users');
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                roleRef: {
                    select: { name: true }
                },
                createdAt: true,
            }
        });

        return users.map(u => ({
            ...u,
            role: u.roleRef?.name || 'Unknown'
        }));
    }
}
