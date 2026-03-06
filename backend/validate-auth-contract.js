const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'https://motovise-production.up.railway.app/v1/auth';

const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password123!';

async function runValidation() {
    console.log('🧪 Starting Auth Contract Validation...\n');
    let cookie = '';

    try {
        // 0. Register a test user
        console.log(`[0] Registering test user: ${TEST_EMAIL}`);
        try {
            await axios.post(`${BASE_URL}/register`, {
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                name: 'Test Setup User',
                phone: '1234567890'
            });
            console.log('    ✅ User registered.');
        } catch (err) {
            console.log('    ⚠️ User might already exist or system setup issue, but proceeding with login attempt...');
            if (err.response) console.log('    (Status: ' + err.response.status + ', ' + JSON.stringify(err.response.data) + ')');
            else console.log('    (' + err.message + ')');
        }

        // 1. Login
        console.log(`\n[1] Testing POST /login`);
        const loginRes = await axios.post(`${BASE_URL}/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });

        const setCookieHeader = loginRes.headers['set-cookie'];
        if (!setCookieHeader || setCookieHeader.length === 0) {
            throw new Error('No Set-Cookie header found in login response');
        }

        const cookieStr = setCookieHeader[0];
        console.log(`    ✅ Set-Cookie header present: ${cookieStr.split(';')[0]}...`);

        if (!cookieStr.includes('HttpOnly')) throw new Error('Cookie is missing HttpOnly');
        if (!cookieStr.includes('SameSite=Strict')) throw new Error('Cookie is missing SameSite=Strict');
        if (!cookieStr.includes('Path=/v1/auth/refresh')) throw new Error('Cookie is missing Path=/v1/auth/refresh');
        console.log('    ✅ Cookie attributes (HttpOnly, SameSite=Strict, Path) are correct.');

        if (loginRes.data.data.refreshToken) {
            throw new Error('Response body contains refreshToken!');
        }
        console.log('    ✅ Response body does NOT contain refreshToken.');

        if (!loginRes.data.data.accessToken) {
            throw new Error('Response body is missing accessToken!');
        }
        console.log('    ✅ Response body contains accessToken.');

        // Extract raw cookie for next request
        cookie = cookieStr.split(';')[0]; // refreshToken=...

        // 2. Refresh with cookie
        console.log(`\n[2] Testing POST /refresh WITH cookie`);
        const refreshRes = await axios.post(`${BASE_URL}/refresh`, {}, {
            headers: {
                Cookie: cookie
            }
        });

        if (!refreshRes.data.data.accessToken) {
            throw new Error('Refresh response body is missing accessToken!');
        }
        if (refreshRes.data.data.refreshToken) {
            throw new Error('Refresh response body contains refreshToken!');
        }
        console.log('    ✅ Refresh successful. Returned accessToken, no refreshToken in body.');

        const refreshCookieHeader = refreshRes.headers['set-cookie'];
        if (!refreshCookieHeader || refreshCookieHeader.length === 0) {
            throw new Error('No Set-Cookie header found in refresh response');
        }
        console.log('    ✅ Refresh endpoint rotated the HTTP-only cookie.');

        // 3. Refresh without cookie
        console.log(`\n[3] Testing POST /refresh WITHOUT cookie`);
        try {
            await axios.post(`${BASE_URL}/refresh`, {});
            throw new Error('Refresh without cookie should have failed with 401!');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('    ✅ Refresh without cookie correctly returned 401 Unauthorized.');
            } else {
                throw new Error(`Expected 401 but got ${err.response?.status} or another error: ${err.message}`);
            }
        }

        // 4. Logout
        console.log(`\n[4] Testing POST /logout`);
        const logoutRes = await axios.post(`${BASE_URL}/logout`, {}, {
            headers: {
                Cookie: cookie
            }
        });

        const logoutCookieHeader = logoutRes.headers['set-cookie'];
        if (!logoutCookieHeader || logoutCookieHeader.length === 0) {
            throw new Error('No Set-Cookie header found in logout response');
        }

        const logoutCookieStr = logoutCookieHeader[0];
        console.log(`    ✅ Logout successful. Set-Cookie: ${logoutCookieStr}`);

        console.log('\n🎉 All Auth Contract Validation Tests PASSED!');

    } catch (error) {
        console.error('\n❌ VALIDATION FAILED:');
        console.error(error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        process.exit(1);
    }
}

runValidation();
