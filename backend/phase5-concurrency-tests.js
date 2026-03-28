/**
 * Phase 5 Concurrency Test Suite
 * Tests atomic lock-based stock deduction
 * 
 * REQUIREMENTS:
 * - Execution logs for all tests
 * - Database snapshots before/after
 * - Timing data for parallel execution
 * - SQL validation queries
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration
const BASE_URL = 'http://localhost:4000/v1';
const RAZORPAY_KEY_SECRET = 'test_secret_key'; // From .env

const config = {
    admin: {
        email: 'admin@ecommerce.com',
        password: 'Test@1234',
    },
    users: [
        { email: 'customer1@gmail.com', password: 'Test@1234' },
        { email: 'customer2@gmail.com', password: 'Test@1234' },
    ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    console.log(`  ${title}`);
    console.log('='.repeat(60) + '\n');
}

async function loginUser(email, password) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
        return response.data.data?.accessToken || response.data.access_token || response.data.accessToken;
    } catch (error) {
        log('ERROR', `Login failed for ${email}`, error.response?.data);
        throw error;
    }
}

async function getProducts(limit = 50) {
    try {
        const response = await axios.get(`${BASE_URL}/products?limit=${limit}`);
        return response.data.data?.data || response.data.data || response.data;
    } catch (error) {
        log('ERROR', 'Get products failed', error.response?.data);
        throw error;
    }
}

async function getProduct(productId) {
    try {
        const response = await axios.get(`${BASE_URL}/products/${productId}`);
        return response.data.data || response.data;
    } catch (error) {
        log('ERROR', 'Get product failed', error.response?.data);
        throw error;
    }
}

async function updateProductStock(token, productId, stock) {
    try {
        const response = await axios.patch(
            `${BASE_URL}/products/${productId}`,
            { stock },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data.data || response.data;
    } catch (error) {
        log('ERROR', 'Update product stock failed', error.response?.data);
        throw error;
    }
}

async function clearCart(token) {
    try {
        await axios.delete(`${BASE_URL}/cart/clear`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        // Ignore if cart is already empty
    }
}

async function addToCart(token, productId, quantity) {
    try {
        const response = await axios.post(
            `${BASE_URL}/cart/add`,
            { productId, quantity },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data.data || response.data;
    } catch (error) {
        log('ERROR', 'Add to cart failed', error.response?.data);
        throw error;
    }
}

async function createAddress(token, addressData) {
    try {
        const response = await axios.post(`${BASE_URL}/addresses`, addressData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data || response.data;
    } catch (error) {
        log('ERROR', 'Create address failed', error.response?.data);
        throw error;
    }
}

async function createOrder(token, addressId, notes = '') {
    try {
        const response = await axios.post(
            `${BASE_URL}/orders`,
            { addressId, notes },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data.data || response.data;
    } catch (error) {
        log('ERROR', 'Create order failed', error.response?.data);
        throw error;
    }
}

async function initiatePayment(token, orderId, paymentMethod = 'RAZORPAY') {
    try {
        const response = await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId, paymentMethod },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data.data || response.data;
    } catch (error) {
        log('ERROR', 'Initiate payment failed', error.response?.data);
        throw error;
    }
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
        return response.data.data || response.data;
    } catch (error) {
        log('ERROR', 'Verify payment failed', error.response?.data);
        return { success: false, error: error.response?.data };
    }
}

async function getOrder(token, orderId) {
    try {
        const response = await axios.get(`${BASE_URL}/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data || response.data;
    } catch (error) {
        log('ERROR', 'Get order failed', error.response?.data);
        throw error;
    }
}

// ============================================
// TEST SETUP
// ============================================

async function setupTest() {
    logSection('TEST SETUP');

    // Login as admin
    log('SETUP', 'Logging in as admin...');
    const adminToken = await loginUser(config.admin.email, config.admin.password);

    // Login users
    log('SETUP', 'Logging in test users...');
    const user1Token = await loginUser(config.users[0].email, config.users[0].password);
    const user2Token = await loginUser(config.users[1].email, config.users[1].password);

    // Get existing products
    log('SETUP', 'Fetching existing products...');
    const products = await getProducts(50);
    log('SETUP', `Found ${products.length} products`);

    // Clear carts
    log('SETUP', 'Clearing user carts...');
    await clearCart(user1Token);
    await clearCart(user2Token);

    return { adminToken, user1Token, user2Token, products };
}

// ============================================
// TEST A: DOUBLE VERIFY RACE
// ============================================

async function testDoubleVerifyRace(adminToken, user1Token, products) {
    logSection('TEST A: DOUBLE VERIFY RACE');

    const testProduct = products[0];
    log('TEST_A', `Using product: ${testProduct.name} (ID: ${testProduct.id})`);

    // Set stock to known value
    const initialStock = 10;
    await updateProductStock(adminToken, testProduct.id, initialStock);
    log('TEST_A', `Set initial stock to ${initialStock}`);

    // Create address
    const address = await createAddress(user1Token, {
        fullName: 'Test User',
        phone: '1234567890',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
    });

    // Add to cart and create order
    await addToCart(user1Token, testProduct.id, 1);
    const order = await createOrder(user1Token, address.id);
    log('TEST_A', `Created order: ${order.orderNumber}`);

    // Initiate payment
    const payment = await initiatePayment(user1Token, order.id);
    const gatewayOrderId = payment.gatewayOrderId;
    const paymentId = 'pay_test_double_verify';
    const signature = generateSignature(gatewayOrderId, paymentId);

    log('TEST_A', 'Executing parallel verify calls...');
    const startTime = Date.now();

    // Execute in parallel
    const [result1, result2] = await Promise.all([
        verifyPayment(user1Token, order.id, paymentId, signature),
        verifyPayment(user1Token, order.id, paymentId, signature),
    ]);

    const endTime = Date.now();
    log('TEST_A', `Parallel execution completed in ${endTime - startTime}ms`);

    log('TEST_A', 'Result 1:', result1);
    log('TEST_A', 'Result 2:', result2);

    // Check stock
    const finalProduct = await getProduct(testProduct.id);
    log('TEST_A', `Final stock: ${finalProduct.stock} (expected: ${initialStock - 1})`);

    // Validation
    const oneProcessed = (result1.alreadyProcessed && !result2.alreadyProcessed) ||
        (!result1.alreadyProcessed && result2.alreadyProcessed);

    log('TEST_A', `✓ One call processed, one idempotent: ${oneProcessed}`);
    log('TEST_A', `✓ Stock deducted exactly once: ${finalProduct.stock === initialStock - 1}`);

    return {
        passed: oneProcessed && finalProduct.stock === initialStock - 1,
        initialStock,
        finalStock: finalProduct.stock,
        executionTime: endTime - startTime,
    };
}

// ============================================
// TEST B: WEBHOOK + VERIFY RACE
// ============================================

async function testWebhookVerifyRace(adminToken, user1Token, products) {
    logSection('TEST B: WEBHOOK + VERIFY RACE');

    const testProduct = products[1];
    log('TEST_B', `Using product: ${testProduct.name} (ID: ${testProduct.id})`);

    // Set stock to known value
    const initialStock = 10;
    await updateProductStock(adminToken, testProduct.id, initialStock);
    log('TEST_B', `Set initial stock to ${initialStock}`);

    // Create address
    const address = await createAddress(user1Token, {
        fullName: 'Test User',
        phone: '1234567890',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
    });

    // Add to cart and create order
    await clearCart(user1Token);
    await addToCart(user1Token, testProduct.id, 1);
    const order = await createOrder(user1Token, address.id);
    log('TEST_B', `Created order: ${order.orderNumber}`);

    // Initiate payment
    const payment = await initiatePayment(user1Token, order.id);
    const gatewayOrderId = payment.gatewayOrderId;
    const paymentId = 'pay_test_webhook_verify';
    const signature = generateSignature(gatewayOrderId, paymentId);

    log('TEST_B', 'Executing webhook + verify in parallel...');
    const startTime = Date.now();

    // Execute in parallel (webhook and verify)
    const [webhookResult, verifyResult] = await Promise.all([
        axios.post(`${BASE_URL}/payments/webhook`, {
            orderId: gatewayOrderId,
            paymentId,
        }).then(r => r.data).catch(e => ({ error: e.response?.data })),
        verifyPayment(user1Token, order.id, paymentId, signature),
    ]);

    const endTime = Date.now();
    log('TEST_B', `Parallel execution completed in ${endTime - startTime}ms`);

    log('TEST_B', 'Webhook result:', webhookResult);
    log('TEST_B', 'Verify result:', verifyResult);

    // Check stock
    const finalProduct = await getProduct(testProduct.id);
    log('TEST_B', `Final stock: ${finalProduct.stock} (expected: ${initialStock - 1})`);

    // Validation
    const stockDeductedOnce = finalProduct.stock === initialStock - 1;
    log('TEST_B', `✓ Stock deducted exactly once: ${stockDeductedOnce}`);

    return {
        passed: stockDeductedOnce,
        initialStock,
        finalStock: finalProduct.stock,
        executionTime: endTime - startTime,
    };
}

// ============================================
// TEST C: CROSS-ORDER STOCK EXHAUSTION
// ============================================

async function testCrossOrderExhaustion(adminToken, user1Token, user2Token, products) {
    logSection('TEST C: CROSS-ORDER STOCK EXHAUSTION');

    const testProduct = products[2];
    log('TEST_C', `Using product: ${testProduct.name} (ID: ${testProduct.id})`);

    // Set stock to 1
    const initialStock = 1;
    await updateProductStock(adminToken, testProduct.id, initialStock);
    log('TEST_C', `Set initial stock to ${initialStock}`);

    // Create addresses for both users
    const address1 = await createAddress(user1Token, {
        fullName: 'User 1',
        phone: '1111111111',
        addressLine1: '111 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '111111',
    });

    const address2 = await createAddress(user2Token, {
        fullName: 'User 2',
        phone: '2222222222',
        addressLine1: '222 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '222222',
    });

    // Both users add to cart and create orders
    await clearCart(user1Token);
    await clearCart(user2Token);
    await addToCart(user1Token, testProduct.id, 1);
    await addToCart(user2Token, testProduct.id, 1);

    const order1 = await createOrder(user1Token, address1.id);
    const order2 = await createOrder(user2Token, address2.id);

    log('TEST_C', `User 1 order: ${order1.orderNumber}`);
    log('TEST_C', `User 2 order: ${order2.orderNumber}`);

    // Initiate payments
    const payment1 = await initiatePayment(user1Token, order1.id);
    const payment2 = await initiatePayment(user2Token, order2.id);

    const paymentId1 = 'pay_test_user1';
    const paymentId2 = 'pay_test_user2';
    const signature1 = generateSignature(payment1.gatewayOrderId, paymentId1);
    const signature2 = generateSignature(payment2.gatewayOrderId, paymentId2);

    log('TEST_C', 'Executing parallel verify calls...');
    const startTime = Date.now();

    // Execute in parallel
    const [result1, result2] = await Promise.all([
        verifyPayment(user1Token, order1.id, paymentId1, signature1),
        verifyPayment(user2Token, order2.id, paymentId2, signature2),
    ]);

    const endTime = Date.now();
    log('TEST_C', `Parallel execution completed in ${endTime - startTime}ms`);

    log('TEST_C', 'User 1 result:', result1);
    log('TEST_C', 'User 2 result:', result2);

    // Check stock
    const finalProduct = await getProduct(testProduct.id);
    log('TEST_C', `Final stock: ${finalProduct.stock} (expected: 0)`);

    // Validation
    const oneSuccess = (result1.success && !result2.success) || (!result1.success && result2.success);
    const stockIsZero = finalProduct.stock === 0;

    log('TEST_C', `✓ One user succeeded, one failed: ${oneSuccess}`);
    log('TEST_C', `✓ Final stock is 0: ${stockIsZero}`);

    return {
        passed: oneSuccess && stockIsZero,
        initialStock,
        finalStock: finalProduct.stock,
        executionTime: endTime - startTime,
    };
}

// ============================================
// TEST D: DEDUCTION FAILURE ROLLBACK
// ============================================

async function testDeductionFailureRollback(adminToken, user1Token, products) {
    logSection('TEST D: DEDUCTION FAILURE ROLLBACK');

    const testProduct = products[3];
    log('TEST_D', `Using product: ${testProduct.name} (ID: ${testProduct.id})`);

    // Create address
    const address = await createAddress(user1Token, {
        fullName: 'Test User',
        phone: '1234567890',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
    });

    // Add to cart and create order
    await clearCart(user1Token);
    await addToCart(user1Token, testProduct.id, 1);
    const order = await createOrder(user1Token, address.id);
    log('TEST_D', `Created order: ${order.orderNumber}`);

    // Initiate payment
    const payment = await initiatePayment(user1Token, order.id);

    // Set stock to 0 AFTER order creation
    await updateProductStock(adminToken, testProduct.id, 0);
    log('TEST_D', 'Set stock to 0 after order creation');

    // Attempt to verify payment
    const paymentId = 'pay_test_rollback';
    const signature = generateSignature(payment.gatewayOrderId, paymentId);

    log('TEST_D', 'Attempting payment verification...');
    const result = await verifyPayment(user1Token, order.id, paymentId, signature);

    log('TEST_D', 'Verify result:', result);

    // Check order status
    const finalOrder = await getOrder(user1Token, order.id);
    log('TEST_D', `Order status: ${finalOrder.orderStatus}`);
    log('TEST_D', `Payment status: ${finalOrder.paymentStatus}`);
    log('TEST_D', `Stock deducted: ${finalOrder.stockDeducted}`);
    log('TEST_D', `Gateway payment ID: ${finalOrder.gatewayPaymentId}`);

    // Validation
    const verifyFailed = !result.success;
    const orderStillPending = finalOrder.orderStatus === 'PENDING';
    const stockNotDeducted = finalOrder.stockDeducted === false;
    const paymentIdNotSet = finalOrder.gatewayPaymentId === null;

    log('TEST_D', `✓ Verify failed: ${verifyFailed}`);
    log('TEST_D', `✓ Order still PENDING: ${orderStillPending}`);
    log('TEST_D', `✓ Stock not deducted: ${stockNotDeducted}`);
    log('TEST_D', `✓ Payment ID not set: ${paymentIdNotSet}`);

    return {
        passed: verifyFailed && orderStillPending && stockNotDeducted && paymentIdNotSet,
        orderStatus: finalOrder.orderStatus,
        stockDeducted: finalOrder.stockDeducted,
        gatewayPaymentId: finalOrder.gatewayPaymentId,
    };
}

// ============================================
// TEST E: REPLAY ATTACK
// ============================================

async function testReplayAttack(adminToken, user1Token, products) {
    logSection('TEST E: REPLAY ATTACK');

    const testProduct = products[4];
    log('TEST_E', `Using product: ${testProduct.name} (ID: ${testProduct.id})`);

    // Set stock
    await updateProductStock(adminToken, testProduct.id, 10);

    // Create address
    const address = await createAddress(user1Token, {
        fullName: 'Test User',
        phone: '1234567890',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
    });

    // Add to cart and create order
    await clearCart(user1Token);
    await addToCart(user1Token, testProduct.id, 1);
    const order = await createOrder(user1Token, address.id);
    log('TEST_E', `Created order: ${order.orderNumber}`);

    // Initiate payment
    const payment = await initiatePayment(user1Token, order.id);

    // First verification with payment ID A
    const paymentIdA = 'pay_test_replay_A';
    const signatureA = generateSignature(payment.gatewayOrderId, paymentIdA);

    log('TEST_E', 'First verification with payment ID A...');
    const result1 = await verifyPayment(user1Token, order.id, paymentIdA, signatureA);
    log('TEST_E', 'First result:', result1);

    // Attempt replay with payment ID B
    const paymentIdB = 'pay_test_replay_B';
    const signatureB = generateSignature(payment.gatewayOrderId, paymentIdB);

    log('TEST_E', 'Attempting replay with payment ID B...');
    const result2 = await verifyPayment(user1Token, order.id, paymentIdB, signatureB);
    log('TEST_E', 'Second result:', result2);

    // Check order
    const finalOrder = await getOrder(user1Token, order.id);
    log('TEST_E', `Gateway payment ID: ${finalOrder.gatewayPaymentId}`);

    // Validation
    const firstSucceeded = result1.success;
    const secondBlocked = result2.alreadyProcessed === true;
    const paymentIdImmutable = finalOrder.gatewayPaymentId === paymentIdA;

    log('TEST_E', `✓ First verification succeeded: ${firstSucceeded}`);
    log('TEST_E', `✓ Second verification blocked: ${secondBlocked}`);
    log('TEST_E', `✓ Payment ID immutable: ${paymentIdImmutable}`);

    return {
        passed: firstSucceeded && secondBlocked && paymentIdImmutable,
        gatewayPaymentId: finalOrder.gatewayPaymentId,
    };
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
    try {
        const setup = await setupTest();

        const results = {
            testA: await testDoubleVerifyRace(setup.adminToken, setup.user1Token, setup.products),
            testB: await testWebhookVerifyRace(setup.adminToken, setup.user1Token, setup.products),
            testC: await testCrossOrderExhaustion(setup.adminToken, setup.user1Token, setup.user2Token, setup.products),
            testD: await testDeductionFailureRollback(setup.adminToken, setup.user1Token, setup.products),
            testE: await testReplayAttack(setup.adminToken, setup.user1Token, setup.products),
        };

        logSection('TEST RESULTS SUMMARY');
        console.log('Test A (Double Verify Race):', results.testA.passed ? '✓ PASSED' : '✗ FAILED');
        console.log('Test B (Webhook + Verify Race):', results.testB.passed ? '✓ PASSED' : '✗ FAILED');
        console.log('Test C (Cross-Order Exhaustion):', results.testC.passed ? '✓ PASSED' : '✗ FAILED');
        console.log('Test D (Deduction Failure Rollback):', results.testD.passed ? '✓ PASSED' : '✗ FAILED');
        console.log('Test E (Replay Attack):', results.testE.passed ? '✓ PASSED' : '✗ FAILED');

        const allPassed = Object.values(results).every(r => r.passed);
        console.log('\n' + (allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'));

        return results;
    } catch (error) {
        log('ERROR', 'Test suite failed', error);
        throw error;
    }
}

// Run tests
runAllTests().catch(console.error);
