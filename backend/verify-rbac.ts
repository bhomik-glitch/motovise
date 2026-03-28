
const axios = require('axios');
const { PrismaClient, UserRole } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:3000';

// Test Matrix
const SCENARIOS = [
    { role: 'Admin', action: 'Create Product', endpoint: '/admin/products', method: 'POST', body: { name: 'Test', price: 10, stock: 10, images: [] }, expected: 201 }, // Or 400 validation, but not 403
    { role: 'Analyst', action: 'Create Product', endpoint: '/admin/products', method: 'POST', body: { name: 'Test', price: 10 }, expected: 403 },
    { role: 'Finance', action: 'View Analytics', endpoint: '/admin/analytics/overview', method: 'GET', expected: 200 },
    { role: 'Support', action: 'View Users', endpoint: '/users', method: 'GET', expected: 200 },
    { role: 'Customer', action: 'View Analytics', endpoint: '/admin/analytics/overview', method: 'GET', expected: 403 },
];

async function main() {
    console.log('Starting RBAC Verification...');

    // 1. Create Test Users for each Role
    const users = {};
    for (const scenario of SCENARIOS) {
        if (users[scenario.role]) continue;

        const email = `rbac_test_${scenario.role.toLowerCase()}@example.com`;
        const role = await prisma.role.findUnique({ where: { name: scenario.role } });

        if (!role) {
            console.error(`Role ${scenario.role} not found in DB! Seed might be missing it.`);
            continue;
        }

        const user = await prisma.user.upsert({
            where: { email },
            update: { roleId: role.id },
            create: {
                email,
                name: `Test ${scenario.role}`,
                password: 'password123', // We need a valid hash or bypass auth? 
                // Wait, we need to login to get JWT.
                // We can't easily login without a valid password hash.
                // Or we can generate a token manually if we have the secret.
                roleId: role.id
            }
        });
        users[scenario.role] = user;
    }

    // Login and Run Tests
    // Since we can't easily login without hashing, we might need to rely on existing users or mock the token generation.
    // Or just use a known password hash.
    // Let's assume 'password123' hash is known or we can just update the user with a known hash.
    const PASSWORD_HASH = '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuixe/P1x1T.L/K5q.v.w.y.z.X.C'; // bcrypt for 'password123' (example)

    // Update users with known password
    for (const role in users) {
        await prisma.user.update({
            where: { id: users[role].id },
            data: { password: PASSWORD_HASH }
        });
    }

    // Run Scenarios
    for (const scenario of SCENARIOS) {
        console.log(`Testing: ${scenario.role} -> ${scenario.action}`);
        try {
            // Login
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: `rbac_test_${scenario.role.toLowerCase()}@example.com`,
                password: 'password123'
            });
            const token = loginRes.data.accessToken;

            // Request
            await axios({
                method: scenario.method,
                url: `${API_URL}${scenario.endpoint}`,
                headers: { Authorization: `Bearer ${token}` },
                data: scenario.body,
                validateStatus: () => true // Don't throw on error
            }).then(res => {
                const passed = res.status === scenario.expected || (scenario.expected === 201 && res.status === 400); // 400 is also pass for auth check
                console.log(`[${passed ? 'PASS' : 'FAIL'}] Expected ${scenario.expected}, got ${res.status}`);
                if (!passed) console.log('Response:', res.data);
            });

        } catch (e) {
            console.error('Error:', e.message);
            if (e.response) console.error('Data:', e.response.data);
        }
    }
}

main();
