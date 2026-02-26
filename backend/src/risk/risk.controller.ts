import {
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { RiskService } from './risk.service';

/**
 * RiskController — Admin-only risk engine management endpoints.
 *
 * All routes require a valid JWT + 'risk.manage' permission.
 * This endpoint is NOT public and is NOT accessible to customers.
 *
 * Phase 8F (Dashboard) will expand this controller with query endpoints.
 */
@ApiTags('Risk Engine (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/risk')
export class RiskController {
    constructor(private readonly riskService: RiskService) { }

    /**
     * POST /admin/risk/aggregate
     *
     * Manually triggers the 30-day RTO aggregation engine.
     * Intended for admin validation and on-demand re-runs.
     *
     * Protected by: JWT + 'risk.manage' permission.
     */
    @Post('aggregate')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('risk.manage')
    @ApiOperation({
        summary: 'Trigger 30-day RTO risk aggregation manually (admin only)',
    })
    async triggerAggregation(): Promise<{ message: string }> {
        await this.riskService.aggregateLast30Days();
        return { message: 'Risk aggregation completed successfully.' };
    }
}
