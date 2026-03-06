import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsSnapshotService {
    private readonly logger = new Logger(MetricsSnapshotService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Retrieves the most recent snapshot for the CURRENT month.
     * Rule 2: Snapshot window is MTD-scoped.
     * Rule 8: If it's the 1st of the month, this explicitly returns null.
     */
    async getLatestForCurrentMonth() {
        const now = new Date();
        const startOfMonthUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

        return this.prisma.metricsSnapshot.findFirst({
            where: {
                date: { gte: startOfMonthUTC }
            },
            orderBy: { date: 'desc' }
        });
    }

    /**
     * Executes the daily snapshot aggregation.
     * Rule 1: Stores raw counts.
     * Rule 4: Append-only, never upsert.
     * Rule 5: UTC strictly enforced.
     * Rule 9: Transactional write.
     */
    async takeSnapshot(): Promise<void> {
        const startTimeMs = Date.now();
        const now = new Date();

        // 1. Compute boundaries in UTC strictly
        const todayMidnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const startOfMonthUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

        this.logger.log(`Starting snapshot generation for ${todayMidnightUTC.toISOString()} (MTD window: ${startOfMonthUTC.toISOString()} -> ${todayMidnightUTC.toISOString()})`);

        // 2. Check Idempotency
        const existing = await this.prisma.metricsSnapshot.findUnique({
            where: { date: todayMidnightUTC }
        });
        if (existing) {
            this.logger.log('[SKIP] Snapshot already exists for today.');
            return;
        }

        // 3. Perform Transactional Snapshot
        const validOrderFilter = { orderStatus: { not: 'CANCELLED' } as const };

        await this.prisma.$transaction(async (tx) => {
            // Aggregate historically within the CURRENT MONTH, UP TO TODAY MIDNIGHT
            const mtdFilter = {
                ...validOrderFilter,
                createdAt: {
                    gte: startOfMonthUTC,
                    lt: todayMidnightUTC
                }
            };

            const [
                mtdAggregates,
                prepaidCount,
                rtoNumeratorCount,
                rtoDenominatorCount,
                chargebackNumeratorCount,
                chargebackDenominatorCount,
                shippingAggregates,
                manualReviewLiveCount
            ] = await Promise.all([
                // GMV + Orders Count
                tx.order.aggregate({
                    where: mtdFilter,
                    _sum: { total: true },
                    _count: true
                }),
                // Prepaid count explicitly (Rule 1)
                tx.order.count({
                    where: { ...mtdFilter, paymentMethod: { not: 'COD' } }
                }),
                // Live/recent data to populate informational percentages (Rule 6)
                // Note: these are computed over recent 7/30 days just for info storage
                tx.order.count({
                    where: {
                        ...validOrderFilter,
                        orderStatus: { in: ['SHIPPED', 'DELIVERED'] },
                        createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
                        is_rto: true,
                        is_customer_return: false
                    }
                }),
                tx.order.count({
                    where: {
                        ...validOrderFilter,
                        orderStatus: { in: ['SHIPPED', 'DELIVERED'] },
                        createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
                    }
                }),
                tx.order.count({
                    where: { ...validOrderFilter, createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, chargeback: true }
                }),
                tx.order.count({
                    where: { ...validOrderFilter, createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }
                }),
                tx.order.aggregate({
                    where: { ...validOrderFilter, createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
                    _avg: { shippingCost: true }
                }),
                // Live count for manual review (Rule 3)
                tx.order.count({
                    where: { is_manual_review: true, review_status: 'PENDING' }
                })
            ]);

            // Helper to compute informational percentages safely
            const formatDecimal = (val: number) => Number(val.toFixed(2));
            const getPercentage = (numerator: number, denominator: number): number => {
                if (denominator === 0) return 0;
                return formatDecimal((numerator / denominator) * 100);
            };

            const ordersCount = mtdAggregates._count;
            const mtdGMV = mtdAggregates._sum.total ? Number(mtdAggregates._sum.total) : 0;
            const prepaidPercentage = getPercentage(prepaidCount, ordersCount);
            const rtoRate = getPercentage(rtoNumeratorCount, rtoDenominatorCount);
            const chargebackRate = getPercentage(chargebackNumeratorCount, chargebackDenominatorCount);
            const avgShippingCost = shippingAggregates._avg.shippingCost ? formatDecimal(Number(shippingAggregates._avg.shippingCost)) : 0;

            // Strict append-only creation (Rule 4)
            await tx.metricsSnapshot.create({
                data: {
                    date: todayMidnightUTC,
                    mtdGMV,
                    ordersCount,
                    prepaidCount,
                    prepaidPercentage,
                    rtoRate,
                    chargebackRate,
                    avgShippingCost,
                    manualReviewPending: manualReviewLiveCount
                }
            });
        });

        this.logger.log(`Snapshot generated successfully in ${Date.now() - startTimeMs}ms`);
    }
}
