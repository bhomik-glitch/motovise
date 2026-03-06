import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertsService } from './alerts.service';
import { DistributedLockService } from '../redis/distributed-lock.service';

/**
 * AlertsCron — Hourly alert threshold evaluation cron job (Phase 9D).
 *
 * Executes every hour.
 *
 * Distributed lock (Redis SET NX EX) ensures only ONE instance executes
 * across a horizontally scaled deployment. The in-memory isRunning mutex
 * has been fully removed — distributed lock is the sole guard.
 *
 * Redis-down behaviour: cron skips execution and logs at ERROR level.
 * Lock key : lock:alert-evaluation
 * TTL      : 120 s (2 min) — must be ≥2× observed worst-case runtime
 */
@Injectable()
export class AlertsCron {
    private readonly logger = new Logger(AlertsCron.name);

    private static readonly LOCK_KEY = 'lock:alert-evaluation';
    private static readonly LOCK_TTL = 120; // seconds

    constructor(
        private readonly alertsService: AlertsService,
        private readonly lockService: DistributedLockService,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleCron(): Promise<void> {
        const acquired = await this.lockService.acquireLock(
            AlertsCron.LOCK_KEY,
            AlertsCron.LOCK_TTL,
        );

        if (!acquired) {
            this.logger.log('[AlertsCron] Skipped — lock already held');
            return;
        }

        const startTime = Date.now();
        this.logger.log('[AlertsCron] Alert threshold evaluation started.');

        try {
            await this.alertsService.evaluateThresholds();
            this.logger.log('[AlertsCron] Alert evaluation cycle completed successfully.');
        } catch (error) {
            this.logger.error(
                `[AlertsCron] Alert evaluation failed after ${Date.now() - startTime}ms: ${error.message}`,
                error.stack,
            );
        } finally {
            await this.lockService.releaseLock(
                AlertsCron.LOCK_KEY,
                Date.now() - startTime,
            );
            this.logger.log(
                `[AlertsCron] Finished in ${Date.now() - startTime}ms.`,
            );
        }
    }
}
