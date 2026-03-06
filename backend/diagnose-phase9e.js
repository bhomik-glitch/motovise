'use strict';

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://127.0.0.1:4000/v1';
const prisma = new PrismaClient();

async function main() {
    console.log('\n=== Phase 9E Diagnostic Script ===\n');

    // 1. Auth setup
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    if (!admin || !customer) { throw new Error('Need admin + customer in DB'); }

    const adminToken = jwt.sign({ sub: admin.id, email: admin.email, role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const customerToken = jwt.sign({ sub: customer.id, email: customer.email, role: 'CUSTOMER' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const adminConf = { headers: { Authorization: `Bearer ${adminToken}` } };
    const custConf = { headers: { Authorization: `Bearer ${customerToken}` } };

    // 2. Health
    try {
        const h = await axios.get(`${API_URL}/health`);
        console.log('✅ Health:', JSON.stringify(h.data));
    } catch (e) { console.error('❌ Health failed:', e.message); }

    // 3. Products (verify not throttled)
    try {
        const p = await axios.get(`${API_URL}/products`);
        console.log('✅ GET /products status:', p.status, ' data keys:', Object.keys(p.data));
    } catch (e) { console.error('❌ GET /products failed:', e.message, e.response?.status, e.response?.data); }

    // 4. Cart add (single user)
    try {
        const product = await prisma.product.findFirst({ where: { stock: { gt: 0 } } });
        console.log('  Using product:', product.id);
        const cartRes = await axios.post(`${API_URL}/cart/add`, { productId: product.id, quantity: 1 }, custConf);
        console.log('✅ POST /cart/add:', cartRes.status, JSON.stringify(cartRes.data).substring(0, 200));
    } catch (e) {
        console.error('❌ POST /cart/add failed:', e.response?.status, JSON.stringify(e.response?.data));
    }

    // 5. Cart update
    try {
        const product = await prisma.product.findFirst({ where: { stock: { gt: 0 } } });
        const updRes = await axios.patch(`${API_URL}/cart/update/${product.id}`, { quantity: 2 }, custConf);
        console.log('✅ PATCH /cart/update:', updRes.status, JSON.stringify(updRes.data).substring(0, 150));
    } catch (e) {
        console.error('❌ PATCH /cart/update failed:', e.response?.status, JSON.stringify(e.response?.data));
    }

    // 6. Checkout
    try {
        let addr = await prisma.address.findFirst({ where: { userId: customer.id } });
        if (!addr) {
            addr = await prisma.address.create({
                data: {
                    userId: customer.id, fullName: 'Test User',
                    addressLine1: '123 Test St', city: 'Mumbai',
                    state: 'MH', postalCode: '110001',
                    country: 'IN', phone: '9999999999'
                }
            });
        }
        const orderRes = await axios.post(`${API_URL}/orders`, { addressId: addr.id, paymentMethod: 'COD' }, custConf);
        console.log('✅ POST /orders:', orderRes.status, JSON.stringify(orderRes.data).substring(0, 200));
    } catch (e) {
        console.error('❌ POST /orders failed:', e.response?.status, JSON.stringify(e.response?.data));
    }

    // 7. Dashboard (admin)
    try {
        const d = await axios.get(`${API_URL}/admin/dashboard/ceo`, adminConf);
        console.log('✅ GET /admin/dashboard/ceo:', d.status, Object.keys(d.data?.data || {}));
    } catch (e) {
        console.error('❌ GET /admin/dashboard/ceo failed:', e.response?.status, JSON.stringify(e.response?.data));
    }

    // 8. Throttle test — fire 150 rapid requests to products
    console.log('\n--- Throttle test: 150 concurrent GET /products ---');
    const all = [];
    for (let i = 0; i < 150; i++) {
        all.push(axios.get(`${API_URL}/products`).then(() => 'ok').catch(e => `${e.response?.status || 'ERR'}`));
    }
    const results = await Promise.all(all);
    const success = results.filter(r => r === 'ok').length;
    const throttled = results.filter(r => r === '429').length;
    const errors = results.length - success - throttled;
    console.log(`  Success: ${success} | Throttled (429): ${throttled} | Other errors: ${errors}`);

    await prisma.$disconnect();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
