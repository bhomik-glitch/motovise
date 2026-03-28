import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { FraudService } from './fraud.service';
import { RbacModule } from '../rbac/rbac.module';
import { RiskModule } from '../risk/risk.module';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [RbacModule, RiskModule, RedisModule],
    controllers: [OrdersController],
    providers: [OrdersService, FraudService],
    exports: [OrdersService],
})
export class OrdersModule { }
