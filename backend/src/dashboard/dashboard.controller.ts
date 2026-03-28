import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('CEO Dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('analytics.view')
@ApiBearerAuth()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('ceo')
    @ApiOperation({
        summary: 'Get CEO Mini Dashboard Metrics',
        description: 'Read-only aggregations optimized for executive overview. Requires `analytics.view` permission.',
    })
    @ApiResponse({
        status: 200,
        description: 'Aggregated metrics returned successfully',
        schema: {
            example: {
                gmv_mtd: 125000.50,
                orders_mtd: 450,
                prepaid_percentage_mtd: 65.50,
                rto_percentage_7d: 12.00,
                chargeback_percentage_30d: 1.50,
                avg_shipping_cost_30d: 55.00,
                manual_review_pending_count: 5,
                top_high_risk_pincodes: [
                    { pincode: '400001', rtoPercentage: 45.00, totalOrders: 100 }
                ]
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized — Invalid or missing JWT' })
    @ApiResponse({ status: 403, description: 'Forbidden — Missing `analytics.view` permission' })
    async getCeoDashboard() {
        return this.dashboardService.getCeoDashboard();
    }
}
