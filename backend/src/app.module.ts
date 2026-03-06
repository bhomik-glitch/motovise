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
import { AdminOrdersModule } from './admin-orders/admin-orders.module';
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
import { MetricsSnapshotModule } from './metrics-snapshot/metrics-snapshot.module';
import { AdminPaymentsModule } from './admin-payments/admin-payments.module';
import { AdminRbacModule } from './admin-rbac/admin-rbac.module';
import { AdminConfigModule } from './admin-config/admin-config.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 60000,
                    limit: 10000,
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
        AdminOrdersModule,
        HealthModule,
        ScheduleModule.forRoot(),
        RiskModule,
        ManualReviewModule,
        DashboardModule,
        AlertsModule,
        NotificationsModule,
        RedisModule,
        CachedConfigModule,
        MetricsSnapshotModule,
        AdminPaymentsModule,
        AdminRbacModule,
        AdminConfigModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
