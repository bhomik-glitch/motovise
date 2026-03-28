import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAnalyticsService } from './admin-analytics.service';
import { RevenueQueryDto } from './dto/revenue-query.dto';
import { TopProductsQueryDto } from './dto/top-products-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('Admin Analytics')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('analytics.view')
@ApiBearerAuth()
export class AdminAnalyticsController {
    constructor(private readonly analyticsService: AdminAnalyticsService) { }

    @Get('overview')
    getOverview() {
        return this.analyticsService.getOverview();
    }

    @Get('revenue')
    getRevenue(@Query() query: RevenueQueryDto) {
        query.validate();
        return this.analyticsService.getRevenueByDateRange(query.from, query.to);
    }

    @Get('orders')
    getOrders() {
        return this.analyticsService.getOrderStatusBreakdown();
    }

    @Get('top-products')
    getTopProducts(@Query() query: TopProductsQueryDto) {
        return this.analyticsService.getTopProducts(query.limit);
    }

    @Get('payments')
    getPayments() {
        return this.analyticsService.getPaymentBreakdown();
    }
}
