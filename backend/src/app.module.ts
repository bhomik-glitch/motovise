import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminAnalyticsModule } from './admin-analytics/admin-analytics.module';
import { HealthModule } from './health/health.module';
import { RbacModule } from './rbac/rbac.module';
import { UsersModule } from './users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RiskModule } from './risk/risk.module';
import { ManualReviewModule } from './manual-review/manual-review.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AlertsModule } from './alerts/alerts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RedisModule } from './redis/redis.module';
import { CachedConfigModule } from './config/cached-config.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 60000,  // 60 seconds
                    limit: 100,  // 100 requests per 60s default
                },
            ],
        }),
        PrismaModule,
        RbacModule,
        UsersModule,
        AuthModule,
        ProductsModule,
        CategoriesModule,
        CartModule,
        OrdersModule,
        AddressesModule,
        PaymentsModule,
        AdminAnalyticsModule,
        HealthModule,
        ScheduleModule.forRoot(),
        RiskModule,
        ManualReviewModule,
        DashboardModule,
        AlertsModule,
        NotificationsModule,
        RedisModule,
        CachedConfigModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
