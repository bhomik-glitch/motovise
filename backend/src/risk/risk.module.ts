import { Module } from '@nestjs/common';
import { RiskService } from './risk.service';
import { RiskCron } from './risk.cron';
import { RiskController } from './risk.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RbacModule } from '../rbac/rbac.module';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [PrismaModule, ConfigModule, RbacModule, RedisModule],
    controllers: [RiskController],
    providers: [RiskService, RiskCron],
    exports: [RiskService],
})
export class RiskModule { }
