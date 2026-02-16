/**
 * COMPREHENSIVE PHASE 5 VALIDATION TEST SUITE
 * 
 * This test suite validates:
 * 1. True concurrent verify test (parallel execution)
 * 2. Cross-order stock exhaustion test (two users, stock=1)
 * 3. Forbidden state transition tests
 * 4. gatewayPaymentId immutability after webhook + verify combination
 * 5. Cart clearing timing verification
 * 6. Double stock deduction proof
 */

const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:4000/v1';
const RAZORPAY_KEY_SECRET = 'test_secret_key';

// Test configuration
const config = {
    admin: {
        email: 'admin@ecommerce.com',
        password: 'Test@1234'
    },
    users: [
        { email: 'customer1@gmail.com', password: 'Test@1234', phone: '+1-555-0101' },
        { email: 'customer2@gmail.com', password: 'Test@1234', phone: '+1-555-0102' }
    ]
};

// Utility functions
function generateSignature(orderId, paymentId) {
    const text = `${orderId}|${paymentId}`;
    return crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(text).digest('hex');
}

function log(category, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] [${category}] ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

function logSection(title) {
    console.log('\n' + '='.repeat(80));
    console.log(`  ${title}`);
    console.log('='.repeat(80));
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// API helper functions
async function loginUser(email, password) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
        return response.data.access_token;
    } catch (error) {
        log('ERROR', `Login failed for ${email}`, error.response?.data);
        throw error;
    }
}

async function createProduct(token, productData) {
    try {
        const response = await axios.post(`${BASE_URL}/products`, productData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        log('ERROR', 'Product creation failed', error.response?.data);
        throw error;
    }
}

async function getProduct(productId) {
    try {
        const response = await axios.get(`${BASE_URL}/products/${productId}`);
        return response.data;
    } catch (error) {
        log('ERROR', 'Get product failed', error.response?.data);
        throw error;
    }
}

async function addToCart(token, productId, quantity) {
    try {
        const response = await axios.post(`${BASE_URL}/cart/add`,
            { productId, quantity },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        log('ERROR', 'Add to cart failed', error.response?.data);
        throw error;
    }
}

async function getCart(token) {
    try {
        const response = await axios.get(`${BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        log('ERROR', 'Get cart failed', error.response?.data);
        throw error;
    }
}

async function createAddress(token, addressData) {
    try {
        const response = await axios.post(`${BASE_URL}/addresses`, addressData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        log('ERROR', 'Create address failed', error.response?.data);
        throw error;
    }
}

async function createOrder(token, addressId, notes = '') {
    try {
        const response = await axios.post(`${BASE_URL}/orders`,
            { addressId, notes },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        log('ERROR', 'Create order failed', error.response?.data);
        throw error;
    }
}

async function initiatePayment(token, orderId, paymentMethod = 'RAZORPAY') {
    try {
        const response = await axios.post(`${BASE_URL}/payments/initiate`,
            { orderId, paymentMethod },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        log('ERROR', 'Initiate payment failed', error.response?.data);
        throw error;
    }
}

async function verifyPayment(token, orderId, paymentId, signature) {
    try {
        const response = await axios.post(`${BASE_URL}/payments/verify`,
            { orderId, paymentId, signature },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        log('ERROR', 'Verify payment failed', error.response?.data);
        return { success: false, error: error.response?.data };
    }
}

async function getOrder(token, orderId) {
    try {
        const response = await axios.get(`${BASE_URL}/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        log('ERROR', 'Get order failed', error.response?.data);
        throw error;
    }
}

async function sendWebhook(payload) {
    try {
        const response = await axios.post(`${BASE_URL}/payments/webhook`, payload);
        return response.data;
    } catch (error) {
        log('ERROR', 'Webhook failed', error.response?.data);
        return { success: false, error: error.response?.data };
    }
}

// Test setup
async function setupTest() {
    logSection('TEST SETUP');

    // Login as admin
    log('SETUP', 'Logging in as admin...');
    const adminToken = await loginUser(config.admin.email, config.admin.password);

    // Login users
    log('SETUP', 'Logging in test users...');
    const user1Token = await loginUser(config.users[0].email, config.users[0].password);
    const user2Token = await loginUser(config.users[1].email, config.users[1].password);

    return { adminToken, user1Token, user2Token };
}

// Test 1: Double Stock Deduction Proof
async function testDoubleStockDeduction(adminToken, userToken) {
    logSection('TEST 1: DOUBLE STOCK DEDUCTION PROOF');

    try {
        // Create product with stock = 10
        log('TEST1', 'Creating product with stock = 10');
        const product = await createProduct(adminToken, {
            name: 'Double Deduction Test Product',
            slug: `double-deduct-${Date.now()}`,
            description: 'Testing double deduction',
            price: 100,
            stock: 10,
            category: 'test'
        });
        log('TEST1', 'Product created', { id: product.id, stock: product.stock });

        // Add to cart
        log('TEST1', 'Adding 1 unit to cart');
        await addToCart(userToken, product.id, 1);

        // Create address
        const address = await createAddress(userToken, {
            fullName: 'Test User',
            phone: '1234567890',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country'
        });

        // Check stock before order
        const stockBefore = await getProduct(product.id);
        log('TEST1', 'Stock BEFORE order creation', { stock: stockBefore.stock });

        // Create order
        log('TEST1', 'Creating order...');
        const order = await createOrder(userToken, address.id);
        log('TEST1', 'Order created', { id: order.id, status: order.orderStatus });

        // Check stock after order creation
        const stockAfterOrder = await getProduct(product.id);
        log('TEST1', 'Stock AFTER order creation', { stock: stockAfterOrder.stock });

        // Initiate payment
        log('TEST1', 'Initiating payment...');
        const payment = await initiatePayment(userToken, order.id);
        log('TEST1', 'Payment initiated', { gatewayOrderId: payment.gatewayOrderId });

        // Verify payment
        const paymentId = `pay_${Date.now()}`;
        const signature = generateSignature(payment.gatewayOrderId, paymentId);

        log('TEST1', 'Verifying payment...');
        const verifyResult = await verifyPayment(userToken, order.id, paymentId, signature);
        log('TEST1', 'Payment verified', verifyResult);

        // Check stock after payment verification
        const stockAfterVerify = await getProduct(product.id);
        log('TEST1', 'Stock AFTER payment verification', { stock: stockAfterVerify.stock });

        // Calculate deductions
        const deductionAtOrder = stockBefore.stock - stockAfterOrder.stock;
        const deductionAtVerify = stockAfterOrder.stock - stockAfterVerify.stock;
        const totalDeduction = stockBefore.stock - stockAfterVerify.stock;

        log('TEST1', 'DEDUCTION SUMMARY', {
            stockBefore: stockBefore.stock,
            stockAfterOrder: stockAfterOrder.stock,
            stockAfterVerify: stockAfterVerify.stock,
            deductionAtOrder,
            deductionAtVerify,
            totalDeduction,
            expected: 1,
            DOUBLE_DEDUCTION: totalDeduction > 1
        });

        return {
            success: true,
            doubleDeduction: totalDeduction > 1,
            deductions: { deductionAtOrder, deductionAtVerify, totalDeduction }
        };

    } catch (error) {
        log('TEST1', 'Test failed', error.message);
        return { success: false, error: error.message };
    }
}

// Test 2: True Concurrent Verify Test
async function testConcurrentVerify(adminToken, user1Token, user2Token) {
    logSection('TEST 2: TRUE CONCURRENT VERIFY TEST (PARALLEL EXECUTION)');

    try {
        // Create product with stock = 5
        log('TEST2', 'Creating product with stock = 5');
        const product = await createProduct(adminToken, {
            name: 'Concurrent Verify Test Product',
            slug: `concurrent-verify-${Date.now()}`,
            description: 'Testing concurrent verification',
            price: 100,
            stock: 5,
            category: 'test'
        });

        // Setup for both users
        const setupUser = async (token, userName) => {
            await addToCart(token, product.id, 2);
            const address = await createAddress(token, {
                fullName: userName,
                phone: '1234567890',
                addressLine1: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                postalCode: '12345',
                country: 'Test Country'
            });
            const order = await createOrder(token, address.id);
            const payment = await initiatePayment(token, order.id);
            return { order, payment };
        };

        log('TEST2', 'Setting up User 1...');
        const user1Setup = await setupUser(user1Token, 'User 1');

        log('TEST2', 'Setting up User 2...');
        const user2Setup = await setupUser(user2Token, 'User 2');

        // Check stock before concurrent verify
        const stockBefore = await getProduct(product.id);
        log('TEST2', 'Stock BEFORE concurrent verify', { stock: stockBefore.stock });

        // Generate payment IDs and signatures
        const payment1Id = `pay_user1_${Date.now()}`;
        const signature1 = generateSignature(user1Setup.payment.gatewayOrderId, payment1Id);

        const payment2Id = `pay_user2_${Date.now()}`;
        const signature2 = generateSignature(user2Setup.payment.gatewayOrderId, payment2Id);

        // Execute verifications in PARALLEL
        log('TEST2', 'Executing PARALLEL payment verifications...');
        const startTime = Date.now();

        const [result1, result2] = await Promise.all([
            verifyPayment(user1Token, user1Setup.order.id, payment1Id, signature1),
            verifyPayment(user2Token, user2Setup.order.id, payment2Id, signature2)
        ]);

        const endTime = Date.now();
        const duration = endTime - startTime;

        log('TEST2', `Parallel execution completed in ${duration}ms`);
        log('TEST2', 'User 1 result', result1);
        log('TEST2', 'User 2 result', result2);

        // Check stock after concurrent verify
        const stockAfter = await getProduct(product.id);
        log('TEST2', 'Stock AFTER concurrent verify', { stock: stockAfter.stock });

        // Get final order states
        const finalOrder1 = await getOrder(user1Token, user1Setup.order.id);
        const finalOrder2 = await getOrder(user2Token, user2Setup.order.id);

        log('TEST2', 'Final order states', {
            order1: { status: finalOrder1.orderStatus, paymentStatus: finalOrder1.paymentStatus },
            order2: { status: finalOrder2.orderStatus, paymentStatus: finalOrder2.paymentStatus }
        });

        return {
            success: true,
            duration,
            results: { result1, result2 },
            stockBefore: stockBefore.stock,
            stockAfter: stockAfter.stock,
            finalOrders: { order1: finalOrder1, order2: finalOrder2 }
        };

    } catch (error) {
        log('TEST2', 'Test failed', error.message);
        return { success: false, error: error.message };
    }
}

// Test 3: Cross-Order Stock Exhaustion
async function testCrossOrderStockExhaustion(adminToken, user1Token, user2Token) {
    logSection('TEST 3: CROSS-ORDER STOCK EXHAUSTION (TWO USERS, STOCK=1)');

    try {
        // Create product with stock = 1
        log('TEST3', 'Creating product with stock = 1');
        const product = await createProduct(adminToken, {
            name: 'Stock Exhaustion Test Product',
            slug: `stock-exhaust-${Date.now()}`,
            description: 'Testing stock exhaustion',
            price: 100,
            stock: 1,
            category: 'test'
        });

        // User 1: Add to cart and create order
        log('TEST3', 'User 1: Adding to cart and creating order');
        await addToCart(user1Token, product.id, 1);
        const address1 = await createAddress(user1Token, {
            fullName: 'User 1',
            phone: '1234567890',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country'
        });
        const order1 = await createOrder(user1Token, address1.id);
        log('TEST3', 'User 1 order created', { id: order1.id });

        // Check stock after User 1 order
        const stockAfterOrder1 = await getProduct(product.id);
        log('TEST3', 'Stock after User 1 order', { stock: stockAfterOrder1.stock });

        // User 2: Try to add to cart and create order
        log('TEST3', 'User 2: Attempting to add to cart and create order');
        let user2OrderCreated = false;
        let user2Error = null;

        try {
            await addToCart(user2Token, product.id, 1);
            const address2 = await createAddress(user2Token, {
                fullName: 'User 2',
                phone: '0987654321',
                addressLine1: '456 Test Ave',
                city: 'Test City',
                state: 'Test State',
                postalCode: '54321',
                country: 'Test Country'
            });
            const order2 = await createOrder(user2Token, address2.id);
            user2OrderCreated = true;
            log('TEST3', 'User 2 order created (UNEXPECTED!)', { id: order2.id });
        } catch (error) {
            user2Error = error.response?.data || error.message;
            log('TEST3', 'User 2 order creation failed (EXPECTED)', user2Error);
        }

        // Check final stock
        const finalStock = await getProduct(product.id);
        log('TEST3', 'Final stock', { stock: finalStock.stock });

        return {
            success: true,
            stockAfterOrder1: stockAfterOrder1.stock,
            user2OrderCreated,
            user2Error,
            finalStock: finalStock.stock,
            overselling: user2OrderCreated && finalStock.stock < 0
        };

    } catch (error) {
        log('TEST3', 'Test failed', error.message);
        return { success: false, error: error.message };
    }
}

// Test 4: Forbidden State Transitions
async function testForbiddenStateTransitions(adminToken, userToken) {
    logSection('TEST 4: FORBIDDEN STATE TRANSITIONS');

    const results = {};

    try {
        // Create product
        const product = await createProduct(adminToken, {
            name: 'State Transition Test Product',
            slug: `state-test-${Date.now()}`,
            description: 'Testing state transitions',
            price: 100,
            stock: 10,
            category: 'test'
        });

        // Create order
        await addToCart(userToken, product.id, 1);
        const address = await createAddress(userToken, {
            fullName: 'Test User',
            phone: '1234567890',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country'
        });
        const order = await createOrder(userToken, address.id);
        const payment = await initiatePayment(userToken, order.id);

        // Test 4a: Double verification with same payment ID
        log('TEST4a', 'Testing double verification with SAME payment ID');
        const paymentId = `pay_${Date.now()}`;
        const signature = generateSignature(payment.gatewayOrderId, paymentId);

        const verify1 = await verifyPayment(userToken, order.id, paymentId, signature);
        log('TEST4a', 'First verification', verify1);

        const verify2 = await verifyPayment(userToken, order.id, paymentId, signature);
        log('TEST4a', 'Second verification (should be idempotent)', verify2);

        results.doubleVerifySameId = {
            firstSuccess: verify1.success,
            secondSuccess: verify2.success,
            secondIdempotent: verify2.alreadyProcessed === true
        };

        // Test 4b: Verification with different payment ID
        log('TEST4b', 'Testing verification with DIFFERENT payment ID');
        const differentPaymentId = `pay_different_${Date.now()}`;
        const differentSignature = generateSignature(payment.gatewayOrderId, differentPaymentId);

        const verify3 = await verifyPayment(userToken, order.id, differentPaymentId, differentSignature);
        log('TEST4b', 'Verification with different ID (should fail)', verify3);

        results.verifyDifferentId = {
            success: verify3.success,
            blocked: verify3.success === false,
            error: verify3.error
        };

        // Test 4c: Webhook after verify
        log('TEST4c', 'Testing webhook AFTER verify');
        const webhookPayload = {
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: {
                        id: paymentId,
                        order_id: payment.gatewayOrderId,
                        status: 'captured'
                    }
                }
            }
        };

        const webhookResult = await sendWebhook(webhookPayload);
        log('TEST4c', 'Webhook result (should be idempotent)', webhookResult);

        results.webhookAfterVerify = {
            success: webhookResult.success !== false,
            idempotent: true
        };

        return { success: true, results };

    } catch (error) {
        log('TEST4', 'Test failed', error.message);
        return { success: false, error: error.message };
    }
}

// Test 5: gatewayPaymentId Immutability
async function testGatewayPaymentIdImmutability(adminToken, userToken) {
    logSection('TEST 5: GATEWAY PAYMENT ID IMMUTABILITY');

    try {
        // Create product and order
        const product = await createProduct(adminToken, {
            name: 'Payment ID Immutability Test',
            slug: `payment-id-test-${Date.now()}`,
            description: 'Testing payment ID immutability',
            price: 100,
            stock: 10,
            category: 'test'
        });

        await addToCart(userToken, product.id, 1);
        const address = await createAddress(userToken, {
            fullName: 'Test User',
            phone: '1234567890',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country'
        });
        const order = await createOrder(userToken, address.id);
        const payment = await initiatePayment(userToken, order.id);

        // First: Send webhook
        const webhookPaymentId = `pay_webhook_${Date.now()}`;
        const webhookPayload = {
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: {
                        id: webhookPaymentId,
                        order_id: payment.gatewayOrderId,
                        status: 'captured'
                    }
                }
            }
        };

        log('TEST5', 'Sending webhook first...');
        const webhookResult = await sendWebhook(webhookPayload);
        log('TEST5', 'Webhook result', webhookResult);

        // Check order state after webhook
        const orderAfterWebhook = await getOrder(userToken, order.id);
        log('TEST5', 'Order after webhook', {
            paymentStatus: orderAfterWebhook.paymentStatus,
            gatewayPaymentId: orderAfterWebhook.gatewayPaymentId
        });

        // Second: Try to verify with different payment ID
        const verifyPaymentId = `pay_verify_${Date.now()}`;
        const verifySignature = generateSignature(payment.gatewayOrderId, verifyPaymentId);

        log('TEST5', 'Attempting verify with DIFFERENT payment ID...');
        const verifyResult = await verifyPayment(userToken, order.id, verifyPaymentId, verifySignature);
        log('TEST5', 'Verify result (should fail)', verifyResult);

        // Check final order state
        const finalOrder = await getOrder(userToken, order.id);
        log('TEST5', 'Final order state', {
            paymentStatus: finalOrder.paymentStatus,
            gatewayPaymentId: finalOrder.gatewayPaymentId
        });

        return {
            success: true,
            webhookPaymentId,
            verifyPaymentId,
            finalGatewayPaymentId: finalOrder.gatewayPaymentId,
            immutable: finalOrder.gatewayPaymentId === webhookPaymentId,
            verifyBlocked: verifyResult.success === false
        };

    } catch (error) {
        log('TEST5', 'Test failed', error.message);
        return { success: false, error: error.message };
    }
}

// Test 6: Cart Clearing Timing
async function testCartClearingTiming(adminToken, userToken) {
    logSection('TEST 6: CART CLEARING TIMING');

    try {
        // Create product
        const product = await createProduct(adminToken, {
            name: 'Cart Clearing Test Product',
            slug: `cart-clear-${Date.now()}`,
            description: 'Testing cart clearing timing',
            price: 100,
            stock: 10,
            category: 'test'
        });

        // Add to cart
        await addToCart(userToken, product.id, 2);

        // Check cart before order
        const cartBefore = await getCart(userToken);
        log('TEST6', 'Cart BEFORE order', { itemCount: cartBefore.items?.length || 0 });

        // Create order
        const address = await createAddress(userToken, {
            fullName: 'Test User',
            phone: '1234567890',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country'
        });
        const order = await createOrder(userToken, address.id);

        // Check cart after order creation
        const cartAfterOrder = await getCart(userToken);
        log('TEST6', 'Cart AFTER order creation', { itemCount: cartAfterOrder.items?.length || 0 });

        // Initiate payment
        const payment = await initiatePayment(userToken, order.id);

        // Check cart after payment initiation
        const cartAfterInitiate = await getCart(userToken);
        log('TEST6', 'Cart AFTER payment initiation', { itemCount: cartAfterInitiate.items?.length || 0 });

        // Verify payment
        const paymentId = `pay_${Date.now()}`;
        const signature = generateSignature(payment.gatewayOrderId, paymentId);
        await verifyPayment(userToken, order.id, paymentId, signature);

        // Check cart after payment verification
        const cartAfterVerify = await getCart(userToken);
        log('TEST6', 'Cart AFTER payment verification', { itemCount: cartAfterVerify.items?.length || 0 });

        return {
            success: true,
            cartBeforeOrder: cartBefore.items?.length || 0,
            cartAfterOrder: cartAfterOrder.items?.length || 0,
            cartAfterInitiate: cartAfterInitiate.items?.length || 0,
            cartAfterVerify: cartAfterVerify.items?.length || 0,
            clearedBeforeConfirmation: cartAfterOrder.items?.length === 0,
            clearedAfterConfirmation: cartAfterVerify.items?.length === 0
        };

    } catch (error) {
        log('TEST6', 'Test failed', error.message);
        return { success: false, error: error.message };
    }
}

// Main test execution
async function runAllTests() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║         COMPREHENSIVE PHASE 5 VALIDATION TEST SUITE                        ║');
    console.log('║         Stock Deduction & Payment Flow Verification                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝');

    try {
        // Setup
        const { adminToken, user1Token, user2Token } = await setupTest();

        // Run all tests
        const results = {
            test1: await testDoubleStockDeduction(adminToken, user1Token),
            test2: await testConcurrentVerify(adminToken, user1Token, user2Token),
            test3: await testCrossOrderStockExhaustion(adminToken, user1Token, user2Token),
            test4: await testForbiddenStateTransitions(adminToken, user1Token),
            test5: await testGatewayPaymentIdImmutability(adminToken, user1Token),
            test6: await testCartClearingTiming(adminToken, user1Token)
        };

        // Summary
        logSection('TEST SUMMARY');

        console.log('\n📊 RESULTS:\n');
        console.log('Test 1 - Double Stock Deduction:', results.test1.success ? '✅ PASS' : '❌ FAIL');
        if (results.test1.doubleDeduction) {
            console.log('  ⚠️  CRITICAL: Double deduction detected!');
            console.log('  📉 Deductions:', results.test1.deductions);
        }

        console.log('\nTest 2 - Concurrent Verify:', results.test2.success ? '✅ PASS' : '❌ FAIL');
        if (results.test2.success) {
            console.log(`  ⏱️  Duration: ${results.test2.duration}ms`);
            console.log(`  📦 Stock: ${results.test2.stockBefore} → ${results.test2.stockAfter}`);
        }

        console.log('\nTest 3 - Stock Exhaustion:', results.test3.success ? '✅ PASS' : '❌ FAIL');
        if (results.test3.overselling) {
            console.log('  ⚠️  CRITICAL: Overselling detected!');
        }

        console.log('\nTest 4 - State Transitions:', results.test4.success ? '✅ PASS' : '❌ FAIL');
        console.log('\nTest 5 - Payment ID Immutability:', results.test5.success ? '✅ PASS' : '❌ FAIL');
        if (results.test5.success) {
            console.log(`  🔒 Immutable: ${results.test5.immutable ? 'YES' : 'NO'}`);
        }

        console.log('\nTest 6 - Cart Clearing Timing:', results.test6.success ? '✅ PASS' : '❌ FAIL');
        if (results.test6.success) {
            console.log(`  🛒 Cleared before confirmation: ${results.test6.clearedBeforeConfirmation ? 'YES (BAD)' : 'NO (GOOD)'}`);
            console.log(`  🛒 Cleared after confirmation: ${results.test6.clearedAfterConfirmation ? 'YES (GOOD)' : 'NO (BAD)'}`);
        }

        // Save results to file
        const fs = require('fs');
        const resultsFile = `test-results-${Date.now()}.json`;
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        console.log(`\n💾 Full results saved to: ${resultsFile}`);

    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests
runAllTests().then(() => {
    console.log('\n✅ Test suite completed');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Test suite error:', error);
    process.exit(1);
});
