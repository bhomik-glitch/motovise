import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedisService } from './redis.service';

/**
 * DistributedLockService — Phase 9D
 *
 * Redis-based distributed lock using SET key value NX EX ttl.
 * Lock value format: v1:{instanceId}:{timestamp}
 *
 * Lock release is atomic via Lua script — ensures we only delete
 * a key that belongs to this process (prevents cross-instance stomping).
 *
 * Redis-down behaviour:
 *   acquireLock → returns false (cron must skip, never fall back to in-memory mutex)
 *   releaseLock → silently skips (no-op)
 */
@Injectable()
export class DistributedLockService {
    private readonly logger = new Logger(DistributedLockService.name);

    /**
     * Unique identifier for this process instance.
     * Generated once at boot; stable for the lifetime of the process.
     */
    readonly instanceId: string = randomUUID();

    /**
     * Lua script for atomic compare-and-delete.
     * Reads the stored value and deletes the key only if it starts with our instanceId.
     * Returns 1 if deleted, 0 if the key does not belong to us (or does not exist).
     */
    private readonly LUA_RELEASE_LOCK = `
local val = redis.call('GET', KEYS[1])
if val == false then
  return 0
end
if string.sub(val, 1, string.len(ARGV[1])) == ARGV[1] then
  redis.call('DEL', KEYS[1])
  return 1
else
  return 0
end
`;

    constructor(private readonly redisService: RedisService) {
        this.logger.log(
            `[Lock] DistributedLockService initialised — instanceId=${this.instanceId}`,
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Attempt to acquire a distributed lock.
     *
     * @param key        - Lock key (e.g. 'lock:risk-aggregation')
     * @param ttlSeconds - TTL in seconds. Must exceed worst-case execution time.
     * @returns true  — lock acquired by this instance
     *          false — lock already held by another instance, or Redis is down
     */
    async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
        const client = this.redisService.getClient();

        if (!client) {
            const env = process.env.NODE_ENV;
            if (env === 'development') {
                this.logger.warn(`[Lock] Redis unavailable — skipping cron (key=${key}). Start Redis to enable distributed locks.`);
            } else {
                this.logger.error(
                    `[Lock] Redis unavailable — skipping cron (key=${key}). ` +
                    'Execution blocked: distributed lock required.',
                );
            }
            return false;
        }

        const lockValue = `v1:${this.instanceId}:${Date.now()}`;

        try {
            // SET key value NX EX ttl — atomic, returns 'OK' or null
            const result = await client.set(key, lockValue, 'EX', ttlSeconds, 'NX');

            if (result === 'OK') {
                this.logger.log(
                    `[Lock] ${JSON.stringify({ lockKey: key, instanceId: this.instanceId, acquired: true, ttlSeconds })}`,
                );
                return true;
            }

            // Lock already held — peek at holder for diagnostics
            const holder = await client.get(key).catch(() => null);
            this.logger.log(
                `[Lock] ${JSON.stringify({ lockKey: key, instanceId: this.instanceId, acquired: false, holder: holder ?? 'unknown' })}`,
            );
            return false;
        } catch (error) {
            this.logger.error(
                `[Lock] acquireLock FAILED key=${key}: ${error.message}. Skipping cron.`,
            );
            return false;
        }
    }

    /**
     * Release a distributed lock atomically using a Lua script.
     * Only deletes the key if the stored value belongs to this instance.
     *
     * @param key          - Lock key to release
     * @param durationMs   - Optional: actual execution duration for logging
     */
    async releaseLock(key: string, durationMs?: number): Promise<void> {
        const client = this.redisService.getClient();

        if (!client) {
            this.logger.warn(
                `[Lock] Redis unavailable during releaseLock (key=${key}) — ` +
                'lock will expire naturally via TTL.',
            );
            return;
        }

        const instancePrefix = `v1:${this.instanceId}`;

        try {
            const result = await (client as any).eval(
                this.LUA_RELEASE_LOCK,
                1,          // numkeys
                key,        // KEYS[1]
                instancePrefix, // ARGV[1]
            ) as number;

            if (result === 1) {
                this.logger.log(
                    `[Lock] ${JSON.stringify({
                        lockKey: key,
                        instanceId: this.instanceId,
                        acquired: false,   // released
                        executionTimeMs: durationMs ?? null,
                        event: 'RELEASED',
                    })}`,
                );
            } else {
                this.logger.warn(
                    `[Lock] ${JSON.stringify({
                        lockKey: key,
                        instanceId: this.instanceId,
                        event: 'RELEASE_SKIPPED',
                        reason: 'key expired or held by different instance (Lua guard active)',
                    })}`,
                );
            }
        } catch (error) {
            this.logger.error(
                `[Lock] releaseLock FAILED key=${key}: ${error.message}. ` +
                'Lock will expire naturally via TTL.',
            );
        }
    }
}
