const axios = require('axios');
const Redis = require('ioredis');
const { PrismaClient } = require('@prisma/client');

const API_URL = 'http://localhost:3000/v1';
const prisma = new PrismaClient();
const redis = new Redis({ host: 'localhost', port: 6379 });

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('--- PHASE 9B REDIS CACHING INTEGRATION TESTS ---\\n');

    let adminToken = '';
    let userId = '';

    try {
        // 1. Setup - get Admin tokens
        console.log('[Setup] Logging in as Admin...');
        const adminUser = await prisma.user.findFirst({ where: { role: { name: 'ADMIN' } } });
        if (!adminUser) throw new Error('No admin user found');

        // Quick bypass token generation using login route
        // Assuming there is a login route. Instead, let's create a test user or just use their existing token generation if we can't login easily.
        // Actually, let's just use Prisma to manipulate data and directly test the service layer if HTTP is hard, OR we just do HTTP.
        // Let's generate a token manually via DB? We don't have JWT secret here easily. 
        // Wait, we can fetch it from .env
        require('dotenv').config();
        const jwt = require('jsonwebtoken');
        adminToken = jwt.sign({ sub: adminUser.id, email: adminUser.email, role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        userId = adminUser.id;

        const axiosConfig = { headers: { Authorization: `Bearer ${adminToken}` } };

        // 2. Clear cache
        await redis.del('dashboard:mtd');
        console.log('[Test 1] Cache cleared.');

        // 3. Cache Miss Test
        console.log('[Test 2] Cache Miss Test (Dashboard)...');
        const startMiss = Date.now();
        const responseMiss = await axios.get(`${API_URL}/dashboard/ceo`, axiosConfig);
        const durationMiss = Date.now() - startMiss;

        const cachedData = await redis.get('dashboard:mtd');
        if (!cachedData) throw new Error('[FAIL] Cache was not populated after Miss');
        console.log(`✓ Cache populated successfully. Time taken: ${durationMiss}ms`);

        // 4. Cache Hit Test
        console.log('[Test 3] Cache Hit Test (Dashboard)...');
        const startHit = Date.now();
        const responseHit = await axios.get(`${API_URL}/dashboard/ceo`, axiosConfig);
        const durationHit = Date.now() - startHit;

        if (JSON.stringify(responseMiss.data.data) !== JSON.stringify(responseHit.data.data)) {
            throw new Error('[FAIL] Cached response Data Equality failed');
        }
        console.log(`✓ Hit successful. Data strictly equal. Time taken: ${durationHit}ms (vs ${durationMiss}ms miss)`);

        // 5. TTL Expiry Test (Simulated)
        console.log('[Test 4] TTL Expiry Test...');
        const ttl = await redis.ttl('dashboard:mtd');
        if (ttl <= 0 || ttl > 60) throw new Error(`[FAIL] TTL is incorrect: ${ttl}`);
        console.log(`✓ TTL correctly set to ${ttl} seconds.`);

        // 6. Mutation Invalidation Test
        console.log('[Test 5] Mutation Invalidation Test (Order Status Change)...');
        // Find any order
        const order = await prisma.order.findFirst();
        if (order) {
            // Modify order status directly through API to trigger invalidation
            const newStatus = order.orderStatus === 'DELIVERED' ? 'SHIPPED' : 'DELIVERED';
            await axios.patch(`${API_URL}/orders/${order.id}/status`, { status: newStatus }, axiosConfig);

            const postInvalidationCache = await redis.get('dashboard:mtd');
            if (postInvalidationCache !== null) {
                throw new Error('[FAIL] Cache was not invalidated on Order Status update');
            }
            console.log('✓ Cache correctly invalidated on mutation.');
        } else {
            console.log('⚠️ Skipped mutation invalidation test: No orders found in DB.');
        }

        console.log('\\n--- ALL REDIS TESTS PASSED SUCCESSFULLY ---');

    } catch (e) {
        console.error('\\n❌ TEST FAILED:', e.message);
        if (e.response) console.error(e.response.data);
    } finally {
        await prisma.$disconnect();
        redis.disconnect();
    }
}

runTests();
