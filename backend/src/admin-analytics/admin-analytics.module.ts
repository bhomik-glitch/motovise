import { Module } from '@nestjs/common';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminAnalyticsController } from './admin-analytics.controller';

@Module({
    controllers: [AdminAnalyticsController],
    providers: [AdminAnalyticsService],
    exports: [AdminAnalyticsService],
})
export class AdminAnalyticsModule { }
