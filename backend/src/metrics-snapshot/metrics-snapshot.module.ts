import { Module } from '@nestjs/common';
import { MetricsSnapshotService } from './metrics-snapshot.service';
import { MetricsSnapshotCron } from './metrics-snapshot.cron';

@Module({
    providers: [MetricsSnapshotService, MetricsSnapshotCron],
    exports: [MetricsSnapshotService],
})
export class MetricsSnapshotModule { }
