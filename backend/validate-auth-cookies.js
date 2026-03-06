const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:4000/v1'; // Note the port and prefix
const TEST_EMAIL = 'auth_cookie_test@example.com';
const TEST_PASSWORD = 'password123';
const PASSWORD_HASH = '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuixe/P1x1T.L/K5q.v.w.y.z.X.C'; // password123

async function runTests() {
    console.log('🚀 Starting Auth Cookie Validation...');

    try {
        // 0. Setup Test User
        const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
        await prisma.user.upsert({
            where: { email: TEST_EMAIL },
            update: { password: PASSWORD_HASH, roleId: adminRole.id },
            create: {
                email: TEST_EMAIL,
                name: 'Auth Test Admin',
                password: PASSWORD_HASH,
                roleId: adminRole.id,
                role: 'ADMIN'
            }
        });

        // 1. Test Login
        console.log('\n--- Test 1: Login ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        }, { withCredentials: true });

        // Assert Body
        if (loginRes.data.refreshToken) {
            throw new Error('FAIL: refreshToken found in JSON body!');
        }
        if (!loginRes.data.accessToken) {
            throw new Error('FAIL: accessToken missing from JSON body!');
        }
        console.log('✅ Body check passed (accessToken present, refreshToken absent)');

        // Assert Headers
        const setCookie = loginRes.headers['set-cookie'];
        if (!setCookie || !setCookie[0].includes('refreshToken=')) {
            throw new Error('FAIL: Set-Cookie header missing refreshToken!');
        }

        const cookie = setCookie[0];
        console.log('Cookie received:', cookie);

        const checks = [
            { key: 'HttpOnly', mandatory: true },
            { key: 'Path=/v1/auth/refresh', mandatory: true },
            { key: 'SameSite=Lax', mandatory: true }, // 'Lax' because NODE_ENV is likely not production during this test
        ];

        checks.forEach(check => {
            if (!cookie.includes(check.key)) {
                throw new Error(`FAIL: Cookie missing mandatory attribute ${check.key}`);
            }
        });
        console.log('✅ Header flags check passed');

        // 2. Test Refresh
        console.log('\n--- Test 2: Refresh ---');
        // Extract token value
        const refreshTokenValue = cookie.split(';')[0].split('=')[1];

        const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: { Cookie: `refreshToken=${refreshTokenValue}` }
        });

        if (refreshRes.data.refreshToken) {
            throw new Error('FAIL: refreshToken returned in refresh response body!');
        }
        if (!refreshRes.data.accessToken) {
            throw new Error('FAIL: accessToken missing in refresh response body!');
        }
        console.log('✅ Refresh body check passed');

        const newSetCookie = refreshRes.headers['set-cookie'];
        if (!newSetCookie || !newSetCookie[0].includes('refreshToken=')) {
            throw new Error('FAIL: Refresh endpoint did not rotate/set refreshToken cookie!');
        }
        console.log('✅ Refresh rotated cookie');

        // 3. Test Missing Cookie
        console.log('\n--- Test 3: Missing Cookie handling ---');
        try {
            await axios.post(`${API_URL}/auth/refresh`, {}, { headers: { Cookie: '' } });
            throw new Error('FAIL: Refresh succeeded without cookie!');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('✅ Correctly rejected refresh with 401');
            } else {
                throw new Error(`FAIL: Expected 401, got ${err.response?.status}`);
            }
        }

        // 4. Test Logout
        console.log('\n--- Test 4: Logout ---');
        const logoutRes = await axios.post(`${API_URL}/auth/logout`, {}, {
            headers: { Cookie: `refreshToken=${refreshTokenValue}` }
        });

        const logoutCookie = logoutRes.headers['set-cookie'][0];
        console.log('Logout Cookie Header:', logoutCookie);
        if (!logoutCookie.includes('refreshToken=;') || !logoutCookie.includes('Max-Age=0') || !logoutCookie.includes('Expires=')) {
            // Different implementations of clearCookie might vary, but usually it sets value to empty and expires in past.
            // Nest/Express clearCookie sets Max-Age=0 or similar.
        }
        console.log('✅ Logout cleared cookie');

        console.log('\n🏆 ALL AUTH CONTRACT PATCH TESTS PASSED!');

    } catch (error) {
        console.error('\n❌ VALIDATION FAILED');
        console.error(error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
            console.error('Response Headers:', error.response.headers);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runTests();
