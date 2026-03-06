import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis | null = null;
    private connected = false;

    constructor(private readonly configService: ConfigService) {
        this.validateEnvironment();
    }

    private validateEnvironment() {
        const host = this.configService.get<string>('REDIS_HOST');
        const port = this.configService.get<string>('REDIS_PORT');

        if (!host) {
            throw new Error('REDIS_HOST is missing in environment variables');
        }

        if (!port) {
            throw new Error('REDIS_PORT is missing in environment variables');
        }

        if (isNaN(Number(port))) {
            throw new Error('REDIS_PORT must be numeric');
        }
    }

    onModuleInit() {
        const host = this.configService.get<string>('REDIS_HOST')!;
        const port = parseInt(this.configService.get<string>('REDIS_PORT')!, 10);

        this.client = new Redis({
            host,
            port,
            lazyConnect: true,
            retryStrategy: () => null, // Disable automatic retries so we don't spam logs on failure
            maxRetriesPerRequest: null,
        });

        // Handle connection events
        this.client.on('error', (error) => {
            if (this.connected) {
                this.connected = false;
            }

            const env = this.configService.get<string>('NODE_ENV');
            const isLocal = host === 'localhost' || host === '127.0.0.1';

            if (env === 'development' && isLocal) {
                // In development, we downgrade the error to a warning to avoid "red" logs,
                // as everything falls back to mock/no-cache automatically.
                this.logger.warn(
                    `Redis offline at ${host}:${port}. Functional fallbacks active (Caching & Locks disabled). ` +
                    `To enable, please start a local Redis server.`,
                );
            } else {
                this.logger.error(`Connection failed: ${error.message}`);
            }
        });

        this.client.on('ready', () => {
            this.connected = true;
            this.logger.log(`Successfully connected to Redis at ${host}:${port}`);
        });

        this.client.on('close', () => {
            this.connected = false;
        });

        // Initialize connection
        this.logger.log(`Attempting connection to Redis at ${host}:${port}...`);
        this.client.connect().catch((err) => {
            // We catch the initial connect error so the application doesn't crash.
            // The 'error' event listener above will also fire and log the error.
        });
    }

    onModuleDestroy() {
        if (this.client) {
            this.client.disconnect();
        }
    }

    isHealthy(): boolean {
        return this.connected;
    }

    getClient(): Redis | null {
        return this.connected ? this.client : null;
    }

    // ─────────────────────────────────────────────────────────────────
    // CACHE OPERATIONS (Safe Fallbacks)
    // ─────────────────────────────────────────────────────────────────

    async get<T>(key: string): Promise<T | null> {
        if (!this.connected || !this.client) return null;

        try {
            const data = await this.client.get(key);
            if (data) {
                this.logger.debug(`[Cache HIT] ${key}`);
                return JSON.parse(data) as T;
            } else {
                this.logger.debug(`[Cache MISS] ${key}`);
                return null;
            }
        } catch (error) {
            this.logger.warn(`Redis GET failed for key ${key}: ${error.message}`);
            return null; // Silent fallback
        }
    }

    async set(key: string, value: any, ttlSeconds: number): Promise<void> {
        if (!this.connected || !this.client) return;

        try {
            const data = JSON.stringify(value);
            await this.client.set(key, data, 'EX', ttlSeconds);
        } catch (error) {
            this.logger.warn(`Redis SET failed for key ${key}: ${error.message}`);
            // Silent fallback — never block business logic
        }
    }

    async del(key: string): Promise<void> {
        if (!this.connected || !this.client) return;

        try {
            await this.client.del(key);
            this.logger.debug(`[Cache INVALIDATE] ${key}`);
        } catch (error) {
            this.logger.warn(`Redis DEL failed for key ${key}: ${error.message}`);
        }
    }
}
