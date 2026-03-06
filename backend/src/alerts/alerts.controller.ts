import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { GetAlertsDto } from './dto/get-alerts.dto';

@ApiTags('Admin Alerts')
@Controller('admin/alerts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('ALERT_VIEW')
@ApiBearerAuth()
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    @Get()
    @ApiOperation({
        summary: 'Get Alerts',
        description: 'Read-only history of executive alerts with filtering and pagination. Requires `ALERT_VIEW` permission.',
    })
    @ApiResponse({ status: 200, description: 'Alert data returned successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized — Invalid or missing JWT' })
    @ApiResponse({ status: 403, description: 'Forbidden — Missing `ALERT_VIEW` permission' })
    async getAlerts(
        @Query(new ValidationPipe({ transform: true, whitelist: true }))
        query: GetAlertsDto,
    ) {
        return this.alertsService.getAlerts(query);
    }
}
