"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_service_1 = require("./src/metrics/metrics.service");
async function runTests() {
    console.log('--- PHASE 9B CACHING UNIT TESTS ---\n');
    let prismaCallCount = 0;
    const mockPrisma = {
        order: {
            aggregate: async () => { prismaCallCount++; return { _sum: { total: 1000 }, _count: 10, _avg: { shippingCost: 50 } }; },
            count: async () => 5,
        },
        pincodeRisk: {
            findMany: async () => [{ pincode: '123456', rtoPercentage: 50, totalOrders30d: 20 }],
        }
    };
    class MockRedis {
        constructor() {
            this.cache = new Map();
        }
        async get(key) { return this.cache.get(key); }
        async set(key, value, ttl) { this.cache.set(key, value); }
        async del(key) { this.cache.delete(key); }
    }
    const mockRedis = new MockRedis();
    const mockSnapshot = { getLatestForCurrentMonth: jest.fn().mockResolvedValue(null) };
    const metricsService = new metrics_service_1.MetricsService(mockPrisma, mockRedis, mockSnapshot);
    try {
        console.log('[Test 1] Cache Miss');
        const r1 = await metricsService.getExecutiveMetrics();
        if (prismaCallCount !== 2)
            throw new Error('Prisma should have been called twice on MISS');
        const cached1 = await mockRedis.get('dashboard:mtd');
        if (!cached1)
            throw new Error('Cache should have been populated');
        console.log('✓ Cache missed correctly and populated Redis.');
        console.log('[Test 2] Cache Hit');
        const r2 = await metricsService.getExecutiveMetrics();
        if (prismaCallCount !== 2)
            throw new Error('Prisma should NOT have been called on HIT');
        if (JSON.stringify(r1) !== JSON.stringify(r2))
            throw new Error('Cached payload differs from DB payload');
        console.log('✓ Cache hit successfully, DB was skipped.');
        console.log('[Test 3] Skip Cache (Alerts Cron bypass)');
        await metricsService.getExecutiveMetrics(true);
        if (prismaCallCount !== 4)
            throw new Error('Prisma should be called when skipCache is true');
        console.log('✓ Bypass successful.');
        console.log('[Test 4] Invalidation Simulation');
        await mockRedis.del('dashboard:mtd');
        const cached2 = await mockRedis.get('dashboard:mtd');
        if (cached2)
            throw new Error('Cache should be deleted');
        console.log('✓ Invalidation cleared the key.');
        console.log('\n--- ALL UNIT TESTS PASSED ---');
    }
    catch (e) {
        console.error('❌ TEST FAILED:', e.message);
        process.exit(1);
    }
}
runTests();
//# sourceMappingURL=test-caching-logic.js.map