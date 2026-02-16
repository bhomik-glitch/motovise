/**
 * PHASE 5 - FINANCIAL INTEGRITY TEST EXECUTION
 * Using existing seed users
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:4000/v1';
const PASSWORD = 'Test@1234';

let testLog = '';
const testResults = [];

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
    const snapshot = { timestamp: new Date().toISOString() };

    if (orderId) {
        snapshot.order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                orderNumber: true,
                userId: true,
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

async function getAuthToken(email) {
    const loginResp = await axios.post(`${BASE_URL}/auth/login`, { email, password: PASSWORD });
    return {
        token: loginResp.data.data.accessToken,
        userId: loginResp.data.data.user.id,
    };
}

async function setupTestOrder(token, userId) {
    // Get active product with good stock
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
        // Ignore
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

    if (!address) {
        throw new Error('User has no address');
    }

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

        const { token: token1, userId: userId1 } = await getAuthToken('customer1@gmail.com');
        log(`User: customer1@gmail.com (${userId1})`);

        const { order: order1, product: product1 } = await setupTestOrder(token1, userId1);

        log(`Order: ${order1.orderNumber} (${order1.id})`);
        log(`Product: ${product1.name} (${product1.id})\n`);

        const before1 = await captureDBSnapshot(order1.id, product1.id, userId1);
        log('DB STATE BEFORE:');
        log(JSON.stringify(before1, null, 2));

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

        const after1 = await captureDBSnapshot(order1.id, product1.id, userId1);
        log('\nDB STATE AFTER:');
        log(JSON.stringify(after1, null, 2));

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

        const { token: token2, userId: userId2 } = await getAuthToken('customer2@gmail.com');
        const { order: order2, product: product2 } = await setupTestOrder(token2, userId2);

        log(`Order: ${order2.orderNumber} (${order2.id})\n`);

        const before2 = await captureDBSnapshot(order2.id, product2.id, userId2);
        log('DB STATE BEFORE:');
        log(JSON.stringify(before2, null, 2));

        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order2.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token2}` } }
        );

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

        log(`Retrying order: ${order2.orderNumber}\n`);

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

        const { token: token4, userId: userId4 } = await getAuthToken('customer3@gmail.com');
        const { order: order4, product: product4 } = await setupTestOrder(token4, userId4);

        log(`Order: ${order4.orderNumber} (${order4.id})\n`);

        const before4 = await captureDBSnapshot(order4.id, product4.id, userId4);
        log('DB STATE BEFORE CONCURRENT REQUESTS:');
        log(JSON.stringify(before4, null, 2));

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
            r.status === 'fulfilled' && r.value.data.data && r.value.data.data.alreadyProcessed
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

        const testProduct = await prisma.product.findFirst({
            where: { isActive: true },
        });

        await prisma.product.update({
            where: { id: testProduct.id },
            data: { stock: 1 },
        });

        log(`Product: ${testProduct.name} (Stock set to 1)\n`);

        const { token: token5a } = await getAuthToken('customer4@gmail.com');
        const { token: token5b } = await getAuthToken('customer5@gmail.com');

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

        log(`Order A: ${order5a.data.data.orderNumber}`);
        log(`Order B: ${order5b.data.data.orderNumber}\n`);

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
            after5.stock === 0;

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

        fs.writeFileSync('PHASE5_TEST_EXECUTION_LOG.txt', testLog);
        log('\nFull log saved to: PHASE5_TEST_EXECUTION_LOG.txt');

        if (allPassed) {
            log('\n' + '='.repeat(80));
            log('PHASE COMPLETED: Phase 5');
            log('Phase 5 validated and locked.');
            log('='.repeat(80));
        }

        return allPassed;

    } catch (error) {
        log(`\nFATAL ERROR: ${error.message}`);
        if (error.response) {
            log(`Response Status: ${error.response.status}`);
            log(`Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
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
