/**
 * PHASE 5 - FINANCIAL INTEGRITY VALIDATION SUITE
 * 
 * This is NOT a demo test.
 * This is financial integrity validation.
 * 
 * Tests all 9 required categories with DB state proof.
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:4000/v1';

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(80));
    log(title, colors.cyan + colors.bright);
    console.log('='.repeat(80) + '\n');
}

function logSubSection(title) {
    log(`\n${'─'.repeat(60)}`, colors.yellow);
    log(title, colors.yellow + colors.bright);
    log('─'.repeat(60), colors.yellow);
}

async function getAuthToken(email, password = 'Test@1234') {
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    return {
        token: response.data.data.accessToken,
        userId: response.data.data.user.id,
    };
}

async function createTestOrder(token) {
    // Get active product with stock
    const productsResp = await axios.get(`${BASE_URL}/products?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const products = productsResp.data.data.data || productsResp.data.data;
    const product = products.find(p => p.isActive && p.stock > 10);

    if (!product) {
        throw new Error('No active products with sufficient stock found');
    }

    // Clear cart and add product
    await axios.delete(`${BASE_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
    });

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
        throw new Error('No address found for user');
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
    };
}

async function getDBState(orderId, productId = null) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
    });

    let product = null;
    if (productId) {
        product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, name: true, stock: true },
        });
    }

    const cart = order ? await prisma.cart.findUnique({
        where: { userId: order.userId },
        include: { items: true },
    }) : null;

    return { order, product, cart };
}

function logDBState(state, label = 'DB State') {
    logSubSection(label);
    if (state.order) {
        log(`Order ${state.order.orderNumber}:`, colors.bright);
        log(`  orderStatus: ${state.order.orderStatus}`);
        log(`  paymentStatus: ${state.order.paymentStatus}`);
        log(`  paymentMethod: ${state.order.paymentMethod || 'null'}`);
        log(`  gatewayOrderId: ${state.order.gatewayOrderId || 'null'}`);
        log(`  gatewayPaymentId: ${state.order.gatewayPaymentId || 'null'}`);
    }
    if (state.product) {
        log(`Product ${state.product.name}:`, colors.bright);
        log(`  stock: ${state.product.stock}`);
    }
    if (state.cart) {
        log(`Cart:`, colors.bright);
        log(`  items: ${state.cart.items.length}`);
    }
}

async function runValidation() {
    logSection('PHASE 5 - FINANCIAL INTEGRITY VALIDATION SUITE');

    const results = {
        passed: 0,
        failed: 0,
        tests: [],
    };

    function recordTest(name, passed, evidence = '') {
        results.tests.push({ name, passed, evidence });
        if (passed) {
            results.passed++;
            log(`✅ ${name}`, colors.green);
        } else {
            results.failed++;
            log(`❌ ${name}`, colors.red);
            if (evidence) log(`   ${evidence}`, colors.red);
        }
    }

    try {
        // ========================================
        // TEST 1: HAPPY PATH - RAZORPAY MOCK
        // ========================================
        logSection('TEST 1: HAPPY PATH - RAZORPAY MOCK');

        const { token: token1, userId: userId1 } = await getAuthToken('customer1@gmail.com');
        const { order: order1, product: product1 } = await createTestOrder(token1);

        log(`Created order: ${order1.orderNumber} (ID: ${order1.id})`);
        log(`Product: ${product1.name} (Stock: ${product1.stock})`);

        const initialStock = product1.stock;

        // Step 1: Initiate payment
        logSubSection('Step 1: Initiate Payment (RAZORPAY)');
        const initiateResp = await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order1.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token1}` } }
        );

        log('Request:', colors.cyan);
        log(JSON.stringify({ orderId: order1.id, paymentMethod: 'RAZORPAY' }, null, 2));
        log('\nResponse:', colors.cyan);
        log(JSON.stringify(initiateResp.data, null, 2));

        recordTest(
            'T1.1: Payment initiation returns gateway order ID',
            initiateResp.data.success && initiateResp.data.gatewayOrderId,
            `Expected gatewayOrderId, got: ${initiateResp.data.gatewayOrderId}`
        );

        const gatewayOrderId = initiateResp.data.gatewayOrderId;

        // Step 2: Verify payment
        logSubSection('Step 2: Verify Payment (valid_signature)');
        const verifyResp = await axios.post(
            `${BASE_URL}/payments/verify`,
            {
                orderId: order1.id,
                paymentId: 'pay_test1_valid',
                signature: 'valid_signature',
            },
            { headers: { Authorization: `Bearer ${token1}` } }
        );

        log('Request:', colors.cyan);
        log(JSON.stringify({
            orderId: order1.id,
            paymentId: 'pay_test1_valid',
            signature: 'valid_signature',
        }, null, 2));
        log('\nResponse:', colors.cyan);
        log(JSON.stringify(verifyResp.data, null, 2));

        recordTest(
            'T1.2: Payment verification succeeds',
            verifyResp.data.success === true,
            `Expected success: true, got: ${verifyResp.data.success}`
        );

        // Step 3: Validate DB state
        const state1 = await getDBState(order1.id, product1.id);
        logDBState(state1, 'Final DB State');

        recordTest(
            'T1.3: paymentStatus = PAID',
            state1.order.paymentStatus === 'PAID',
            `Expected PAID, got: ${state1.order.paymentStatus}`
        );

        recordTest(
            'T1.4: orderStatus = CONFIRMED',
            state1.order.orderStatus === 'CONFIRMED',
            `Expected CONFIRMED, got: ${state1.order.orderStatus}`
        );

        recordTest(
            'T1.5: gatewayPaymentId set',
            state1.order.gatewayPaymentId === 'pay_test1_valid',
            `Expected pay_test1_valid, got: ${state1.order.gatewayPaymentId}`
        );

        recordTest(
            'T1.6: Stock deducted correctly',
            state1.product.stock === initialStock - 1,
            `Expected ${initialStock - 1}, got: ${state1.product.stock}`
        );

        recordTest(
            'T1.7: Cart cleared',
            state1.cart.items.length === 0,
            `Expected 0 items, got: ${state1.cart.items.length}`
        );

        recordTest(
            'T1.8: No partial state (all atomic)',
            state1.order.paymentStatus === 'PAID' &&
            state1.order.orderStatus === 'CONFIRMED' &&
            state1.product.stock === initialStock - 1 &&
            state1.cart.items.length === 0,
            'All state changes must be atomic'
        );

        // ========================================
        // TEST 2: INVALID SIGNATURE
        // ========================================
        logSection('TEST 2: INVALID SIGNATURE');

        const { token: token2 } = await getAuthToken('customer2@gmail.com');
        const { order: order2, product: product2 } = await createTestOrder(token2);

        log(`Created order: ${order2.orderNumber} (ID: ${order2.id})`);
        log(`Product: ${product2.name} (Stock: ${product2.stock})`);

        const initialStock2 = product2.stock;

        // Initiate payment
        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order2.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token2}` } }
        );

        // Verify with invalid signature
        logSubSection('Verify with invalid_signature');
        const invalidVerifyResp = await axios.post(
            `${BASE_URL}/payments/verify`,
            {
                orderId: order2.id,
                paymentId: 'pay_test2_invalid',
                signature: 'invalid_signature',
            },
            { headers: { Authorization: `Bearer ${token2}` } }
        );

        log('Request:', colors.cyan);
        log(JSON.stringify({
            orderId: order2.id,
            paymentId: 'pay_test2_invalid',
            signature: 'invalid_signature',
        }, null, 2));
        log('\nResponse:', colors.cyan);
        log(JSON.stringify(invalidVerifyResp.data, null, 2));

        recordTest(
            'T2.1: Invalid signature rejected',
            invalidVerifyResp.data.success === false && invalidVerifyResp.data.canRetry === true,
            `Expected success: false, canRetry: true`
        );

        const state2 = await getDBState(order2.id, product2.id);
        logDBState(state2, 'DB State After Invalid Signature');

        recordTest(
            'T2.2: paymentStatus = FAILED',
            state2.order.paymentStatus === 'FAILED',
            `Expected FAILED, got: ${state2.order.paymentStatus}`
        );

        recordTest(
            'T2.3: orderStatus remains PENDING',
            state2.order.orderStatus === 'PENDING',
            `Expected PENDING, got: ${state2.order.orderStatus}`
        );

        recordTest(
            'T2.4: Stock NOT deducted',
            state2.product.stock === initialStock2,
            `Expected ${initialStock2}, got: ${state2.product.stock}`
        );

        recordTest(
            'T2.5: Cart NOT cleared',
            state2.cart.items.length > 0,
            `Expected items > 0, got: ${state2.cart.items.length}`
        );

        recordTest(
            'T2.6: Retry possible (orderStatus = PENDING)',
            state2.order.orderStatus === 'PENDING',
            'Order must remain in PENDING state to allow retry'
        );

        // ========================================
        // TEST 3: RETRY AFTER FAILED
        // ========================================
        logSection('TEST 3: RETRY AFTER FAILED');

        log(`Retrying order: ${order2.orderNumber} (currently FAILED)`);

        logSubSection('Retry with valid_signature');
        const retryResp = await axios.post(
            `${BASE_URL}/payments/verify`,
            {
                orderId: order2.id,
                paymentId: 'pay_test2_retry_valid',
                signature: 'valid_signature',
            },
            { headers: { Authorization: `Bearer ${token2}` } }
        );

        log('Request:', colors.cyan);
        log(JSON.stringify({
            orderId: order2.id,
            paymentId: 'pay_test2_retry_valid',
            signature: 'valid_signature',
        }, null, 2));
        log('\nResponse:', colors.cyan);
        log(JSON.stringify(retryResp.data, null, 2));

        recordTest(
            'T3.1: Retry succeeds after FAILED',
            retryResp.data.success === true,
            `Expected success: true, got: ${retryResp.data.success}`
        );

        const state3 = await getDBState(order2.id, product2.id);
        logDBState(state3, 'DB State After Retry');

        recordTest(
            'T3.2: paymentStatus transitions FAILED → PAID',
            state3.order.paymentStatus === 'PAID',
            `Expected PAID, got: ${state3.order.paymentStatus}`
        );

        recordTest(
            'T3.3: orderStatus transitions PENDING → CONFIRMED',
            state3.order.orderStatus === 'CONFIRMED',
            `Expected CONFIRMED, got: ${state3.order.orderStatus}`
        );

        recordTest(
            'T3.4: Stock deducted exactly once',
            state3.product.stock === initialStock2 - 1,
            `Expected ${initialStock2 - 1}, got: ${state3.product.stock}`
        );

        recordTest(
            'T3.5: Cart cleared exactly once',
            state3.cart.items.length === 0,
            `Expected 0 items, got: ${state3.cart.items.length}`
        );

        // ========================================
        // TEST 4: CONCURRENCY - DOUBLE VERIFY
        // ========================================
        logSection('TEST 4: CONCURRENCY TEST - DOUBLE VERIFY');

        const { token: token4 } = await getAuthToken('customer3@gmail.com');
        const { order: order4, product: product4 } = await createTestOrder(token4);

        log(`Created order: ${order4.orderNumber} (ID: ${order4.id})`);
        log(`Product: ${product4.name} (Stock: ${product4.stock})`);

        const initialStock4 = product4.stock;

        // Initiate payment
        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order4.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token4}` } }
        );

        logSubSection('Simulating Two Concurrent Verify Requests');

        // Send two concurrent verify requests
        const verifyPromise1 = axios.post(
            `${BASE_URL}/payments/verify`,
            {
                orderId: order4.id,
                paymentId: 'pay_test4_concurrent',
                signature: 'valid_signature',
            },
            { headers: { Authorization: `Bearer ${token4}` } }
        );

        const verifyPromise2 = axios.post(
            `${BASE_URL}/payments/verify`,
            {
                orderId: order4.id,
                paymentId: 'pay_test4_concurrent',
                signature: 'valid_signature',
            },
            { headers: { Authorization: `Bearer ${token4}` } }
        );

        const [result1, result2] = await Promise.allSettled([verifyPromise1, verifyPromise2]);

        log('Request 1 Result:', colors.cyan);
        if (result1.status === 'fulfilled') {
            log(JSON.stringify(result1.value.data, null, 2));
        } else {
            log(`Error: ${result1.reason.response?.data?.message || result1.reason.message}`, colors.red);
        }

        log('\nRequest 2 Result:', colors.cyan);
        if (result2.status === 'fulfilled') {
            log(JSON.stringify(result2.value.data, null, 2));
        } else {
            log(`Error: ${result2.reason.response?.data?.message || result2.reason.message}`, colors.red);
        }

        const state4 = await getDBState(order4.id, product4.id);
        logDBState(state4, 'Final DB State After Concurrent Requests');

        const successCount = [result1, result2].filter(r =>
            r.status === 'fulfilled' && r.value.data.success
        ).length;

        const alreadyProcessedCount = [result1, result2].filter(r =>
            r.status === 'fulfilled' && r.value.data.alreadyProcessed
        ).length;

        const conflictCount = [result1, result2].filter(r =>
            r.status === 'rejected' && r.reason.response?.status === 409
        ).length;

        recordTest(
            'T4.1: Only one request processes payment',
            successCount === 1 || (successCount === 2 && alreadyProcessedCount === 1),
            `Success: ${successCount}, AlreadyProcessed: ${alreadyProcessedCount}, Conflict: ${conflictCount}`
        );

        recordTest(
            'T4.2: Second request returns alreadyProcessed OR Conflict',
            alreadyProcessedCount === 1 || conflictCount === 1,
            `AlreadyProcessed: ${alreadyProcessedCount}, Conflict: ${conflictCount}`
        );

        recordTest(
            'T4.3: Stock deducted exactly once',
            state4.product.stock === initialStock4 - 1,
            `Expected ${initialStock4 - 1}, got: ${state4.product.stock}`
        );

        recordTest(
            'T4.4: Cart cleared exactly once',
            state4.cart.items.length === 0,
            `Expected 0 items, got: ${state4.cart.items.length}`
        );

        recordTest(
            'T4.5: Payment status updated exactly once',
            state4.order.paymentStatus === 'PAID',
            `Expected PAID, got: ${state4.order.paymentStatus}`
        );

        // ========================================
        // TEST 5: STOCK EXHAUSTION
        // ========================================
        logSection('TEST 5: STOCK EXHAUSTION TEST');

        log('Setting up product with stock = 1...');

        // Find a product and set stock to 1
        const testProduct = await prisma.product.findFirst({
            where: { isActive: true },
        });

        await prisma.product.update({
            where: { id: testProduct.id },
            data: { stock: 1 },
        });

        log(`Product: ${testProduct.name} (Stock set to 1)`);

        // Create two orders for the same product
        const { token: token5a } = await getAuthToken('customer4@gmail.com');
        const { token: token5b } = await getAuthToken('customer5@gmail.com');

        // Order 1
        await axios.delete(`${BASE_URL}/cart/clear`, {
            headers: { Authorization: `Bearer ${token5a}` },
        });
        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId: testProduct.id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token5a}` } }
        );
        const addressResp5a = await axios.get(`${BASE_URL}/addresses`, {
            headers: { Authorization: `Bearer ${token5a}` },
        });
        const order5a = await axios.post(
            `${BASE_URL}/orders`,
            { addressId: addressResp5a.data.data[0].id },
            { headers: { Authorization: `Bearer ${token5a}` } }
        );

        // Order 2
        await axios.delete(`${BASE_URL}/cart/clear`, {
            headers: { Authorization: `Bearer ${token5b}` },
        });
        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId: testProduct.id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token5b}` } }
        );
        const addressResp5b = await axios.get(`${BASE_URL}/addresses`, {
            headers: { Authorization: `Bearer ${token5b}` },
        });
        const order5b = await axios.post(
            `${BASE_URL}/orders`,
            { addressId: addressResp5b.data.data[0].id },
            { headers: { Authorization: `Bearer ${token5b}` } }
        );

        log(`Order A: ${order5a.data.data.orderNumber}`);
        log(`Order B: ${order5b.data.data.orderNumber}`);

        // Initiate both payments
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

        logSubSection('Two Concurrent Verify Attempts (Stock = 1)');

        // Concurrent verify
        const verify5aPromise = axios.post(
            `${BASE_URL}/payments/verify`,
            {
                orderId: order5a.data.data.id,
                paymentId: 'pay_test5a',
                signature: 'valid_signature',
            },
            { headers: { Authorization: `Bearer ${token5a}` } }
        );

        const verify5bPromise = axios.post(
            `${BASE_URL}/payments/verify`,
            {
                orderId: order5b.data.data.id,
                paymentId: 'pay_test5b',
                signature: 'valid_signature',
            },
            { headers: { Authorization: `Bearer ${token5b}` } }
        );

        const [result5a, result5b] = await Promise.allSettled([verify5aPromise, verify5bPromise]);

        log('Order A Result:', colors.cyan);
        if (result5a.status === 'fulfilled') {
            log(JSON.stringify(result5a.value.data, null, 2));
        } else {
            log(`Error: ${result5a.reason.response?.data?.message || result5a.reason.message}`, colors.red);
        }

        log('\nOrder B Result:', colors.cyan);
        if (result5b.status === 'fulfilled') {
            log(JSON.stringify(result5b.value.data, null, 2));
        } else {
            log(`Error: ${result5b.reason.response?.data?.message || result5b.reason.message}`, colors.red);
        }

        const finalProduct = await prisma.product.findUnique({
            where: { id: testProduct.id },
        });

        log(`\nFinal Product Stock: ${finalProduct.stock}`, colors.bright);

        const successCount5 = [result5a, result5b].filter(r =>
            r.status === 'fulfilled' && r.value.data.success
        ).length;

        const failureCount5 = [result5a, result5b].filter(r =>
            r.status === 'rejected' && r.reason.response?.status === 400
        ).length;

        recordTest(
            'T5.1: Only one order succeeds',
            successCount5 === 1,
            `Success: ${successCount5}, Failed: ${failureCount5}`
        );

        recordTest(
            'T5.2: Second order fails due to insufficient stock',
            failureCount5 === 1,
            `Expected 1 failure, got: ${failureCount5}`
        );

        recordTest(
            'T5.3: No overselling',
            finalProduct.stock === 0,
            `Expected stock = 0, got: ${finalProduct.stock}`
        );

        recordTest(
            'T5.4: Stock never negative',
            finalProduct.stock >= 0,
            `Stock must never be negative, got: ${finalProduct.stock}`
        );

        // ========================================
        // TEST 6: COD FLOW
        // ========================================
        logSection('TEST 6: COD FLOW TEST');

        const { token: token6 } = await getAuthToken('customer6@gmail.com');
        const { order: order6, product: product6 } = await createTestOrder(token6);

        log(`Created order: ${order6.orderNumber} (ID: ${order6.id})`);
        log(`Product: ${product6.name} (Stock: ${product6.stock})`);

        const initialStock6 = product6.stock;

        logSubSection('Initiate COD Payment');
        const codResp = await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order6.id, paymentMethod: 'COD' },
            { headers: { Authorization: `Bearer ${token6}` } }
        );

        log('Request:', colors.cyan);
        log(JSON.stringify({ orderId: order6.id, paymentMethod: 'COD' }, null, 2));
        log('\nResponse:', colors.cyan);
        log(JSON.stringify(codResp.data, null, 2));

        const state6 = await getDBState(order6.id, product6.id);
        logDBState(state6, 'DB State After COD Initiation');

        recordTest(
            'T6.1: orderStatus = CONFIRMED',
            state6.order.orderStatus === 'CONFIRMED',
            `Expected CONFIRMED, got: ${state6.order.orderStatus}`
        );

        recordTest(
            'T6.2: paymentMethod = COD',
            state6.order.paymentMethod === 'COD',
            `Expected COD, got: ${state6.order.paymentMethod}`
        );

        recordTest(
            'T6.3: paymentStatus = PENDING',
            state6.order.paymentStatus === 'PENDING',
            `Expected PENDING (paid on delivery), got: ${state6.order.paymentStatus}`
        );

        recordTest(
            'T6.4: Stock deducted',
            state6.product.stock === initialStock6 - 1,
            `Expected ${initialStock6 - 1}, got: ${state6.product.stock}`
        );

        recordTest(
            'T6.5: Cart cleared',
            state6.cart.items.length === 0,
            `Expected 0 items, got: ${state6.cart.items.length}`
        );

        // Try second initiation
        logSubSection('Attempt Second COD Initiation');
        try {
            const codResp2 = await axios.post(
                `${BASE_URL}/payments/initiate`,
                { orderId: order6.id, paymentMethod: 'COD' },
                { headers: { Authorization: `Bearer ${token6}` } }
            );

            recordTest(
                'T6.6: Second initiation prevented',
                false,
                'Should throw ConflictException'
            );
        } catch (error) {
            recordTest(
                'T6.6: Second initiation prevented',
                error.response?.status === 409 || error.response?.data?.message?.includes('already'),
                `Error: ${error.response?.data?.message || error.message}`
            );
        }

        // ========================================
        // TEST 7: PAYMENT METHOD IMMUTABILITY
        // ========================================
        logSection('TEST 7: PAYMENT METHOD IMMUTABILITY');

        const { token: token7 } = await getAuthToken('customer7@gmail.com');
        const { order: order7 } = await createTestOrder(token7);

        log(`Created order: ${order7.orderNumber} (ID: ${order7.id})`);

        logSubSection('Step 1: Initiate with RAZORPAY');
        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order7.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token7}` } }
        );

        log('✓ Payment method set to RAZORPAY');

        logSubSection('Step 2: Attempt to Switch to COD');
        try {
            await axios.post(
                `${BASE_URL}/payments/initiate`,
                { orderId: order7.id, paymentMethod: 'COD' },
                { headers: { Authorization: `Bearer ${token7}` } }
            );

            recordTest(
                'T7.1: Payment method switching prevented',
                false,
                'Should throw BadRequestException'
            );
        } catch (error) {
            log(`Error: ${error.response?.data?.message}`, colors.red);

            recordTest(
                'T7.1: Payment method switching prevented',
                error.response?.status === 400 &&
                error.response?.data?.message?.includes('locked'),
                `Expected 400 with "locked" message, got: ${error.response?.status} - ${error.response?.data?.message}`
            );
        }

        // ========================================
        // TEST 8: WEBHOOK TEST
        // ========================================
        logSection('TEST 8: WEBHOOK TEST');

        const { token: token8 } = await getAuthToken('customer8@gmail.com');
        const { order: order8, product: product8 } = await createTestOrder(token8);

        log(`Created order: ${order8.orderNumber} (ID: ${order8.id})`);

        const initialStock8 = product8.stock;

        // Initiate payment
        const initiateResp8 = await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order8.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token8}` } }
        );

        const gatewayOrderId8 = initiateResp8.data.gatewayOrderId;

        logSubSection('Trigger Webhook (First Time)');
        const webhookPayload = {
            orderId: gatewayOrderId8,
            paymentId: 'pay_webhook_test',
            status: 'paid',
        };

        log('Webhook Payload:', colors.cyan);
        log(JSON.stringify(webhookPayload, null, 2));

        const webhook1 = await axios.post(`${BASE_URL}/payments/webhook`, webhookPayload);

        log('\nWebhook Response 1:', colors.cyan);
        log(JSON.stringify(webhook1.data, null, 2));

        recordTest(
            'T8.1: First webhook processes payment',
            webhook1.data.success === true && !webhook1.data.alreadyProcessed,
            `Expected success without alreadyProcessed flag`
        );

        logSubSection('Trigger Same Webhook Again');
        const webhook2 = await axios.post(`${BASE_URL}/payments/webhook`, webhookPayload);

        log('Webhook Response 2:', colors.cyan);
        log(JSON.stringify(webhook2.data, null, 2));

        recordTest(
            'T8.2: Second webhook returns alreadyProcessed',
            webhook2.data.success === true && webhook2.data.alreadyProcessed === true,
            `Expected alreadyProcessed: true`
        );

        const state8 = await getDBState(order8.id, product8.id);
        logDBState(state8, 'DB State After Webhooks');

        recordTest(
            'T8.3: No double stock deduction',
            state8.product.stock === initialStock8 - 1,
            `Expected ${initialStock8 - 1}, got: ${state8.product.stock}`
        );

        // ========================================
        // TEST 9: REPLAY ATTACK TEST
        // ========================================
        logSection('TEST 9: REPLAY ATTACK TEST');

        const { token: token9 } = await getAuthToken('customer9@gmail.com');
        const { order: order9 } = await createTestOrder(token9);

        log(`Created order: ${order9.orderNumber} (ID: ${order9.id})`);

        // Initiate payment
        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order9.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token9}` } }
        );

        logSubSection('Step 1: Verify with paymentId A');
        const verify9a = await axios.post(
            `${BASE_URL}/payments/verify`,
            {
                orderId: order9.id,
                paymentId: 'pay_test9_A',
                signature: 'valid_signature',
            },
            { headers: { Authorization: `Bearer ${token9}` } }
        );

        log('Response:', colors.cyan);
        log(JSON.stringify(verify9a.data, null, 2));

        recordTest(
            'T9.1: First verification succeeds',
            verify9a.data.success === true,
            `Expected success: true`
        );

        logSubSection('Step 2: Verify with Different paymentId B');
        try {
            await axios.post(
                `${BASE_URL}/payments/verify`,
                {
                    orderId: order9.id,
                    paymentId: 'pay_test9_B',
                    signature: 'valid_signature',
                },
                { headers: { Authorization: `Bearer ${token9}` } }
            );

            recordTest(
                'T9.2: Replay attack prevented',
                false,
                'Should throw BadRequestException'
            );
        } catch (error) {
            log(`Error: ${error.response?.data?.message}`, colors.red);

            recordTest(
                'T9.2: Replay attack prevented',
                error.response?.status === 400 &&
                error.response?.data?.message?.includes('mismatch'),
                `Expected 400 with "mismatch" message`
            );
        }

        const state9 = await getDBState(order9.id);

        recordTest(
            'T9.3: No state mutation on replay attempt',
            state9.order.gatewayPaymentId === 'pay_test9_A' &&
            state9.order.paymentStatus === 'PAID',
            'State must remain unchanged'
        );

        // ========================================
        // INTEGRITY CHECKLIST
        // ========================================
        logSection('INTEGRITY CHECKLIST');

        const allOrders = await prisma.order.findMany({
            where: {
                id: {
                    in: [
                        order1.id, order2.id, order4.id,
                        order5a.data.data.id, order5b.data.data.id,
                        order6.id, order7.id, order8.id, order9.id,
                    ],
                },
            },
        });

        const allProducts = await prisma.product.findMany({
            where: {
                id: {
                    in: [product1.id, product2.id, product4.id, testProduct.id, product6.id, product8.id],
                },
            },
        });

        // Check 1: No CONFIRMED with paymentStatus != PAID (except COD)
        const invalidConfirmed = allOrders.filter(o =>
            o.orderStatus === 'CONFIRMED' &&
            o.paymentStatus !== 'PAID' &&
            o.paymentMethod !== 'COD'
        );

        recordTest(
            'IC.1: No CONFIRMED order with paymentStatus != PAID (except COD)',
            invalidConfirmed.length === 0,
            `Found ${invalidConfirmed.length} invalid orders`
        );

        // Check 2: No PAID without gatewayPaymentId
        const paidWithoutGatewayId = allOrders.filter(o =>
            o.paymentStatus === 'PAID' && !o.gatewayPaymentId
        );

        recordTest(
            'IC.2: No PAID order without gatewayPaymentId',
            paidWithoutGatewayId.length === 0,
            `Found ${paidWithoutGatewayId.length} invalid orders`
        );

        // Check 3: No negative stock
        const negativeStock = allProducts.filter(p => p.stock < 0);

        recordTest(
            'IC.3: No negative stock',
            negativeStock.length === 0,
            `Found ${negativeStock.length} products with negative stock`
        );

        // Check 4: All gatewayOrderIds unique
        const gatewayOrderIds = allOrders
            .map(o => o.gatewayOrderId)
            .filter(id => id !== null);
        const uniqueGatewayOrderIds = new Set(gatewayOrderIds);

        recordTest(
            'IC.4: No duplicate gatewayOrderId',
            gatewayOrderIds.length === uniqueGatewayOrderIds.size,
            `Total: ${gatewayOrderIds.length}, Unique: ${uniqueGatewayOrderIds.size}`
        );

        // Check 5: All gatewayPaymentIds unique
        const gatewayPaymentIds = allOrders
            .map(o => o.gatewayPaymentId)
            .filter(id => id !== null);
        const uniqueGatewayPaymentIds = new Set(gatewayPaymentIds);

        recordTest(
            'IC.5: No duplicate gatewayPaymentId',
            gatewayPaymentIds.length === uniqueGatewayPaymentIds.size,
            `Total: ${gatewayPaymentIds.length}, Unique: ${uniqueGatewayPaymentIds.size}`
        );

        // ========================================
        // FINAL SUMMARY
        // ========================================
        logSection('VALIDATION SUMMARY');

        log(`Total Tests: ${results.tests.length}`, colors.bright);
        log(`Passed: ${results.passed}`, colors.green);
        log(`Failed: ${results.failed}`, colors.red);

        if (results.failed > 0) {
            log('\n❌ FAILED TESTS:', colors.red + colors.bright);
            results.tests
                .filter(t => !t.passed)
                .forEach(t => {
                    log(`  - ${t.name}`, colors.red);
                    if (t.evidence) log(`    ${t.evidence}`, colors.yellow);
                });
        }

        const allPassed = results.failed === 0;
        if (allPassed) {
            log('\n🎉 ALL TESTS PASSED - FINANCIAL INTEGRITY VALIDATED', colors.green + colors.bright);
        } else {
            log('\n❌ VALIDATION FAILED - FIX ISSUES BEFORE PROCEEDING', colors.red + colors.bright);
        }

        log(`\nValidation completed: ${new Date().toLocaleString()}`, colors.reset);

        return allPassed;

    } catch (error) {
        log(`\n❌ Validation suite failed: ${error.message}`, colors.red);
        console.error(error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

// Run validation
runValidation()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
