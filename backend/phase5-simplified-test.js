/**
 * PHASE 5 - SIMPLIFIED FINANCIAL INTEGRITY TEST
 * Demonstrates all key test categories with actual results
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

async function getAuthToken(email) {
    const loginResp = await axios.post(`${BASE_URL}/auth/login`, { email, password: PASSWORD });
    return {
        token: loginResp.data.data.accessToken,
        userId: loginResp.data.data.user.id,
    };
}

async function runTests() {
    logSection('PHASE 5 - FINANCIAL INTEGRITY TEST EXECUTION');
    log(`Started: ${new Date().toLocaleString()}\n`);

    try {
        // Reset stock for all active products
        await prisma.product.updateMany({
            where: { isActive: true },
            data: { stock: 500 }
        });
        log('✓ Stock reset to 500 for all active products\n');

        // Get list of active products
        const products = await prisma.product.findMany({
            where: { isActive: true },
            take: 10,
            select: { id: true, name: true, stock: true }
        });
        log(`Found ${products.length} active products\n`);

        // ========================================
        // TEST 1: RAZORPAY HAPPY PATH
        // ========================================
        logSection('TEST 1: RAZORPAY HAPPY PATH');

        const { token: token1, userId: userId1 } = await getAuthToken('customer1@gmail.com');

        // Create order manually
        await axios.delete(`${BASE_URL}/cart/clear`, { headers: { Authorization: `Bearer ${token1}` } });
        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId: products[0].id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token1}` } }
        );
        const addr1 = await axios.get(`${BASE_URL}/addresses`, { headers: { Authorization: `Bearer ${token1}` } });
        const order1Resp = await axios.post(
            `${BASE_URL}/orders`,
            { addressId: addr1.data.data[0].id },
            { headers: { Authorization: `Bearer ${token1}` } }
        );
        const order1 = order1Resp.data.data;

        log(`Order: ${order1.orderNumber} (${order1.id})`);
        log(`Product: ${products[0].name}\n`);

        // Get DB state before
        const before1 = await prisma.order.findUnique({
            where: { id: order1.id },
            select: { paymentStatus: true, orderStatus: true, gatewayPaymentId: true }
        });
        log('DB STATE BEFORE:');
        log(JSON.stringify(before1, null, 2));

        // Initiate payment
        log('\n--- REQUEST: Initiate Payment ---');
        const initiateResp = await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order1.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token1}` } }
        );
        log(JSON.stringify(initiateResp.data, null, 2));

        // Verify payment
        log('\n--- REQUEST: Verify Payment ---');
        const verifyResp = await axios.post(
            `${BASE_URL}/payments/verify`,
            { orderId: order1.id, paymentId: 'pay_test1', signature: 'valid_signature' },
            { headers: { Authorization: `Bearer ${token1}` } }
        );
        log('\n--- RESPONSE: Verify Payment ---');
        log(JSON.stringify(verifyResp.data, null, 2));

        // Get DB state after
        const after1 = await prisma.order.findUnique({
            where: { id: order1.id },
            select: { paymentStatus: true, orderStatus: true, gatewayPaymentId: true }
        });
        log('\nDB STATE AFTER:');
        log(JSON.stringify(after1, null, 2));

        const test1Pass =
            after1.paymentStatus === 'PAID' &&
            after1.orderStatus === 'CONFIRMED' &&
            after1.gatewayPaymentId === 'pay_test1';

        testResults.push({
            test: 'TEST 1: RAZORPAY HAPPY PATH',
            status: test1Pass ? 'PASS' : 'FAIL',
            details: after1
        });

        log(`\n>>> TEST 1: ${test1Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // TEST 2: INVALID SIGNATURE
        // ========================================
        logSection('TEST 2: INVALID SIGNATURE');

        const { token: token2 } = await getAuthToken('customer2@gmail.com');

        await axios.delete(`${BASE_URL}/cart/clear`, { headers: { Authorization: `Bearer ${token2}` } });
        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId: products[1].id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token2}` } }
        );
        const addr2 = await axios.get(`${BASE_URL}/addresses`, { headers: { Authorization: `Bearer ${token2}` } });
        const order2Resp = await axios.post(
            `${BASE_URL}/orders`,
            { addressId: addr2.data.data[0].id },
            { headers: { Authorization: `Bearer ${token2}` } }
        );
        const order2 = order2Resp.data.data;

        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order2.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token2}` } }
        );

        log('\n--- REQUEST: Verify with Invalid Signature ---');
        const invalidResp = await axios.post(
            `${BASE_URL}/payments/verify`,
            { orderId: order2.id, paymentId: 'pay_test2', signature: 'INVALID_SIG' },
            { headers: { Authorization: `Bearer ${token2}` } }
        );
        log('\n--- RESPONSE ---');
        log(JSON.stringify(invalidResp.data, null, 2));

        const after2 = await prisma.order.findUnique({
            where: { id: order2.id },
            select: { paymentStatus: true, orderStatus: true }
        });
        log('\nDB STATE AFTER:');
        log(JSON.stringify(after2, null, 2));

        const test2Pass = after2.paymentStatus === 'FAILED' && after2.orderStatus === 'PENDING';

        testResults.push({
            test: 'TEST 2: INVALID SIGNATURE',
            status: test2Pass ? 'PASS' : 'FAIL',
            details: after2
        });

        log(`\n>>> TEST 2: ${test2Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // TEST 3: RETRY AFTER FAILED
        // ========================================
        logSection('TEST 3: RETRY AFTER FAILED');

        log(`Retrying order: ${order2.orderNumber}\n`);

        log('\n--- REQUEST: Retry with Valid Signature ---');
        const retryResp = await axios.post(
            `${BASE_URL}/payments/verify`,
            { orderId: order2.id, paymentId: 'pay_test2_retry', signature: 'valid_signature' },
            { headers: { Authorization: `Bearer ${token2}` } }
        );
        log('\n--- RESPONSE ---');
        log(JSON.stringify(retryResp.data, null, 2));

        const after3 = await prisma.order.findUnique({
            where: { id: order2.id },
            select: { paymentStatus: true, orderStatus: true, gatewayPaymentId: true }
        });
        log('\nDB STATE AFTER RETRY:');
        log(JSON.stringify(after3, null, 2));

        const test3Pass =
            after3.paymentStatus === 'PAID' &&
            after3.orderStatus === 'CONFIRMED' &&
            after3.gatewayPaymentId === 'pay_test2_retry';

        testResults.push({
            test: 'TEST 3: RETRY AFTER FAILED',
            status: test3Pass ? 'PASS' : 'FAIL',
            details: after3
        });

        log(`\n>>> TEST 3: ${test3Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // TEST 4: IDEMPOTENCY - DOUBLE VERIFY
        // ========================================
        logSection('TEST 4: IDEMPOTENCY - DOUBLE VERIFY');

        const { token: token4 } = await getAuthToken('customer3@gmail.com');

        await axios.delete(`${BASE_URL}/cart/clear`, { headers: { Authorization: `Bearer ${token4}` } });
        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId: products[2].id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token4}` } }
        );
        const addr4 = await axios.get(`${BASE_URL}/addresses`, { headers: { Authorization: `Bearer ${token4}` } });
        const order4Resp = await axios.post(
            `${BASE_URL}/orders`,
            { addressId: addr4.data.data[0].id },
            { headers: { Authorization: `Bearer ${token4}` } }
        );
        const order4 = order4Resp.data.data;

        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order4.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token4}` } }
        );

        // First verify
        await axios.post(
            `${BASE_URL}/payments/verify`,
            { orderId: order4.id, paymentId: 'pay_test4', signature: 'valid_signature' },
            { headers: { Authorization: `Bearer ${token4}` } }
        );

        // Second verify (should be idempotent)
        log('\n--- REQUEST: Second Verify (Same PaymentId) ---');
        const idempotentResp = await axios.post(
            `${BASE_URL}/payments/verify`,
            { orderId: order4.id, paymentId: 'pay_test4', signature: 'valid_signature' },
            { headers: { Authorization: `Bearer ${token4}` } }
        );
        log('\n--- RESPONSE ---');
        log(JSON.stringify(idempotentResp.data, null, 2));

        const test4Pass =
            idempotentResp.data.success &&
            idempotentResp.data.data.alreadyProcessed === true;

        testResults.push({
            test: 'TEST 4: IDEMPOTENCY',
            status: test4Pass ? 'PASS' : 'FAIL',
            details: { alreadyProcessed: idempotentResp.data.data.alreadyProcessed }
        });

        log(`\n>>> TEST 4: ${test4Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // TEST 5: COD FLOW
        // ========================================
        logSection('TEST 5: COD FLOW');

        const { token: token5 } = await getAuthToken('customer4@gmail.com');

        await axios.delete(`${BASE_URL}/cart/clear`, { headers: { Authorization: `Bearer ${token5}` } });
        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId: products[3].id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token5}` } }
        );
        const addr5 = await axios.get(`${BASE_URL}/addresses`, { headers: { Authorization: `Bearer ${token5}` } });
        const order5Resp = await axios.post(
            `${BASE_URL}/orders`,
            { addressId: addr5.data.data[0].id },
            { headers: { Authorization: `Bearer ${token5}` } }
        );
        const order5 = order5Resp.data.data;

        log('\n--- REQUEST: Initiate COD ---');
        const codResp = await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order5.id, paymentMethod: 'COD' },
            { headers: { Authorization: `Bearer ${token5}` } }
        );
        log('\n--- RESPONSE ---');
        log(JSON.stringify(codResp.data, null, 2));

        const after5 = await prisma.order.findUnique({
            where: { id: order5.id },
            select: { paymentStatus: true, orderStatus: true, paymentMethod: true }
        });
        log('\nDB STATE AFTER:');
        log(JSON.stringify(after5, null, 2));

        const test5Pass =
            after5.orderStatus === 'CONFIRMED' &&
            after5.paymentMethod === 'COD' &&
            after5.paymentStatus === 'PENDING';

        testResults.push({
            test: 'TEST 5: COD FLOW',
            status: test5Pass ? 'PASS' : 'FAIL',
            details: after5
        });

        log(`\n>>> TEST 5: ${test5Pass ? 'PASS' : 'FAIL'} <<<\n`);

        // ========================================
        // FINAL SUMMARY
        // ========================================
        logSection('TEST EXECUTION SUMMARY');

        testResults.forEach(result => {
            log(`${result.status === 'PASS' ? '✓' : '✗'} ${result.test}: ${result.status}`);
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
