import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAnalyticsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Helper method to handle floating-point precision
     * Converts Decimal/number to fixed decimal places
     */
    private toFixedNumber(value: any, decimals: number = 2): number {
        if (value === null || value === undefined) return 0;
        const num = typeof value === 'string' ? parseFloat(value) : Number(value);
        return Number(num.toFixed(decimals));
    }

    async getOverview() {
        // Get total revenue from PAID payments only
        const revenueData = await this.prisma.payment.aggregate({
            where: { status: 'PAID' },
            _sum: { amount: true },
            _count: true,
        });

        // Get total orders
        const totalOrders = await this.prisma.order.count();

        // Get total paid orders
        const totalPaidOrders = await this.prisma.order.count({
            where: { paymentStatus: 'PAID' },
        });

        // Get total COD orders
        const totalCODOrders = await this.prisma.payment.count({
            where: { gateway: 'cod' },
        });

        // Get total users
        const totalUsers = await this.prisma.user.count();

        // Get total products
        const totalProducts = await this.prisma.product.count();

        const totalRevenue = this.toFixedNumber(revenueData._sum.amount || 0, 2);
        const averageOrderValue =
            totalPaidOrders > 0 ? totalRevenue / totalPaidOrders : 0;

        return {
            totalRevenue,
            totalOrders,
            totalPaidOrders,
            totalCODOrders,
            averageOrderValue: this.toFixedNumber(averageOrderValue, 2),
            totalUsers,
            totalProducts,
        };
    }

    async getRevenueByDateRange(from: string, to: string) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // End of day

        // Get total revenue and orders in date range
        const revenueData = await this.prisma.payment.aggregate({
            where: {
                status: 'PAID',
                createdAt: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
            _sum: { amount: true },
        });

        const totalOrders = await this.prisma.order.count({
            where: {
                paymentStatus: 'PAID',
                createdAt: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
        });

        // Get revenue grouped by day
        const orders = await this.prisma.order.findMany({
            where: {
                paymentStatus: 'PAID',
                createdAt: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
            select: {
                createdAt: true,
                total: true,
            },
        });

        // Group by date
        const revenueByDay = orders.reduce((acc, order) => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { revenue: 0, orders: 0 };
            }
            acc[date].revenue += Number(order.total);
            acc[date].orders += 1;
            return acc;
        }, {} as Record<string, { revenue: number; orders: number }>);

        const revenueByDayArray = Object.entries(revenueByDay).map(
            ([date, data]) => ({
                date,
                revenue: this.toFixedNumber(data.revenue, 2),
                orders: data.orders,
            }),
        );

        return {
            totalRevenue: this.toFixedNumber(revenueData._sum.amount || 0, 2),
            totalOrders,
            revenueByDay: revenueByDayArray.sort((a, b) =>
                a.date.localeCompare(b.date),
            ),
        };
    }

    async getOrderStatusBreakdown() {
        const breakdown = await this.prisma.order.groupBy({
            by: ['orderStatus'],
            _count: true,
        });

        // Convert to object with all statuses
        const result = {
            PENDING: 0,
            CONFIRMED: 0,
            PROCESSING: 0,
            SHIPPED: 0,
            DELIVERED: 0,
            CANCELLED: 0,
            REFUNDED: 0,
        };

        breakdown.forEach((item) => {
            result[item.orderStatus] = item._count;
        });

        return result;
    }

    async getTopProducts(limit: number = 10) {
        // Use raw SQL for efficient database-level aggregation
        // This scales to 100k+ orders without loading all data into memory
        const topProducts = await this.prisma.$queryRaw<
            Array<{
                productId: string;
                productName: string;
                totalQuantitySold: bigint;
                totalRevenueGenerated: any; // Decimal type
            }>
        >`
      SELECT 
        oi."productId",
        oi."productName",
        SUM(oi.quantity)::bigint as "totalQuantitySold",
        SUM(oi."totalPrice") as "totalRevenueGenerated"
      FROM "OrderItem" oi
      INNER JOIN "Order" o ON oi."orderId" = o.id
      WHERE o."paymentStatus" = 'PAID'
      GROUP BY oi."productId", oi."productName"
      ORDER BY SUM(oi.quantity) DESC
      LIMIT ${limit}
    `;

        // Convert BigInt and Decimal to numbers with precision handling
        return topProducts.map((p) => ({
            productId: p.productId,
            productName: p.productName,
            totalQuantitySold: Number(p.totalQuantitySold),
            totalRevenueGenerated: this.toFixedNumber(p.totalRevenueGenerated, 2),
        }));
    }

    async getPaymentBreakdown() {
        // Count by gateway
        const gatewayBreakdown = await this.prisma.payment.groupBy({
            by: ['gateway'],
            _count: true,
        });

        // Count by status
        const statusBreakdown = await this.prisma.payment.groupBy({
            by: ['status'],
            _count: true,
        });

        const gatewayCounts = {
            mockCount: 0,
            codCount: 0,
            razorpayCount: 0,
        };

        gatewayBreakdown.forEach((item) => {
            if (item.gateway === 'mock') gatewayCounts.mockCount = item._count;
            if (item.gateway === 'cod') gatewayCounts.codCount = item._count;
            if (item.gateway === 'razorpay')
                gatewayCounts.razorpayCount = item._count;
        });

        const statusCounts = {
            paidCount: 0,
            failedCount: 0,
            pendingCount: 0,
            refundedCount: 0,
        };

        statusBreakdown.forEach((item) => {
            if (item.status === 'PAID') statusCounts.paidCount = item._count;
            if (item.status === 'FAILED') statusCounts.failedCount = item._count;
            if (item.status === 'PENDING') statusCounts.pendingCount = item._count;
            if (item.status === 'REFUNDED') statusCounts.refundedCount = item._count;
        });

        const totalPayments =
            statusCounts.paidCount +
            statusCounts.failedCount +
            statusCounts.pendingCount +
            statusCounts.refundedCount;

        const successRate =
            totalPayments > 0
                ? (statusCounts.paidCount / totalPayments) * 100
                : 0;

        return {
            ...gatewayCounts,
            ...statusCounts,
            successRate: this.toFixedNumber(successRate, 2),
        };
    }
}
