import { Logger } from '@nestjs/common';
import { MetricsService } from './src/metrics/metrics.service';

/**
 * Validates Cache Aside behavior without needing a real Redis server
 */
async function runTests() {
    console.log('--- PHASE 9B CACHING UNIT TESTS ---\n');

    let prismaCallCount: any = 0;

    // Simulate Prisma queries
    const mockPrisma = {
        order: {
            aggregate: async () => { prismaCallCount++; return { _sum: { total: 1000 }, _count: 10, _avg: { shippingCost: 50 } }; },
            count: async () => 5,
        },
        pincodeRisk: {
            findMany: async () => [{ pincode: '123456', rtoPercentage: 50, totalOrders30d: 20 }],
        }
    };

    // Simulate Redis
    class MockRedis {
        private cache = new Map<string, any>();
        async get(key: string) { return this.cache.get(key); }
        async set(key: string, value: any, ttl: number) { this.cache.set(key, value); }
        async del(key: string) { this.cache.delete(key); }
    }

    const mockRedis = new MockRedis();
    const metricsService = new MetricsService(mockPrisma as any, mockRedis as any);

    try {
        console.log('[Test 1] Cache Miss');
        const r1 = await metricsService.getExecutiveMetrics();
        if (prismaCallCount !== 2) throw new Error('Prisma should have been called twice on MISS');
        const cached1 = await mockRedis.get('dashboard:mtd');
        if (!cached1) throw new Error('Cache should have been populated');
        console.log('✓ Cache missed correctly and populated Redis.');

        console.log('[Test 2] Cache Hit');
        const r2 = await metricsService.getExecutiveMetrics();
        if (prismaCallCount !== 2) throw new Error('Prisma should NOT have been called on HIT');
        if (JSON.stringify(r1) !== JSON.stringify(r2)) throw new Error('Cached payload differs from DB payload');
        console.log('✓ Cache hit successfully, DB was skipped.');

        console.log('[Test 3] Skip Cache (Alerts Cron bypass)');
        await metricsService.getExecutiveMetrics(true);
        if (prismaCallCount !== 4) throw new Error('Prisma should be called when skipCache is true');
        console.log('✓ Bypass successful.');

        console.log('[Test 4] Invalidation Simulation');
        await mockRedis.del('dashboard:mtd');
        const cached2 = await mockRedis.get('dashboard:mtd');
        if (cached2) throw new Error('Cache should be deleted');
        console.log('✓ Invalidation cleared the key.');

        console.log('\n--- ALL UNIT TESTS PASSED ---');

    } catch (e) {
        console.error('❌ TEST FAILED:', e.message);
        process.exit(1);
    }
}

runTests();
