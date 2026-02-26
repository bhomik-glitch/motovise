import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertsCron } from './alerts.cron';
import { MetricsModule } from '../metrics/metrics.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
    imports: [MetricsModule, NotificationsModule, PrismaModule, RbacModule],
    controllers: [AlertsController],
    providers: [AlertsService, AlertsCron],
})
export class AlertsModule { }
