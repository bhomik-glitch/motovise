import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MetricsModule } from '../metrics/metrics.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
    imports: [MetricsModule, RbacModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
