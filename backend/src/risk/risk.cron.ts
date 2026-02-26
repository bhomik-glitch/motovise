import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RiskService } from './risk.service';

/**
 * RiskCron — Nightly pincode risk aggregation cron job.
 *
 * Runs at 02:00 every day (cron: '0 2 * * *').
 *
 * ⚠️  LIMITATION — Single-instance overlap prevention only:
 *     The `isRunning` flag prevents overlapping execution on a single process.
 *     In a multi-pod/distributed deployment, use a distributed lock (e.g. Redis
 *     Redlock) instead. This is intentionally deferred to Phase 8G (Alerts).
 */
@Injectable()
export class RiskCron {
    private readonly logger = new Logger(RiskCron.name);
    private isRunning = false;

    constructor(private readonly riskService: RiskService) { }

    @Cron('0 2 * * *', { name: 'pincode-risk-aggregation' })
    async handlePincodeRiskAggregation(): Promise<void> {
        if (this.isRunning) {
            this.logger.warn(
                '[RiskCron] Aggregation already in progress — skipping overlapping run.',
            );
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();
        this.logger.log('[RiskCron] Nightly cron triggered.');

        try {
            await this.riskService.aggregateLast30Days();
        } catch (error) {
            this.logger.error(
                `[RiskCron] Aggregation failed after ${Date.now() - startTime}ms: ${error.message}`,
                error.stack,
            );
        } finally {
            this.isRunning = false;
            this.logger.log(
                `[RiskCron] Cron finished in ${Date.now() - startTime}ms.`,
            );
        }
    }
}
