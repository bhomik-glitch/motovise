const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:4000/v1';

(async () => {
    try {
        // Login
        console.log('1. Logging in as customer1@gmail.com...');
        const loginResp = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'customer1@gmail.com',
            password: 'Test@1234'
        });

        const token = loginResp.data.data.accessToken;
        const userId = loginResp.data.data.user.id;

        console.log(`   Token userId: ${userId}`);
        console.log(`   Token (first 50 chars): ${token.substring(0, 50)}...\n`);

        // Get products
        console.log('2. Getting products...');
        const productsResp = await axios.get(`${BASE_URL}/products?limit=5`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const product = productsResp.data.data.data[0];
        console.log(`   Product: ${product.name} (${product.id})\n`);

        // Clear cart
        console.log('3. Clearing cart...');
        try {
            await axios.delete(`${BASE_URL}/cart/clear`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('   Cart cleared\n');
        } catch (e) {
            console.log('   Cart was already empty\n');
        }

        // Add to cart
        console.log('4. Adding to cart...');
        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId: product.id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('   Added to cart\n');

        // Get address
        console.log('5. Getting address...');
        const addressResp = await axios.get(`${BASE_URL}/addresses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const address = addressResp.data.data[0];
        console.log(`   Address ID: ${address.id}\n`);

        // Create order
        console.log('6. Creating order...');
        const orderResp = await axios.post(
            `${BASE_URL}/orders`,
            { addressId: address.id },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const order = orderResp.data.data;
        console.log(`   Order created: ${order.orderNumber} (${order.id})`);
        console.log(`   Order userId: ${order.userId}\n`);

        // Check DB directly
        console.log('7. Checking order in database...');
        const dbOrder = await prisma.order.findUnique({
            where: { id: order.id },
            select: { id: true, userId: true, orderNumber: true }
        });
        console.log(`   DB Order userId: ${dbOrder.userId}`);
        console.log(`   Match: ${dbOrder.userId === userId ? 'YES ✓' : 'NO ✗'}\n`);

        // Try to initiate payment
        console.log('8. Initiating payment...');
        try {
            const initiateResp = await axios.post(
                `${BASE_URL}/payments/initiate`,
                { orderId: order.id, paymentMethod: 'RAZORPAY' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('   SUCCESS!');
            console.log(`   Gateway Order ID: ${initiateResp.data.gatewayOrderId}\n`);
        } catch (error) {
            console.log(`   FAILED: ${error.response?.status} - ${error.response?.data?.message}`);
            console.log(`   \n   Debugging:`);
            console.log(`   - JWT userId: ${userId}`);
            console.log(`   - Order userId: ${order.userId}`);
            console.log(`   - DB userId: ${dbOrder.userId}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    } finally {
        await prisma.$disconnect();
    }
})();
