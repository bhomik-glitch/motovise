import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertsService } from './alerts.service';

@Injectable()
export class AlertsCron {
    private readonly logger = new Logger(AlertsCron.name);
    private isRunning = false;

    constructor(private readonly alertsService: AlertsService) { }

    /**
     * Executes every hour to check executive metrics against thresholds.
     * 
     * Comment 3 — Cron Concurrency Limitation (Future Scaling Note):
     * Current implementation uses an in-memory `isRunning` mutex flag to 
     * prevent overlapping cron executions. 
     * ⚠️ Limitation: This protects only single-instance deployments. 
     * In horizontally scaled environments, a distributed lock (DB or Redis) 
     * will be required. Acceptable for current architecture.
     */
    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        if (this.isRunning) {
            this.logger.warn('Previous alert threshold evaluation is still running. Skipping this cycle.');
            return;
        }

        this.isRunning = true;
        try {
            this.logger.log('Starting scheduled alert threshold evaluation cycle...');
            await this.alertsService.evaluateThresholds();
            this.logger.log('Alert evaluation cycle completed successfully.');
        } catch (error) {
            this.logger.error('Error during scheduled alert evaluation cycle', error);
        } finally {
            this.isRunning = false;
        }
    }
}
