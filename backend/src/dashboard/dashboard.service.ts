import { Injectable, Logger } from '@nestjs/common';
import { MetricsService, ExecutiveMetrics } from '../metrics/metrics.service';

@Injectable()
export class DashboardService {
    private readonly logger = new Logger(DashboardService.name);

    constructor(private readonly metricsService: MetricsService) { }

    /**
     * Retrieves executive dashboard metrics from the unified MetricsService.
     * This strictly adheres to Comment 5: DashboardService and AlertsService 
     * both consume metrics exclusively from MetricsService to prevent drift.
     */
    async getCeoDashboard(): Promise<ExecutiveMetrics> {
        return this.metricsService.getExecutiveMetrics();
    }
}
