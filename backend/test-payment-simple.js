/**
 * Simple Payment Test - Validates basic Razorpay flow
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:4000/v1';

async function simpleTest() {
    try {
        console.log('=== SIMPLE PAYMENT TEST ===\n');

        // 1. Login
        console.log('1. Logging in...');
        const loginResp = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'customer1@gmail.com',
            password: 'Test@1234',
        });
        const token = loginResp.data.data.accessToken;
        const userId = loginResp.data.data.user.id;
        console.log(`✅ Logged in as: ${userId}\n`);

        // 2. Get existing orders
        console.log('2. Checking existing orders...');
        const ordersResp = await axios.get(`${BASE_URL}/orders/my`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const existingOrders = ordersResp.data.data.data || ordersResp.data.data;

        if (existingOrders.length > 0) {
            const pendingOrder = existingOrders.find(o => o.paymentStatus === 'PENDING');

            if (pendingOrder) {
                console.log(`✅ Found pending order: ${pendingOrder.orderNumber}`);
                console.log(`   Order ID: ${pendingOrder.id}`);
                console.log(`   User ID: ${pendingOrder.userId}`);
                console.log(`   Payment Status: ${pendingOrder.paymentStatus}\n`);

                // 3. Initiate payment
                console.log('3. Initiating payment...');
                const initiateResp = await axios.post(
                    `${BASE_URL}/payments/initiate`,
                    { orderId: pendingOrder.id, paymentMethod: 'RAZORPAY' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log(`✅ Payment initiated`);
                console.log(`   Gateway Order ID: ${initiateResp.data.gatewayOrderId}\n`);

                // 4. Verify payment
                console.log('4. Verifying payment...');
                const verifyResp = await axios.post(
                    `${BASE_URL}/payments/verify`,
                    {
                        orderId: pendingOrder.id,
                        paymentId: 'pay_simple_test',
                        signature: 'valid_signature',
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log(`✅ Payment verified`);
                console.log(`   Success: ${verifyResp.data.success}`);
                console.log(`   Order Status: ${verifyResp.data.order.status}`);
                console.log(`   Payment Status: ${verifyResp.data.order.paymentStatus}\n`);

                console.log('=== TEST PASSED ===');
                return true;
            }
        }

        console.log('❌ No pending orders found. Please create an order first.');
        return false;

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        console.error('Error:', error.response?.data || error.message);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

simpleTest().then(success => process.exit(success ? 0 : 1));
