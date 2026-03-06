import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MetricsSnapshotService } from '../metrics-snapshot/metrics-snapshot.service';
import { Prisma } from '@prisma/client';

export interface ExecutiveMetrics {
    gmv_mtd: number;
    orders_mtd: number;
    prepaid_percentage_mtd: number;
    rto_percentage_7d: number;
    chargeback_percentage_30d: number;
    avg_shipping_cost_30d: number;
    manual_review_pending_count: number;
    top_high_risk_pincodes: Array<{
        pincode: string;
        rtoPercentage: number;
        totalOrders: number;
    }>;
}

@Injectable()
export class MetricsService {
    private readonly logger = new Logger(MetricsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly snapshotService: MetricsSnapshotService,
    ) { }

    /**
     * Executes parallel queries to fetch executive dashboard metrics.
     * Rule 7 & 8: Fallbacks to full legacy aggregate if snapshot is missing.
     * Rule 1: Merges raw counts for MTD metrics.
     * Rule 6: Rolling metrics remain full live queries.
     *
     * This is the SINGLE SOURCE OF TRUTH for both Dashboard and Alerts.
     */
    async getExecutiveMetrics(skipCache: boolean = false): Promise<ExecutiveMetrics> {
        const cacheKey = 'dashboard:mtd';

        if (!skipCache) {
            const cached = await this.redis.get<ExecutiveMetrics>(cacheKey);
            if (cached) return cached;
        }

        const now = new Date();
        const mtdStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const validOrderFilter = { orderStatus: { not: 'CANCELLED' } as const };

        // ============================================
        // 1. FAST PATH: SNAPSHOT + DELTA
        // ============================================
        const snapshot = await this.snapshotService.getLatestForCurrentMonth();

        let mtdGMV = 0;
        let mtdOrders = 0;
        let mtdPrepaidCount = 0;

        if (snapshot) {
            // Rule 5: UTC strict boundaries
            const todayMidnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

            // Rule 1: We only aggregate today's delta
            const [todayAggregates, todayPrepaid] = await Promise.all([
                this.prisma.order.aggregate({
                    where: { ...validOrderFilter, createdAt: { gte: todayMidnightUTC } },
                    _sum: { total: true },
                    _count: true,
                }),
                this.prisma.order.count({
                    where: { ...validOrderFilter, createdAt: { gte: todayMidnightUTC }, paymentMethod: { not: 'COD' } },
                })
            ]);

            // Merge snapshot with delta (raw counts only!)
            mtdGMV = Number(snapshot.mtdGMV) + (todayAggregates._sum.total ? Number(todayAggregates._sum.total) : 0);
            mtdOrders = snapshot.ordersCount + todayAggregates._count;
            mtdPrepaidCount = snapshot.prepaidCount + todayPrepaid;

        } else {
            // ============================================
            // 2. FALLBACK PATH: FULL LEGACY AGGREGATION
            // Rule 7 & 8: First day of month or cold start
            // ============================================
            this.logger.warn('No metrics snapshot found for current month. Falling back to full aggregation.');
            const mtdStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

            const [mtdAggregates, mtdPrepaid] = await Promise.all([
                this.prisma.order.aggregate({
                    where: { ...validOrderFilter, createdAt: { gte: mtdStart } },
                    _sum: { total: true },
                    _count: true,
                }),
                this.prisma.order.count({
                    where: { ...validOrderFilter, createdAt: { gte: mtdStart }, paymentMethod: { not: 'COD' } },
                })
            ]);

            mtdGMV = mtdAggregates._sum.total ? Number(mtdAggregates._sum.total) : 0;
            mtdOrders = mtdAggregates._count;
            mtdPrepaidCount = mtdPrepaid;
        }

        // ============================================
        // 3. LIVE ROLLING METRICS (Rule 6)
        // These can NEVER be snapshotted daily as they span before-month boundaries
        // ============================================
        const [
            rtoDenominatorCount,
            rtoNumeratorCount,
            chargebackDenominatorCount,
            chargebackNumeratorCount,
            shippingCostAggregates,
            manualReviewPendingCount, // Rule 3: Always live
            topHighRiskPincodes,
        ] = await Promise.all([
            this.prisma.order.count({
                where: {
                    ...validOrderFilter,
                    orderStatus: { in: ['SHIPPED', 'DELIVERED'] },
                    createdAt: { gte: sevenDaysAgo },
                },
            }),
            this.prisma.order.count({
                where: {
                    ...validOrderFilter,
                    orderStatus: { in: ['SHIPPED', 'DELIVERED'] },
                    createdAt: { gte: sevenDaysAgo },
                    is_rto: true,
                    is_customer_return: false,
                },
            }),
            this.prisma.order.count({
                where: { ...validOrderFilter, createdAt: { gte: thirtyDaysAgo } },
            }),
            this.prisma.order.count({
                where: {
                    ...validOrderFilter,
                    createdAt: { gte: thirtyDaysAgo },
                    chargeback: true,
                },
            }),
            this.prisma.order.aggregate({
                where: { ...validOrderFilter, createdAt: { gte: thirtyDaysAgo } },
                _avg: { shippingCost: true },
            }),
            this.prisma.order.count({
                where: { is_manual_review: true, review_status: 'PENDING' },
            }),
            this.prisma.pincodeRisk.findMany({
                where: { riskLevel: 'HIGH' },
                orderBy: { rtoPercentage: 'desc' },
                take: 10,
                select: {
                    pincode: true,
                    rtoPercentage: true,
                    totalOrders30d: true,
                },
            }),
        ]);

        const formatDecimal = (val: number) => Number(val.toFixed(2));

        const getPercentage = (numerator: number, denominator: number): number => {
            if (denominator === 0) return 0;
            return formatDecimal((numerator / denominator) * 100);
        };

        const result = {
            gmv_mtd: formatDecimal(mtdGMV),
            orders_mtd: mtdOrders,
            prepaid_percentage_mtd: getPercentage(mtdPrepaidCount, mtdOrders),
            rto_percentage_7d: getPercentage(rtoNumeratorCount, rtoDenominatorCount),
            chargeback_percentage_30d: getPercentage(chargebackNumeratorCount, chargebackDenominatorCount),
            avg_shipping_cost_30d: shippingCostAggregates._avg.shippingCost ? formatDecimal(Number(shippingCostAggregates._avg.shippingCost)) : 0,
            manual_review_pending_count: manualReviewPendingCount,
            top_high_risk_pincodes: topHighRiskPincodes.map(p => ({
                pincode: p.pincode,
                rtoPercentage: formatDecimal(Number(p.rtoPercentage)),
                totalOrders: p.totalOrders30d,
            })),
        };

        if (!skipCache) {
            await this.redis.set(cacheKey, result, 60);
        }

        return result;
    }
}
