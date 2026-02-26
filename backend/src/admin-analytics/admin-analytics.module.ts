import { Module } from '@nestjs/common';
import { RbacModule } from '../rbac/rbac.module';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminAnalyticsController } from './admin-analytics.controller';

@Module({
    imports: [RbacModule],
    controllers: [AdminAnalyticsController],
    providers: [AdminAnalyticsService],
    exports: [AdminAnalyticsService],
})
export class AdminAnalyticsModule { }
