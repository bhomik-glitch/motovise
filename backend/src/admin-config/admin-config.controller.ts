import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { AdminConfigService } from './admin-config.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@ApiTags('Admin System Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/config')
export class AdminConfigController {
    constructor(private readonly adminConfigService: AdminConfigService) { }

    @Get()
    @RequirePermissions('SYSTEM_CONFIG_EDIT')
    @ApiOperation({ summary: 'Get System Configuration' })
    async getConfig() {
        return this.adminConfigService.getConfig();
    }

    @Patch()
    @RequirePermissions('SYSTEM_CONFIG_EDIT')
    @ApiOperation({ summary: 'Update System Configuration' })
    async updateConfig(@Body() updateConfigDto: UpdateConfigDto) {
        return this.adminConfigService.updateConfig(updateConfigDto);
    }
}
