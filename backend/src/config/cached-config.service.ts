import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CachedConfigService {
    private readonly logger = new Logger(CachedConfigService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
    ) { }

    /**
     * Gets a configuration value, utilizing a Redis cache-aside mechanism.
     * Uses a 300-second TTL.
     */
    async get<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
        const cacheKey = `config:${key}`;

        // 1. Check Redis cache
        const cached = await this.redisService.get<T>(cacheKey);
        if (cached !== null && cached !== undefined) {
            return cached;
        }

        // 2. Cache miss, read from underlying environment/config
        const value = this.configService.get<T>(key);

        // 3. Populate cache if value exists
        if (value !== undefined) {
            await this.redisService.set(cacheKey, value, 300);
            return value;
        }

        return defaultValue;
    }
}
