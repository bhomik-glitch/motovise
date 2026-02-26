import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MockGatewayService } from './gateways/mock-gateway.service';
import { RedisModule } from '../redis/redis.module';

/**
 * Payments Module
 * 
 * Handles payment processing with gateway abstraction.
 * Uses dependency injection to allow swapping payment gateways
 * without changing business logic.
 * 
 * Current: MockGatewayService (for testing without API keys)
 * Future: RazorpayGatewayService (when keys available)
 * 
 * To switch gateways, simply change the useClass in the provider below.
 */
@Module({
    imports: [PrismaModule, RedisModule],
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        {
            provide: 'PaymentGateway',
            useClass: MockGatewayService, // ← Swap with RazorpayGatewayService when ready
        },
    ],
    exports: [PaymentsService],
})
export class PaymentsModule { }
