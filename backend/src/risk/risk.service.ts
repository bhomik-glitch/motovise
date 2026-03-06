import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CachedConfigService } from '../config/cached-config.service';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { RiskLevel, PincodeRisk } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// ──────────────────────────────────────────────────────────────────────────────
// Internal types
// ──────────────────────────────────────────────────────────────────────────────

interface PincodeAggregation {
    pincode: string;
    totalOrders: number;
    rtoOrders: number;
    rtoPercentage: number; // rounded to 2dp
    riskLevel: RiskLevel;
}

// ──────────────────────────────────────────────────────────────────────────────
// RiskService
// ──────────────────────────────────────────────────────────────────────────────

@Injectable()
export class RiskService {
    private readonly logger = new Logger(RiskService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: CachedConfigService,
        private readonly redis: RedisService,
    ) { }

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 8C — Blocking COD enforcement (config-driven)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns the PincodeRisk record for a given pincode, or null if not found.
     * Read-only — no aggregation or side-effects.
     * Normalises pincode with trim() to guard against whitespace.
     */
    async getRiskByPincode(pincode: string): Promise<PincodeRisk | null> {
        const normalizedPincode = pincode.trim();
        const key = `risk:pincode:${normalizedPincode}`;

        const cached = await this.redis.get<PincodeRisk>(key);
        if (cached) return cached;

        const risk = await this.prisma.pincodeRisk.findUnique({
            where: { pincode: normalizedPincode },
        });

        await this.redis.set(key, risk, 300);
        return risk;
    }

    /**
     * Enforces COD eligibility for a given pincode.
     *
     * Called INSIDE the order-creation $transaction so that any exception
     * triggers a full rollback — no partial state is committed.
     *
     * Behaviour:
     *  - paymentMethod !== 'COD'  → always passes (no-op)
     *  - riskLevel !== HIGH       → passes
     *  - riskLevel = HIGH AND COD_HIGH_RISK_ACTION = DISABLE → BadRequestException
     *  - riskLevel = HIGH AND COD_HIGH_RISK_ACTION = anything else → passes (logged)
     *  - pincode has no risk record (null) → passes (safe default)
     */
    async enforceCodeEligibility(
        pincode: string,
        paymentMethod: string,
    ): Promise<void> {
        // Normalise payment method for case-insensitive comparison
        if (paymentMethod.toUpperCase() !== 'COD') {
            return;
        }

        const riskProfile = await this.getRiskByPincode(pincode);

        // No record → no risk signal → allow
        if (!riskProfile || riskProfile.riskLevel !== RiskLevel.HIGH) {
            return;
        }

        // Config-driven action (fallback to DISABLE — most conservative)
        const configValue = await this.configService.get<string>('COD_HIGH_RISK_ACTION', 'DISABLE');
        const highRiskAction = (configValue || 'DISABLE').toUpperCase();

        if (highRiskAction === 'DISABLE') {
            this.logger.warn(
                `[Phase8C] COD blocked for HIGH-risk pincode ${pincode} (action=DISABLE)`,
            );
            throw new BadRequestException('COD not available for this pincode');
        }

        // Any other action value — log and allow
        this.logger.warn(
            `[Phase8C] HIGH-risk pincode ${pincode} — COD_HIGH_RISK_ACTION=${highRiskAction}, allowing order.`,
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 8B — 30-Day RTO Aggregation Engine
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Aggregates orders from the last 30 days, calculates RTO percentage per
     * pincode, classifies risk, and atomically upserts all PincodeRisk rows.
     *
     * Design decisions:
     *  - Two separate groupBy queries: total shipped vs RTO tagged.
     *    RTO count is a Sub-set; it never reduces the total count.
     *  - Divide-by-zero guarded explicitly before any division.
     *  - Entire DB write (upserts + stale resets) wrapped in a single
     *    $transaction — no partial state is ever committed.
     *  - Classification threshold: rtoPercent > 30 AND totalOrders >= 10 → HIGH
     *    Exactly 30% → NORMAL (spec: "Exactly 30% must be NORMAL").
     */
    async aggregateLast30Days(): Promise<void> {
        const startTime = Date.now();
        const runAt = new Date();
        this.logger.log(
            `[RiskCron] Starting 30-day risk aggregation at ${runAt.toISOString()}`,
        );

        // ── 1. Define 30-day window ──────────────────────────────────────────
        const since = new Date();
        since.setDate(since.getDate() - 30);

        // ── 2. Query: total SHIPPED orders per pincode (30d window) ──────────
        //    Filter: orderStatus = SHIPPED (already excludes CANCELLED, PENDING, etc.)
        //    No redundant != CANCELLED check needed — SHIPPED is already specific.
        const totalByPincode = await this.prisma.order.groupBy({
            by: ['shippingPincode'],
            where: {
                createdAt: { gte: since },
                orderStatus: 'SHIPPED',
            },
            _count: { id: true },
        });

        // ── 3. Query: RTO orders per pincode (30d window) ────────────────────
        //    RTO = SHIPPED + is_rto = true + is_customer_return = false
        //    This is a strict sub-set of totalByPincode.
        //    It does NOT reduce the total count — it only counts qualifying RTO rows.
        const rtoByPincode = await this.prisma.order.groupBy({
            by: ['shippingPincode'],
            where: {
                createdAt: { gte: since },
                orderStatus: 'SHIPPED',
                is_rto: true,
                is_customer_return: false,
            },
            _count: { id: true },
        });

        // ── 4. Build lookup map: pincode → rtoCount ──────────────────────────
        const rtoMap = new Map<string, number>(
            rtoByPincode.map((r) => [r.shippingPincode, r._count.id]),
        );

        // ── 5. Compute aggregation per pincode ───────────────────────────────
        const aggregations: PincodeAggregation[] = totalByPincode.map(
            (row) => {
                const pincode = row.shippingPincode;
                const totalOrders = row._count.id;
                const rtoOrders = rtoMap.get(pincode) ?? 0;

                // Divide-by-zero guard: impossible here (totalOrders >= 1 from groupBy)
                // but guarded explicitly for safety and clarity.
                const rtoPercentage =
                    totalOrders > 0
                        ? this.roundToTwoDecimalPlaces(
                            (rtoOrders / totalOrders) * 100,
                        )
                        : 0;

                // Negative value guard (rtoOrders is always >= 0 from DB count)
                const safeRtoPercentage = Math.max(0, rtoPercentage);

                // Classification rule:
                //   rtoPercent > 30 (strictly greater, so exactly 30% → NORMAL)
                //   AND totalOrders >= 10 (minimum sample threshold)
                const riskLevel: RiskLevel =
                    safeRtoPercentage > 30 && totalOrders >= 10
                        ? RiskLevel.HIGH
                        : RiskLevel.NORMAL;

                return {
                    pincode,
                    totalOrders,
                    rtoOrders,
                    rtoPercentage: safeRtoPercentage,
                    riskLevel,
                };
            },
        );

        // ── 6. Determine stale pincodes (in DB but NOT in current 30d result) ─
        const activePincodes = new Set(
            aggregations.map((a) => a.pincode),
        );

        const existingRecords = await this.prisma.pincodeRisk.findMany({
            select: { pincode: true },
        });

        const stalePincodes = existingRecords
            .map((r) => r.pincode)
            .filter((p) => !activePincodes.has(p));

        // ── 7. Atomic transaction: upsert active + reset stale ───────────────
        //    All writes happen inside a single $transaction.
        //    If any write fails, no rows are committed (all-or-nothing).
        await this.prisma.$transaction(async (tx) => {
            // 7a. Upsert each active pincode
            for (const agg of aggregations) {
                await tx.pincodeRisk.upsert({
                    where: { pincode: agg.pincode },
                    create: {
                        pincode: agg.pincode,
                        totalOrders30d: agg.totalOrders,
                        rtoCount30d: agg.rtoOrders,
                        rtoPercentage: new Decimal(agg.rtoPercentage),
                        riskLevel: agg.riskLevel,
                        lastEvaluatedAt: runAt,
                    },
                    update: {
                        totalOrders30d: agg.totalOrders,
                        rtoCount30d: agg.rtoOrders,
                        rtoPercentage: new Decimal(agg.rtoPercentage),
                        riskLevel: agg.riskLevel,
                        lastEvaluatedAt: runAt,
                    },
                });
            }

            // 7b. Reset stale pincodes to zero / NORMAL
            //    These pincodes exist in DB but had no shipped orders in last 30d.
            if (stalePincodes.length > 0) {
                await tx.pincodeRisk.updateMany({
                    where: { pincode: { in: stalePincodes } },
                    data: {
                        totalOrders30d: 0,
                        rtoCount30d: 0,
                        rtoPercentage: new Decimal(0),
                        riskLevel: RiskLevel.NORMAL,
                        lastEvaluatedAt: runAt,
                    },
                });
            }
        });

        // ── 8. Invalidate Redis Caches ───────────────────────────────────────
        const cacheKeysToInvalidate = [
            ...aggregations.map((a) => `risk:pincode:${a.pincode}`),
            ...stalePincodes.map((p) => `risk:pincode:${p}`),
        ];

        for (const key of cacheKeysToInvalidate) {
            await this.redis.del(key);
        }

        // ── 9. Completion logging ─────────────────────────────────────────────
        const durationMs = Date.now() - startTime;
        this.logger.log(
            `[RiskCron] Aggregation complete. ` +
            `Pincodes processed: ${aggregations.length}, ` +
            `Stale pincodes reset: ${stalePincodes.length}, ` +
            `Duration: ${durationMs}ms`,
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** Rounds a number to 2 decimal places (safe for percentage display). */
    private roundToTwoDecimalPlaces(value: number): number {
        return Math.round(value * 100) / 100;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Phase A9 — Fraud Config and Pincodes
    // ─────────────────────────────────────────────────────────────────────────

    async getAllRiskPincodes() {
        const records = await this.prisma.pincodeRisk.findMany({
            orderBy: { rtoPercentage: 'desc' }
        });
        return records.map(record => ({
            pincode: record.pincode,
            totalOrders: record.totalOrders30d,
            rtoRate: Number(record.rtoPercentage),
            riskLevel: record.riskLevel
        }));
    }

    private static localCodEnforcement: string | null = null;

    async getFraudConfig() {
        const cacheKey = `config:COD_HIGH_RISK_ACTION`;

        let codEnforcement = await this.redis.get<string>(cacheKey);

        if (!codEnforcement && RiskService.localCodEnforcement) {
            codEnforcement = RiskService.localCodEnforcement;
        }

        if (!codEnforcement) {
            codEnforcement = await this.configService.get<string>('COD_HIGH_RISK_ACTION', 'DISABLE');
        }

        const rtoThreshold = await this.configService.get<number>('RTO_HIGH_RISK_THRESHOLD', 30);
        return { codEnforcement, rtoThreshold };
    }

    async updateFraudConfig(codEnforcement: 'DISABLE' | 'FLAG') {
        const cacheKey = `config:COD_HIGH_RISK_ACTION`;

        RiskService.localCodEnforcement = codEnforcement;
        await this.redis.set(cacheKey, codEnforcement, 3600);

        return this.getFraudConfig();
    }
}
