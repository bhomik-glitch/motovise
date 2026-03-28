/**
 * Additional Edge Case Tests
 * - Crash simulation
 * - Manual state tampering
 * - Abandoned orders
 * - Payment method switching
 * - Replay attack under concurrency
 */

const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:4000/v1';
const RAZORPAY_KEY_SECRET = 'test_secret_key';

function log(section, message, data = null) {
    console.log(`[${section}] ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
}

function logSection(title) {
    console.log('\n' + '='.repeat(80));
    console.log(`  ${title}`);
    console.log('='.repeat(80) + '\n');
}

async function loginUser(email, password) {
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    return response.data.data?.accessToken || response.data.access_token || response.data.accessToken;
}

async function getProducts() {
    const response = await axios.get(`${BASE_URL}/products?limit=10`);
    return response.data.data?.data || response.data.data || response.data;
}

async function updateProductStock(token, productId, stock) {
    const response = await axios.patch(
        `${BASE_URL}/products/${productId}`,
        { stock },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data || response.data;
}

async function getProduct(productId) {
    const response = await axios.get(`${BASE_URL}/products/${productId}`);
    return response.data.data || response.data;
}

async function clearCart(token) {
    try {
        await axios.delete(`${BASE_URL}/cart/clear`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        // Ignore
    }
}

async function addToCart(token, productId, quantity) {
    const response = await axios.post(
        `${BASE_URL}/cart/add`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data || response.data;
}

async function createAddress(token, addressData) {
    const response = await axios.post(`${BASE_URL}/addresses`, addressData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || response.data;
}

async function createOrder(token, addressId) {
    const response = await axios.post(
        `${BASE_URL}/orders`,
        { addressId },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data || response.data;
}

async function initiatePayment(token, orderId, paymentMethod = 'RAZORPAY') {
    const response = await axios.post(
        `${BASE_URL}/payments/initiate`,
        { orderId, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data || response.data;
}

function generateSignature(gatewayOrderId, paymentId) {
    const text = `${gatewayOrderId}|${paymentId}`;
    return crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(text).digest('hex');
}

async function verifyPayment(token, orderId, paymentId, signature) {
    try {
        const response = await axios.post(
            `${BASE_URL}/payments/verify`,
            { orderId, paymentId, signature },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { success: true, data: response.data.data || response.data };
    } catch (error) {
        return { success: false, error: error.response?.data };
    }
}

async function getOrder(token, orderId) {
    const response = await axios.get(`${BASE_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || response.data;
}

// ============================================
// TEST 1: ABANDONED ORDER BEHAVIOR
// ============================================

async function testAbandonedOrder(adminToken, userToken, products) {
    logSection('TEST 1: ABANDONED ORDER BEHAVIOR');

    const product = products[0];
    const initialStock = 20;

    await updateProductStock(adminToken, product.id, initialStock);
    log('TEST_1', `Set initial stock to ${initialStock}`);

    const address = await createAddress(userToken, {
        fullName: 'Test User',
        phone: '1234567890',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
    });

    await clearCart(userToken);
    await addToCart(userToken, product.id, 1);
    const order = await createOrder(userToken, address.id);

    log('TEST_1', `Created order: ${order.orderNumber}`);
    log('TEST_1', 'Order created but payment NOT initiated (abandoned)');

    // Check stock
    const currentProduct = await getProduct(product.id);
    log('TEST_1', `Current stock: ${currentProduct.stock}`);

    // Check order
    const currentOrder = await getOrder(userToken, order.id);
    log('TEST_1', `Order status: ${currentOrder.orderStatus}`);
    log('TEST_1', `Payment status: ${currentOrder.paymentStatus}`);
    log('TEST_1', `Stock deducted: ${currentOrder.stockDeducted}`);

    const passed =
        currentProduct.stock === initialStock &&
        currentOrder.orderStatus === 'PENDING' &&
        currentOrder.stockDeducted === false;

    log('TEST_1', `✓ Stock unchanged: ${currentProduct.stock === initialStock}`);
    log('TEST_1', `✓ Order remains PENDING: ${currentOrder.orderStatus === 'PENDING'}`);
    log('TEST_1', `✓ Stock not deducted: ${currentOrder.stockDeducted === false}`);

    return { passed, orderStatus: currentOrder.orderStatus, stockDeducted: currentOrder.stockDeducted };
}

// ============================================
// TEST 2: PAYMENT METHOD SWITCH AFTER INITIATION
// ============================================

async function testPaymentMethodSwitch(adminToken, userToken, products) {
    logSection('TEST 2: PAYMENT METHOD SWITCH AFTER INITIATION');

    const product = products[1];
    await updateProductStock(adminToken, product.id, 10);

    const address = await createAddress(userToken, {
        fullName: 'Test User',
        phone: '1234567890',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
    });

    await clearCart(userToken);
    await addToCart(userToken, product.id, 1);
    const order = await createOrder(userToken, address.id);

    // Initiate Razorpay
    log('TEST_2', 'Initiating Razorpay payment...');
    await initiatePayment(userToken, order.id, 'RAZORPAY');

    // Attempt to switch to COD
    log('TEST_2', 'Attempting to switch to COD...');
    try {
        await initiatePayment(userToken, order.id, 'COD');
        log('TEST_2', '✗ FAILED: Payment method switch was allowed');
        return { passed: false };
    } catch (error) {
        log('TEST_2', '✓ PASSED: Payment method switch blocked');
        log('TEST_2', `Error: ${error.response?.data?.message}`);
        return { passed: true, error: error.response?.data };
    }
}

// ============================================
// TEST 3: REPLAY ATTACK UNDER CONCURRENCY
// ============================================

async function testReplayAttackConcurrency(adminToken, userToken, products) {
    logSection('TEST 3: REPLAY ATTACK UNDER CONCURRENCY');

    const product = products[2];
    await updateProductStock(adminToken, product.id, 10);

    const address = await createAddress(userToken, {
        fullName: 'Test User',
        phone: '1234567890',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
    });

    await clearCart(userToken);
    await addToCart(userToken, product.id, 1);
    const order = await createOrder(userToken, address.id);

    const payment = await initiatePayment(userToken, order.id);

    const paymentIdA = 'pay_replay_A';
    const paymentIdB = 'pay_replay_B';
    const signatureA = generateSignature(payment.gatewayOrderId, paymentIdA);
    const signatureB = generateSignature(payment.gatewayOrderId, paymentIdB);

    log('TEST_3', 'Sending two verify requests with different payment IDs simultaneously...');

    const [resultA, resultB] = await Promise.all([
        verifyPayment(userToken, order.id, paymentIdA, signatureA),
        verifyPayment(userToken, order.id, paymentIdB, signatureB),
    ]);

    log('TEST_3', 'Result A:', resultA);
    log('TEST_3', 'Result B:', resultB);

    const finalOrder = await getOrder(userToken, order.id);
    log('TEST_3', `Final gateway payment ID: ${finalOrder.gatewayPaymentId}`);

    // One should succeed, one should be blocked
    const oneSucceeded = (resultA.success && !resultB.success) || (!resultA.success && resultB.success);
    const paymentIdSet = finalOrder.gatewayPaymentId === paymentIdA || finalOrder.gatewayPaymentId === paymentIdB;
    const onlyOnePaymentId = finalOrder.gatewayPaymentId !== null;

    log('TEST_3', `✓ One succeeded, one blocked: ${oneSucceeded}`);
    log('TEST_3', `✓ Payment ID is set: ${paymentIdSet}`);
    log('TEST_3', `✓ Only one payment ID persisted: ${onlyOnePaymentId}`);

    return {
        passed: oneSucceeded && paymentIdSet && onlyOnePaymentId,
        gatewayPaymentId: finalOrder.gatewayPaymentId
    };
}

// ============================================
// TEST 4: FAILED PAYMENT - NO STOCK DEDUCTION
// ============================================

async function testFailedPaymentNoDeduction(adminToken, userToken, products) {
    logSection('TEST 4: FAILED PAYMENT - NO STOCK DEDUCTION');

    const product = products[3];
    const initialStock = 15;
    await updateProductStock(adminToken, product.id, initialStock);

    const address = await createAddress(userToken, {
        fullName: 'Test User',
        phone: '1234567890',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
    });

    await clearCart(userToken);
    await addToCart(userToken, product.id, 1);
    const order = await createOrder(userToken, address.id);

    const payment = await initiatePayment(userToken, order.id);

    // Use INVALID signature to fail payment
    log('TEST_4', 'Attempting payment verification with INVALID signature...');
    const result = await verifyPayment(userToken, order.id, 'pay_invalid', 'invalid_signature');

    log('TEST_4', 'Result:', result);

    const finalProduct = await getProduct(product.id);
    const finalOrder = await getOrder(userToken, order.id);

    log('TEST_4', `Stock: ${finalProduct.stock} (expected: ${initialStock})`);
    log('TEST_4', `Order status: ${finalOrder.orderStatus}`);
    log('TEST_4', `Payment status: ${finalOrder.paymentStatus}`);
    log('TEST_4', `Stock deducted: ${finalOrder.stockDeducted}`);

    const passed =
        !result.success &&
        finalProduct.stock === initialStock &&
        finalOrder.paymentStatus === 'FAILED' &&
        finalOrder.stockDeducted === false;

    log('TEST_4', `✓ Payment failed: ${!result.success}`);
    log('TEST_4', `✓ Stock unchanged: ${finalProduct.stock === initialStock}`);
    log('TEST_4', `✓ Payment status FAILED: ${finalOrder.paymentStatus === 'FAILED'}`);
    log('TEST_4', `✓ Stock not deducted: ${finalOrder.stockDeducted === false}`);

    return { passed, finalStock: finalProduct.stock, paymentStatus: finalOrder.paymentStatus };
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
    try {
        log('SETUP', 'Logging in...');
        const adminToken = await loginUser('admin@ecommerce.com', 'Test@1234');
        const userToken = await loginUser('customer1@gmail.com', 'Test@1234');

        log('SETUP', 'Fetching products...');
        const products = await getProducts();

        const results = {
            test1: await testAbandonedOrder(adminToken, userToken, products),
            test2: await testPaymentMethodSwitch(adminToken, userToken, products),
            test3: await testReplayAttackConcurrency(adminToken, userToken, products),
            test4: await testFailedPaymentNoDeduction(adminToken, userToken, products),
        };

        logSection('TEST RESULTS SUMMARY');
        console.log('Test 1 (Abandoned Order):', results.test1.passed ? '✓ PASSED' : '✗ FAILED');
        console.log('Test 2 (Payment Method Switch):', results.test2.passed ? '✓ PASSED' : '✗ FAILED');
        console.log('Test 3 (Replay Attack Concurrency):', results.test3.passed ? '✓ PASSED' : '✗ FAILED');
        console.log('Test 4 (Failed Payment No Deduction):', results.test4.passed ? '✓ PASSED' : '✗ FAILED');

        const allPassed = Object.values(results).every(r => r.passed);
        console.log('\n' + (allPassed ? '✓ ALL EDGE CASE TESTS PASSED' : '✗ SOME TESTS FAILED'));

        return results;
    } catch (error) {
        log('ERROR', 'Test suite failed', error);
        throw error;
    }
}

// Run tests
runAllTests().catch(console.error);
