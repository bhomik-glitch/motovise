import { Module } from '@nestjs/common';
import { ManualReviewService } from './manual-review.service';
import { ManualReviewController } from './manual-review.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [PrismaModule, RbacModule, RedisModule],
    controllers: [ManualReviewController],
    providers: [ManualReviewService],
})
export class ManualReviewModule { }
