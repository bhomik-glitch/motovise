import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { MetricsSnapshotModule } from '../metrics-snapshot/metrics-snapshot.module';
import { MetricsService } from './metrics.service';

@Module({
    imports: [PrismaModule, RedisModule, MetricsSnapshotModule],
    providers: [MetricsService],
    exports: [MetricsService],
})
export class MetricsModule { }
