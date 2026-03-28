import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MetricsSnapshotService } from './metrics-snapshot.service';
import { DistributedLockService } from '../redis/distributed-lock.service';

/**
 * MetricsSnapshotCron — Nightly metrics aggregation cron job (Phase 9D).
 *
 * Runs at 02:00 every day.
 *
 * Distributed lock (Redis SET NX EX) ensures only ONE instance executes
 * across a horizontally scaled deployment. The in-memory isRunning mutex
 * has been fully removed — distributed lock is the sole guard.
 *
 * Redis-down behaviour: cron skips execution and logs at ERROR level.
 * Lock key : lock:metrics-snapshot
 * TTL      : 300 s (5 min) — must be ≥2× observed worst-case runtime
 */
@Injectable()
export class MetricsSnapshotCron {
    private readonly logger = new Logger(MetricsSnapshotCron.name);

    private static readonly LOCK_KEY = 'lock:metrics-snapshot';
    private static readonly LOCK_TTL = 300; // seconds

    constructor(
        private readonly snapshotService: MetricsSnapshotService,
        private readonly lockService: DistributedLockService,
    ) { }

    @Cron('0 2 * * *', { name: 'metrics-snapshot' })
    async handleMetricsSnapshot(): Promise<void> {
        const acquired = await this.lockService.acquireLock(
            MetricsSnapshotCron.LOCK_KEY,
            MetricsSnapshotCron.LOCK_TTL,
        );

        if (!acquired) {
            this.logger.log('[MetricsSnapshotCron] Skipped — lock already held');
            return;
        }

        const startTime = Date.now();
        this.logger.log('[MetricsSnapshotCron] Nightly snapshot started.');

        try {
            await this.snapshotService.takeSnapshot();
        } catch (error) {
            this.logger.error(
                `[MetricsSnapshotCron] Snapshot failed after ${Date.now() - startTime}ms: ${error.message}`,
                error.stack,
            );
        } finally {
            await this.lockService.releaseLock(
                MetricsSnapshotCron.LOCK_KEY,
                Date.now() - startTime,
            );
            this.logger.log(
                `[MetricsSnapshotCron] Finished in ${Date.now() - startTime}ms.`,
            );
        }
    }
}
