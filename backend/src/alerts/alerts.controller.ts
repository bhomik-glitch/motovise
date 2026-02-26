import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('Admin Alerts')
@Controller('admin/alerts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('analytics.view')
@ApiBearerAuth()
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    @Get()
    @ApiOperation({
        summary: 'Get Alert History',
        description: 'Read-only history of 100 most recent ACTIVE and RESOLVED executive alerts. Requires `analytics.view` permission.',
    })
    @ApiResponse({ status: 200, description: 'Alert history returned successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized — Invalid or missing JWT' })
    @ApiResponse({ status: 403, description: 'Forbidden — Missing `analytics.view` permission' })
    async getAlertHistory() {
        return this.alertsService.getAlertHistory();
    }
}
