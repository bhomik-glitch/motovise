import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAnalyticsService } from './admin-analytics.service';
import { RevenueQueryDto } from './dto/revenue-query.dto';
import { TopProductsQueryDto } from './dto/top-products-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin Analytics')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminAnalyticsController {
    constructor(private readonly analyticsService: AdminAnalyticsService) { }

    @Get('overview')
    @ApiOperation({
        summary: 'Get analytics overview (Admin only)',
        description:
            'Returns total revenue, orders, users, products, and average order value',
    })
    getOverview() {
        return this.analyticsService.getOverview();
    }

    @Get('revenue')
    @ApiOperation({
        summary: 'Get revenue by date range (Admin only)',
        description: 'Returns revenue grouped by day within the specified date range (max 365 days)',
    })
    getRevenue(@Query() query: RevenueQueryDto) {
        query.validate();
        return this.analyticsService.getRevenueByDateRange(query.from, query.to);
    }

    @Get('orders')
    @ApiOperation({
        summary: 'Get order status breakdown (Admin only)',
        description: 'Returns count of orders by status',
    })
    getOrders() {
        return this.analyticsService.getOrderStatusBreakdown();
    }

    @Get('top-products')
    @ApiOperation({
        summary: 'Get top selling products (Admin only)',
        description: 'Returns top N products by quantity sold (from PAID orders only)',
    })
    getTopProducts(@Query() query: TopProductsQueryDto) {
        return this.analyticsService.getTopProducts(query.limit);
    }

    @Get('payments')
    @ApiOperation({
        summary: 'Get payment breakdown (Admin only)',
        description: 'Returns payment counts by gateway and status with success rate',
    })
    getPayments() {
        return this.analyticsService.getPaymentBreakdown();
    }
}
