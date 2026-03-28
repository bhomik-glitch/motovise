import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RiskService } from './risk.service';
import { DistributedLockService } from '../redis/distributed-lock.service';

/**
 * RiskCron — Nightly pincode risk aggregation cron job (Phase 9D).
 *
 * Runs at 02:00 every day.
 *
 * Distributed lock (Redis SET NX EX) ensures only ONE instance executes
 * across a horizontally scaled deployment. The in-memory isRunning mutex
 * has been fully removed — distributed lock is the sole guard.
 *
 * Redis-down behaviour: cron skips execution and logs at ERROR level.
 * Lock key : lock:risk-aggregation
 * TTL      : 300 s (5 min) — must be ≥2× observed worst-case runtime
 */
@Injectable()
export class RiskCron {
    private readonly logger = new Logger(RiskCron.name);

    private static readonly LOCK_KEY = 'lock:risk-aggregation';
    private static readonly LOCK_TTL = 300; // seconds

    constructor(
        private readonly riskService: RiskService,
        private readonly lockService: DistributedLockService,
    ) { }

    @Cron('0 2 * * *', { name: 'pincode-risk-aggregation' })
    async handlePincodeRiskAggregation(): Promise<void> {
        const acquired = await this.lockService.acquireLock(
            RiskCron.LOCK_KEY,
            RiskCron.LOCK_TTL,
        );

        if (!acquired) {
            this.logger.log('[RiskCron] Skipped — lock already held');
            return;
        }

        const startTime = Date.now();
        this.logger.log('[RiskCron] Nightly aggregation started.');

        try {
            await this.riskService.aggregateLast30Days();
        } catch (error) {
            this.logger.error(
                `[RiskCron] Aggregation failed after ${Date.now() - startTime}ms: ${error.message}`,
                error.stack,
            );
        } finally {
            await this.lockService.releaseLock(
                RiskCron.LOCK_KEY,
                Date.now() - startTime,
            );
            this.logger.log(
                `[RiskCron] Finished in ${Date.now() - startTime}ms.`,
            );
        }
    }
}
