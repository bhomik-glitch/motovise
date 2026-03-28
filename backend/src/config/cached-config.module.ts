import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';
import { CachedConfigService } from './cached-config.service';

@Global()
@Module({
    imports: [ConfigModule, RedisModule],
    providers: [CachedConfigService],
    exports: [CachedConfigService],
})
export class CachedConfigModule { }
