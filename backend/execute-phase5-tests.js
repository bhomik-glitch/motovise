/**
 * PHASE 5 - FINANCIAL INTEGRITY TEST EXECUTION
 * 
 * Executes all 9 test categories and captures:
 * - Actual request logs
 * - Actual response payloads
 * - Database snapshots before & after
 * - Stock values before & after
 * - Cart state before & after
 * - Concurrency proof
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:4000/v1';

const testResults = [];
let testLog = '';

function log(message) {
    console.log(message);
    testLog += message + '\n';
}

function logSection(title) {
    const line = '='.repeat(80);
    log(`\n${line}`);
    log(title);
    log(`${line}\n`);
}

async function captureDBSnapshot(orderId, productId = null, userId = null) {
    const snapshot = {
        timestamp: new Date().toISOString(),
        order: null,
        product: null,
        cart: null,
    };

    if (orderId) {
        snapshot.order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                orderNumber: true,
                orderStatus: true,
                paymentStatus: true,
                paymentMethod: true,
                gatewayOrderId: true,
                gatewayPaymentId: true,
                total: true,
            },
        });
    }

    if (productId) {
        snapshot.product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, name: true, stock: true },
        });
    }

    if (userId) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });
        snapshot.cart = {
            exists: !!cart,
            itemCount: cart ? cart.items.length : 0,
        };
    }

    return snapshot;
}

async function getToken(email, password = 'Test@1234') {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
        return {
            token: response.data.data.accessToken,
            userId: response.data.data.user.id,
        };
    } catch (error) {
        log(`Login failed for ${email}: ${error.response?.data?.message || error.message}`);
        throw error;
    }
}

async function setupTestOrder(token, userId) {
    // Get active product
    const productsResp = await axios.get(`${BASE_URL}/products?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const products = productsResp.data.data.data || productsResp.data.data;
    const product = products.find(p => p.isActive && p.stock > 10);

    if (!product) {
        throw new Error('No active products with sufficient stock');
    }

    // Clear cart
    try {
        await axios.delete(`${BASE_URL}/cart/clear`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (e) {
        // Cart might be empty
    }

    // Add to cart
    await axios.post(
        `${BASE_URL}/cart/add`,
        { productId: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    // Get address
    const addressResp = await axios.get(`${BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const address = addressResp.data.data[0];

    // Create order
    const orderResp = await axios.post(
        `${BASE_URL}/orders`,
        { addressId: address.id },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return {
        order: orderResp.data.data,
        product,
        userId,
    };
}

async function runTests() {
    logSection('PHASE 5 - FINANCIAL INTEGRITY TEST EXECUTION');
    log(`Started: ${new Date().toLocaleString()}\n`);

    try {
        // ========================================
        // TEST 1: RAZORPAY HAPPY PATH
        // ========================================
        logSection('TEST 1: RAZORPAY HAPPY PATH');

        const { token: token1, userId: userId1 } = await getToken('customer1@gmail.com');
        const { order: order1, product: product1 } = await setupTestOrder(token1, userId1);

        log(`Order Created: ${order1.orderNumber} (${order1.id})`);
        log(`Product: ${product1.name} (${product1.id})`);
        log(`User: ${userId1}\n`);

        // Capture BEFORE state
        const before1 = await captureDBSnapshot(order1.id, product1.id, userId1);
        log('DB STATE BEFORE:');
        log(JSON.stringify(before1, null, 2));

        // Step 1: Initiate Payment
        log('\n--- REQUEST: Initiate Payment ---');
        const initiatePayload = { orderId: order1.id, paymentMethod: 'RAZORPAY' };
        log(JSON.stringify(initiatePayload, null, 2));

        const initiateResp = await axios.post(
            `${BASE_URL}/payments/initiate`,
            initiatePayload,
            { headers: { Authorization: `Bearer ${token1}` } }
        );

        log('\n--- RESPONSE: Initiate Payment ---');
        log(JSON.stringify(initiateResp.data, null, 2));

        // Step 2: Verify Payment
        log('\n--- REQUEST: Verify Payment ---');
        const verifyPayload = {
            orderId: order1.id,
            paymentId: 'pay_test1_happy',
            signature: 'valid_signature',
        };
        log(JSON.stringify(verifyPayload, null, 2));

        const verifyResp = await axios.post(
            `${BASE_URL}/payments/verify`,
            verifyPayload,
            { headers: { Authorization: `Bearer ${token1}` } }
        );

        log('\n--- RESPONSE: Verify Payment ---');
        log(JSON.stringify(verifyResp.data, null, 2));

        // Capture AFTER state
        const after1 = await captureDBSnapshot(order1.id, product1.id, userId1);
        log('\nDB STATE AFTER:');
        log(JSON.stringify(after1, null, 2));

        // Validate
        const test1Pass =
            after1.order.paymentStatus === 'PAID' &&
            after1.order.orderStatus === 'CONFIRMED' &&
            after1.order.gatewayPaymentId === 'pay_test1_happy' &&
            after1.product.stock === before1.product.stock - 1 &&
            after1.cart.itemCount === 0;

        testResults.push({
            test: 'TEST 1: RAZORPAY HAPPY PATH',
            status: test1Pass ? 'PASS' : 'FAIL',
            details: {
                paymentStatus: after1.order.paymentStatus,
                orderStatus: after1.order.orderStatus,
                stockBefore: before1.product.stock,
                stockAfter: after1.product.stock,
                cartCleared: after1.cart.itemCount === 0,
            },
        });

        log(`\n>>> TEST 1: ${test1Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // TEST 2: INVALID SIGNATURE
        // ========================================
        logSection('TEST 2: INVALID SIGNATURE');

        const { token: token2, userId: userId2 } = await getToken('customer2@gmail.com');
        const { order: order2, product: product2 } = await setupTestOrder(token2, userId2);

        log(`Order Created: ${order2.orderNumber} (${order2.id})`);
        log(`Product: ${product2.name} (${product2.id})\n`);

        const before2 = await captureDBSnapshot(order2.id, product2.id, userId2);
        log('DB STATE BEFORE:');
        log(JSON.stringify(before2, null, 2));

        // Initiate
        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order2.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token2}` } }
        );

        // Verify with invalid signature
        log('\n--- REQUEST: Verify Payment (Invalid Signature) ---');
        const invalidPayload = {
            orderId: order2.id,
            paymentId: 'pay_test2_invalid',
            signature: 'INVALID_SIGNATURE',
        };
        log(JSON.stringify(invalidPayload, null, 2));

        const invalidResp = await axios.post(
            `${BASE_URL}/payments/verify`,
            invalidPayload,
            { headers: { Authorization: `Bearer ${token2}` } }
        );

        log('\n--- RESPONSE: Verify Payment ---');
        log(JSON.stringify(invalidResp.data, null, 2));

        const after2 = await captureDBSnapshot(order2.id, product2.id, userId2);
        log('\nDB STATE AFTER:');
        log(JSON.stringify(after2, null, 2));

        const test2Pass =
            after2.order.paymentStatus === 'FAILED' &&
            after2.order.orderStatus === 'PENDING' &&
            after2.product.stock === before2.product.stock &&
            after2.cart.itemCount > 0;

        testResults.push({
            test: 'TEST 2: INVALID SIGNATURE',
            status: test2Pass ? 'PASS' : 'FAIL',
            details: {
                paymentStatus: after2.order.paymentStatus,
                orderStatus: after2.order.orderStatus,
                stockUnchanged: after2.product.stock === before2.product.stock,
                cartNotCleared: after2.cart.itemCount > 0,
            },
        });

        log(`\n>>> TEST 2: ${test2Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // TEST 3: RETRY AFTER FAILED
        // ========================================
        logSection('TEST 3: RETRY AFTER FAILED');

        log(`Retrying order: ${order2.orderNumber} (currently FAILED)\n`);

        const before3 = await captureDBSnapshot(order2.id, product2.id, userId2);
        log('DB STATE BEFORE RETRY:');
        log(JSON.stringify(before3, null, 2));

        log('\n--- REQUEST: Retry Verify Payment ---');
        const retryPayload = {
            orderId: order2.id,
            paymentId: 'pay_test2_retry',
            signature: 'valid_signature',
        };
        log(JSON.stringify(retryPayload, null, 2));

        const retryResp = await axios.post(
            `${BASE_URL}/payments/verify`,
            retryPayload,
            { headers: { Authorization: `Bearer ${token2}` } }
        );

        log('\n--- RESPONSE: Retry Verify ---');
        log(JSON.stringify(retryResp.data, null, 2));

        const after3 = await captureDBSnapshot(order2.id, product2.id, userId2);
        log('\nDB STATE AFTER RETRY:');
        log(JSON.stringify(after3, null, 2));

        const test3Pass =
            before3.order.paymentStatus === 'FAILED' &&
            after3.order.paymentStatus === 'PAID' &&
            after3.order.orderStatus === 'CONFIRMED' &&
            after3.product.stock === before3.product.stock - 1 &&
            after3.cart.itemCount === 0;

        testResults.push({
            test: 'TEST 3: RETRY AFTER FAILED',
            status: test3Pass ? 'PASS' : 'FAIL',
            details: {
                beforeStatus: before3.order.paymentStatus,
                afterStatus: after3.order.paymentStatus,
                transitioned: 'FAILED -> PAID',
                stockDeductedOnce: after3.product.stock === before3.product.stock - 1,
            },
        });

        log(`\n>>> TEST 3: ${test3Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // TEST 4: CONCURRENCY - DOUBLE VERIFY
        // ========================================
        logSection('TEST 4: CONCURRENCY - DOUBLE VERIFY');

        const { token: token4, userId: userId4 } = await getToken('customer3@gmail.com');
        const { order: order4, product: product4 } = await setupTestOrder(token4, userId4);

        log(`Order Created: ${order4.orderNumber} (${order4.id})`);
        log(`Product: ${product4.name} (${product4.id})\n`);

        const before4 = await captureDBSnapshot(order4.id, product4.id, userId4);
        log('DB STATE BEFORE CONCURRENT REQUESTS:');
        log(JSON.stringify(before4, null, 2));

        // Initiate
        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order4.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token4}` } }
        );

        log('\n--- CONCURRENT REQUESTS: Two Simultaneous Verify Calls ---');
        const concurrentPayload = {
            orderId: order4.id,
            paymentId: 'pay_test4_concurrent',
            signature: 'valid_signature',
        };
        log('Payload (both requests):');
        log(JSON.stringify(concurrentPayload, null, 2));

        const promise1 = axios.post(
            `${BASE_URL}/payments/verify`,
            concurrentPayload,
            { headers: { Authorization: `Bearer ${token4}` } }
        );

        const promise2 = axios.post(
            `${BASE_URL}/payments/verify`,
            concurrentPayload,
            { headers: { Authorization: `Bearer ${token4}` } }
        );

        const [result1, result2] = await Promise.allSettled([promise1, promise2]);

        log('\n--- RESPONSE: Request 1 ---');
        if (result1.status === 'fulfilled') {
            log(JSON.stringify(result1.value.data, null, 2));
        } else {
            log(`ERROR: ${result1.reason.response?.status} - ${result1.reason.response?.data?.message}`);
        }

        log('\n--- RESPONSE: Request 2 ---');
        if (result2.status === 'fulfilled') {
            log(JSON.stringify(result2.value.data, null, 2));
        } else {
            log(`ERROR: ${result2.reason.response?.status} - ${result2.reason.response?.data?.message}`);
        }

        const after4 = await captureDBSnapshot(order4.id, product4.id, userId4);
        log('\nDB STATE AFTER CONCURRENT REQUESTS:');
        log(JSON.stringify(after4, null, 2));

        const successCount = [result1, result2].filter(r =>
            r.status === 'fulfilled' && r.value.data.success
        ).length;

        const alreadyProcessedCount = [result1, result2].filter(r =>
            r.status === 'fulfilled' && r.value.data.alreadyProcessed
        ).length;

        const test4Pass =
            after4.order.paymentStatus === 'PAID' &&
            after4.product.stock === before4.product.stock - 1 &&
            after4.cart.itemCount === 0 &&
            (successCount === 1 || (successCount === 2 && alreadyProcessedCount === 1));

        testResults.push({
            test: 'TEST 4: CONCURRENCY - DOUBLE VERIFY',
            status: test4Pass ? 'PASS' : 'FAIL',
            details: {
                request1: result1.status,
                request2: result2.status,
                successCount,
                alreadyProcessedCount,
                stockDeductedOnce: after4.product.stock === before4.product.stock - 1,
                cartClearedOnce: after4.cart.itemCount === 0,
            },
        });

        log(`\n>>> TEST 4: ${test4Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // TEST 5: STOCK EXHAUSTION
        // ========================================
        logSection('TEST 5: STOCK EXHAUSTION');

        // Find product and set stock to 1
        const testProduct = await prisma.product.findFirst({
            where: { isActive: true },
        });

        await prisma.product.update({
            where: { id: testProduct.id },
            data: { stock: 1 },
        });

        log(`Product: ${testProduct.name} (${testProduct.id})`);
        log(`Stock set to: 1\n`);

        // Create two orders
        const { token: token5a, userId: userId5a } = await getToken('customer4@gmail.com');
        const { token: token5b, userId: userId5b } = await getToken('customer5@gmail.com');

        // Order A
        await axios.delete(`${BASE_URL}/cart/clear`, { headers: { Authorization: `Bearer ${token5a}` } });
        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId: testProduct.id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token5a}` } }
        );
        const addr5a = await axios.get(`${BASE_URL}/addresses`, { headers: { Authorization: `Bearer ${token5a}` } });
        const order5a = await axios.post(
            `${BASE_URL}/orders`,
            { addressId: addr5a.data.data[0].id },
            { headers: { Authorization: `Bearer ${token5a}` } }
        );

        // Order B
        await axios.delete(`${BASE_URL}/cart/clear`, { headers: { Authorization: `Bearer ${token5b}` } });
        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId: testProduct.id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token5b}` } }
        );
        const addr5b = await axios.get(`${BASE_URL}/addresses`, { headers: { Authorization: `Bearer ${token5b}` } });
        const order5b = await axios.post(
            `${BASE_URL}/orders`,
            { addressId: addr5b.data.data[0].id },
            { headers: { Authorization: `Bearer ${token5b}` } }
        );

        log(`Order A: ${order5a.data.data.orderNumber} (${order5a.data.data.id})`);
        log(`Order B: ${order5b.data.data.orderNumber} (${order5b.data.data.id})\n`);

        // Initiate both
        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order5a.data.data.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token5a}` } }
        );

        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order5b.data.data.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token5b}` } }
        );

        const before5 = await prisma.product.findUnique({
            where: { id: testProduct.id },
            select: { stock: true },
        });
        log(`Stock BEFORE concurrent verify: ${before5.stock}`);

        log('\n--- CONCURRENT REQUESTS: Two Orders, Stock = 1 ---');

        const verify5a = axios.post(
            `${BASE_URL}/payments/verify`,
            { orderId: order5a.data.data.id, paymentId: 'pay_5a', signature: 'valid_signature' },
            { headers: { Authorization: `Bearer ${token5a}` } }
        );

        const verify5b = axios.post(
            `${BASE_URL}/payments/verify`,
            { orderId: order5b.data.data.id, paymentId: 'pay_5b', signature: 'valid_signature' },
            { headers: { Authorization: `Bearer ${token5b}` } }
        );

        const [res5a, res5b] = await Promise.allSettled([verify5a, verify5b]);

        log('\n--- RESPONSE: Order A ---');
        if (res5a.status === 'fulfilled') {
            log(JSON.stringify(res5a.value.data, null, 2));
        } else {
            log(`ERROR: ${res5a.reason.response?.status} - ${res5a.reason.response?.data?.message}`);
        }

        log('\n--- RESPONSE: Order B ---');
        if (res5b.status === 'fulfilled') {
            log(JSON.stringify(res5b.value.data, null, 2));
        } else {
            log(`ERROR: ${res5b.reason.response?.status} - ${res5b.reason.response?.data?.message}`);
        }

        const after5 = await prisma.product.findUnique({
            where: { id: testProduct.id },
            select: { stock: true },
        });
        log(`\nStock AFTER concurrent verify: ${after5.stock}`);

        const successCount5 = [res5a, res5b].filter(r => r.status === 'fulfilled' && r.value.data.success).length;
        const failCount5 = [res5a, res5b].filter(r => r.status === 'rejected').length;

        const test5Pass =
            successCount5 === 1 &&
            failCount5 === 1 &&
            after5.stock === 0 &&
            after5.stock >= 0;

        testResults.push({
            test: 'TEST 5: STOCK EXHAUSTION',
            status: test5Pass ? 'PASS' : 'FAIL',
            details: {
                initialStock: 1,
                finalStock: after5.stock,
                successCount: successCount5,
                failCount: failCount5,
                noOverselling: after5.stock >= 0,
            },
        });

        log(`\n>>> TEST 5: ${test5Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // TEST 6: COD FLOW
        // ========================================
        logSection('TEST 6: COD FLOW');

        const { token: token6, userId: userId6 } = await getToken('customer6@gmail.com');
        const { order: order6, product: product6 } = await setupTestOrder(token6, userId6);

        log(`Order Created: ${order6.orderNumber} (${order6.id})\n`);

        const before6 = await captureDBSnapshot(order6.id, product6.id, userId6);
        log('DB STATE BEFORE COD:');
        log(JSON.stringify(before6, null, 2));

        log('\n--- REQUEST: Initiate COD ---');
        const codPayload = { orderId: order6.id, paymentMethod: 'COD' };
        log(JSON.stringify(codPayload, null, 2));

        const codResp = await axios.post(
            `${BASE_URL}/payments/initiate`,
            codPayload,
            { headers: { Authorization: `Bearer ${token6}` } }
        );

        log('\n--- RESPONSE: COD Initiate ---');
        log(JSON.stringify(codResp.data, null, 2));

        const after6 = await captureDBSnapshot(order6.id, product6.id, userId6);
        log('\nDB STATE AFTER COD:');
        log(JSON.stringify(after6, null, 2));

        const test6Pass =
            after6.order.orderStatus === 'CONFIRMED' &&
            after6.order.paymentMethod === 'COD' &&
            after6.order.paymentStatus === 'PENDING' &&
            after6.product.stock === before6.product.stock - 1 &&
            after6.cart.itemCount === 0;

        testResults.push({
            test: 'TEST 6: COD FLOW',
            status: test6Pass ? 'PASS' : 'FAIL',
            details: {
                orderStatus: after6.order.orderStatus,
                paymentMethod: after6.order.paymentMethod,
                paymentStatus: after6.order.paymentStatus,
                stockDeducted: after6.product.stock === before6.product.stock - 1,
                cartCleared: after6.cart.itemCount === 0,
            },
        });

        log(`\n>>> TEST 6: ${test6Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // TEST 7: PAYMENT METHOD IMMUTABILITY
        // ========================================
        logSection('TEST 7: PAYMENT METHOD IMMUTABILITY');

        const { token: token7 } = await getToken('customer7@gmail.com');
        const { order: order7 } = await setupTestOrder(token7);

        log(`Order Created: ${order7.orderNumber} (${order7.id})\n`);

        log('--- REQUEST: Initiate RAZORPAY ---');
        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order7.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token7}` } }
        );
        log('Payment method set to RAZORPAY\n');

        log('--- REQUEST: Attempt Switch to COD ---');
        try {
            await axios.post(
                `${BASE_URL}/payments/initiate`,
                { orderId: order7.id, paymentMethod: 'COD' },
                { headers: { Authorization: `Bearer ${token7}` } }
            );
            log('ERROR: Switch succeeded (should have failed)');
            testResults.push({ test: 'TEST 7: PAYMENT METHOD IMMUTABILITY', status: 'FAIL' });
        } catch (error) {
            log('\n--- RESPONSE: Switch Attempt ---');
            log(`Status: ${error.response?.status}`);
            log(`Message: ${error.response?.data?.message}`);

            const test7Pass =
                error.response?.status === 400 &&
                error.response?.data?.message?.includes('locked');

            testResults.push({
                test: 'TEST 7: PAYMENT METHOD IMMUTABILITY',
                status: test7Pass ? 'PASS' : 'FAIL',
                details: {
                    errorStatus: error.response?.status,
                    errorMessage: error.response?.data?.message,
                },
            });

            log(`\n>>> TEST 7: ${test7Pass ? 'PASS' : 'FAIL'} <<<\n`);
        }

        // ========================================
        // TEST 8: WEBHOOK SAFETY
        // ========================================
        logSection('TEST 8: WEBHOOK SAFETY');

        const { token: token8, userId: userId8 } = await getToken('customer8@gmail.com');
        const { order: order8, product: product8 } = await setupTestOrder(token8, userId8);

        log(`Order Created: ${order8.orderNumber} (${order8.id})\n`);

        const initResp8 = await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order8.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token8}` } }
        );

        const gatewayOrderId8 = initResp8.data.gatewayOrderId;

        const before8 = await captureDBSnapshot(order8.id, product8.id, userId8);
        log('DB STATE BEFORE WEBHOOK:');
        log(JSON.stringify(before8, null, 2));

        log('\n--- REQUEST: Webhook (First) ---');
        const webhookPayload = {
            orderId: gatewayOrderId8,
            paymentId: 'pay_webhook_test',
            status: 'paid',
        };
        log(JSON.stringify(webhookPayload, null, 2));

        const webhook1 = await axios.post(`${BASE_URL}/payments/webhook`, webhookPayload);

        log('\n--- RESPONSE: Webhook 1 ---');
        log(JSON.stringify(webhook1.data, null, 2));

        log('\n--- REQUEST: Webhook (Second, Same Payload) ---');
        const webhook2 = await axios.post(`${BASE_URL}/payments/webhook`, webhookPayload);

        log('\n--- RESPONSE: Webhook 2 ---');
        log(JSON.stringify(webhook2.data, null, 2));

        const after8 = await captureDBSnapshot(order8.id, product8.id, userId8);
        log('\nDB STATE AFTER WEBHOOKS:');
        log(JSON.stringify(after8, null, 2));

        const test8Pass =
            webhook1.data.success && !webhook1.data.alreadyProcessed &&
            webhook2.data.success && webhook2.data.alreadyProcessed &&
            after8.product.stock === before8.product.stock - 1;

        testResults.push({
            test: 'TEST 8: WEBHOOK SAFETY',
            status: test8Pass ? 'PASS' : 'FAIL',
            details: {
                webhook1Processed: !webhook1.data.alreadyProcessed,
                webhook2Idempotent: webhook2.data.alreadyProcessed,
                stockDeductedOnce: after8.product.stock === before8.product.stock - 1,
            },
        });

        log(`\n>>> TEST 8: ${test8Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // TEST 9: REPLAY ATTACK PREVENTION
        // ========================================
        logSection('TEST 9: REPLAY ATTACK PREVENTION');

        const { token: token9 } = await getToken('customer9@gmail.com');
        const { order: order9 } = await setupTestOrder(token9);

        log(`Order Created: ${order9.orderNumber} (${order9.id})\n`);

        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order9.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token9}` } }
        );

        log('--- REQUEST: Verify with paymentId A ---');
        const verify9a = await axios.post(
            `${BASE_URL}/payments/verify`,
            { orderId: order9.id, paymentId: 'pay_A', signature: 'valid_signature' },
            { headers: { Authorization: `Bearer ${token9}` } }
        );

        log('--- RESPONSE: Verify A ---');
        log(JSON.stringify(verify9a.data, null, 2));

        log('\n--- REQUEST: Verify with Different paymentId B ---');
        try {
            await axios.post(
                `${BASE_URL}/payments/verify`,
                { orderId: order9.id, paymentId: 'pay_B', signature: 'valid_signature' },
                { headers: { Authorization: `Bearer ${token9}` } }
            );
            log('ERROR: Replay succeeded (should have failed)');
            testResults.push({ test: 'TEST 9: REPLAY ATTACK PREVENTION', status: 'FAIL' });
        } catch (error) {
            log('\n--- RESPONSE: Replay Attempt ---');
            log(`Status: ${error.response?.status}`);
            log(`Message: ${error.response?.data?.message}`);

            const after9 = await captureDBSnapshot(order9.id);
            log('\nDB STATE AFTER REPLAY ATTEMPT:');
            log(JSON.stringify(after9, null, 2));

            const test9Pass =
                error.response?.status === 400 &&
                error.response?.data?.message?.includes('mismatch') &&
                after9.order.gatewayPaymentId === 'pay_A';

            testResults.push({
                test: 'TEST 9: REPLAY ATTACK PREVENTION',
                status: test9Pass ? 'PASS' : 'FAIL',
                details: {
                    errorStatus: error.response?.status,
                    errorMessage: error.response?.data?.message,
                    paymentIdUnchanged: after9.order.gatewayPaymentId === 'pay_A',
                },
            });

            log(`\n>>> TEST 9: ${test9Pass ? 'PASS' : 'FAIL'} <<<\n`);
        }

        // ========================================
        // FINAL SUMMARY
        // ========================================
        logSection('TEST EXECUTION SUMMARY');

        testResults.forEach(result => {
            log(`${result.status === 'PASS' ? '✓' : '✗'} ${result.test}: ${result.status}`);
            if (result.details) {
                log(`  Details: ${JSON.stringify(result.details, null, 2)}`);
            }
        });

        const allPassed = testResults.every(r => r.status === 'PASS');
        const passCount = testResults.filter(r => r.status === 'PASS').length;
        const failCount = testResults.filter(r => r.status === 'FAIL').length;

        log(`\nTotal: ${testResults.length}`);
        log(`Passed: ${passCount}`);
        log(`Failed: ${failCount}`);

        log(`\nCompleted: ${new Date().toLocaleString()}`);

        // Write to file
        fs.writeFileSync('PHASE5_TEST_EXECUTION_LOG.txt', testLog);
        log('\nFull log saved to: PHASE5_TEST_EXECUTION_LOG.txt');

        return allPassed;

    } catch (error) {
        log(`\nFATAL ERROR: ${error.message}`);
        console.error(error);
        fs.writeFileSync('PHASE5_TEST_EXECUTION_LOG.txt', testLog);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

runTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
