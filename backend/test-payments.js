/**
 * Phase 5 - Payments Module Automated Test Suite
 * 
 * Tests all payment scenarios:
 * - Happy path (Razorpay mock)
 * - COD flow
 * - Invalid cases
 * - Edge cases
 * - Idempotency
 * - Security validations
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:4000/v1';
const PASSWORD = 'Test@1234';

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(70));
    log(title, colors.cyan + colors.bright);
    console.log('='.repeat(70) + '\n');
}

async function login(email) {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password: PASSWORD,
    });
    return response.data.data.accessToken;
}

async function createOrder(token) {
    // Get cart
    const cartResp = await axios.get(`${BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!cartResp.data.data.items || cartResp.data.data.items.length === 0) {
        // Add item to cart - select active product with stock
        const productsResp = await axios.get(`${BASE_URL}/products?limit=10&isActive=true`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const products = productsResp.data.data.data || productsResp.data.data;
        const product = products.find(p => p.isActive && p.stock > 5);

        if (!product) {
            throw new Error('No active products with sufficient stock found');
        }

        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId: product.id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }

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

    return orderResp.data.data;
}

async function runTests() {
    logSection('PHASE 5 - PAYMENTS MODULE TEST SUITE');

    const results = {
        passed: 0,
        failed: 0,
        tests: [],
    };

    function recordTest(name, passed, message = '') {
        results.tests.push({ name, passed, message });
        if (passed) {
            results.passed++;
            log(`✅ ${name}`, colors.green);
        } else {
            results.failed++;
            log(`❌ ${name}: ${message}`, colors.red);
        }
    }

    try {
        // ========================================
        // TEST 1: RAZORPAY HAPPY PATH
        // ========================================
        logSection('TEST 1: RAZORPAY HAPPY PATH');

        const token1 = await login('customer1@gmail.com');
        const order1 = await createOrder(token1);
        log(`Created order: ${order1.orderNumber}`, colors.reset);

        // Initiate payment
        const initiateResp = await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order1.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token1}` } }
        );

        recordTest(
            'Initiate Razorpay payment',
            initiateResp.data.success && initiateResp.data.gatewayOrderId,
            'Should return gateway order ID'
        );

        const gatewayOrderId = initiateResp.data.gatewayOrderId;
        log(`Gateway Order ID: ${gatewayOrderId}`, colors.reset);

        // Verify payment with valid signature
        const verifyResp = await axios.post(
            `${BASE_URL}/payments/verify`,
            {
                orderId: order1.id,
                paymentId: 'pay_test_123',
                signature: 'valid_signature',
            },
            { headers: { Authorization: `Bearer ${token1}` } }
        );

        recordTest(
            'Verify payment with valid signature',
            verifyResp.data.success && verifyResp.data.order.paymentStatus === 'PAID',
            'Should confirm order and mark payment as PAID'
        );

        // Check order status in DB
        const dbOrder1 = await prisma.order.findUnique({
            where: { id: order1.id },
        });

        recordTest(
            'Order status updated to CONFIRMED',
            dbOrder1.orderStatus === 'CONFIRMED',
            `Expected CONFIRMED, got ${dbOrder1.orderStatus}`
        );

        recordTest(
            'Payment status updated to PAID',
            dbOrder1.paymentStatus === 'PAID',
            `Expected PAID, got ${dbOrder1.paymentStatus}`
        );

        recordTest(
            'Gateway payment ID saved',
            dbOrder1.gatewayPaymentId === 'pay_test_123',
            'Should save gateway payment ID'
        );

        // Check cart cleared
        const cartAfter = await axios.get(`${BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${token1}` },
        });

        recordTest(
            'Cart cleared after payment',
            cartAfter.data.data.items.length === 0,
            'Cart should be empty'
        );

        // ========================================
        // TEST 2: IDEMPOTENCY - DUPLICATE VERIFICATION
        // ========================================
        logSection('TEST 2: IDEMPOTENCY - DUPLICATE VERIFICATION');

        try {
            const verifyAgain = await axios.post(
                `${BASE_URL}/payments/verify`,
                {
                    orderId: order1.id,
                    paymentId: 'pay_test_123',
                    signature: 'valid_signature',
                },
                { headers: { Authorization: `Bearer ${token1}` } }
            );

            recordTest(
                'Duplicate verification returns idempotent response',
                verifyAgain.data.success && verifyAgain.data.alreadyProcessed,
                'Should return success with alreadyProcessed flag'
            );
        } catch (error) {
            recordTest(
                'Duplicate verification returns idempotent response',
                false,
                error.response?.data?.message || error.message
            );
        }

        // ========================================
        // TEST 3: INVALID SIGNATURE
        // ========================================
        logSection('TEST 3: INVALID SIGNATURE');

        const token3 = await login('customer2@gmail.com');
        const order3 = await createOrder(token3);

        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order3.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token3}` } }
        );

        const invalidVerify = await axios.post(
            `${BASE_URL}/payments/verify`,
            {
                orderId: order3.id,
                paymentId: 'pay_test_456',
                signature: 'invalid_signature',
            },
            { headers: { Authorization: `Bearer ${token3}` } }
        );

        recordTest(
            'Invalid signature rejected',
            !invalidVerify.data.success && invalidVerify.data.canRetry,
            'Should return failure with canRetry flag'
        );

        const dbOrder3 = await prisma.order.findUnique({
            where: { id: order3.id },
        });

        recordTest(
            'Payment status set to FAILED',
            dbOrder3.paymentStatus === 'FAILED',
            `Expected FAILED, got ${dbOrder3.paymentStatus}`
        );

        recordTest(
            'Order status remains PENDING (allows retry)',
            dbOrder3.orderStatus === 'PENDING',
            `Expected PENDING, got ${dbOrder3.orderStatus}`
        );

        // ========================================
        // TEST 4: COD FLOW
        // ========================================
        logSection('TEST 4: COD FLOW');

        const token4 = await login('customer3@gmail.com');
        const order4 = await createOrder(token4);

        const codResp = await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order4.id, paymentMethod: 'COD' },
            { headers: { Authorization: `Bearer ${token4}` } }
        );

        recordTest(
            'COD payment initiated',
            codResp.data.success && codResp.data.paymentMethod === 'COD',
            'Should confirm order immediately'
        );

        const dbOrder4 = await prisma.order.findUnique({
            where: { id: order4.id },
        });

        recordTest(
            'COD order status CONFIRMED',
            dbOrder4.orderStatus === 'CONFIRMED',
            `Expected CONFIRMED, got ${dbOrder4.orderStatus}`
        );

        recordTest(
            'COD payment status PENDING',
            dbOrder4.paymentStatus === 'PENDING',
            `Expected PENDING (paid on delivery), got ${dbOrder4.paymentStatus}`
        );

        recordTest(
            'COD payment method set',
            dbOrder4.paymentMethod === 'COD',
            'Should set payment method to COD'
        );

        // ========================================
        // TEST 5: PAYMENT METHOD IMMUTABILITY
        // ========================================
        logSection('TEST 5: PAYMENT METHOD IMMUTABILITY');

        const token5 = await login('customer4@gmail.com');
        const order5 = await createOrder(token5);

        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order5.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token5}` } }
        );

        try {
            await axios.post(
                `${BASE_URL}/payments/initiate`,
                { orderId: order5.id, paymentMethod: 'COD' },
                { headers: { Authorization: `Bearer ${token5}` } }
            );

            recordTest(
                'Payment method switching prevented',
                false,
                'Should throw error when switching payment method'
            );
        } catch (error) {
            recordTest(
                'Payment method switching prevented',
                error.response?.status === 400 &&
                error.response?.data?.message.includes('locked'),
                'Should reject payment method change'
            );
        }

        // ========================================
        // TEST 6: PAYMENT METHOD RE-INITIATION (IDEMPOTENT)
        // ========================================
        logSection('TEST 6: PAYMENT METHOD RE-INITIATION (IDEMPOTENT)');

        const reinitiate = await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order5.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token5}` } }
        );

        recordTest(
            'Re-initiation with same method is idempotent',
            reinitiate.data.success &&
            reinitiate.data.message === 'Payment already initiated',
            'Should return existing gateway order'
        );

        // ========================================
        // TEST 7: ORDER OWNERSHIP VALIDATION
        // ========================================
        logSection('TEST 7: ORDER OWNERSHIP VALIDATION');

        const token7a = await login('customer5@gmail.com');
        const token7b = await login('customer6@gmail.com');
        const order7 = await createOrder(token7a);

        try {
            await axios.post(
                `${BASE_URL}/payments/initiate`,
                { orderId: order7.id, paymentMethod: 'RAZORPAY' },
                { headers: { Authorization: `Bearer ${token7b}` } }
            );

            recordTest(
                'Non-owner cannot initiate payment',
                false,
                'Should throw ForbiddenException'
            );
        } catch (error) {
            recordTest(
                'Non-owner cannot initiate payment',
                error.response?.status === 403,
                'Should return 403 Forbidden'
            );
        }

        // ========================================
        // TEST 8: STOCK DEDUCTION
        // ========================================
        logSection('TEST 8: STOCK DEDUCTION');

        const token8 = await login('customer7@gmail.com');

        // Get product stock before - select active product
        const productsResp = await axios.get(`${BASE_URL}/products?limit=10&isActive=true`, {
            headers: { Authorization: `Bearer ${token8}` },
        });
        const products = productsResp.data.data.data || productsResp.data.data;
        const product8 = products.find(p => p.isActive && p.stock > 10);

        if (!product8) {
            throw new Error('No active products with sufficient stock found');
        }

        const initialStock = product8.stock;

        // Add to cart and create order
        await axios.post(
            `${BASE_URL}/cart/clear`,
            {},
            { headers: { Authorization: `Bearer ${token8}` } }
        );
        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId: product8.id, quantity: 2 },
            { headers: { Authorization: `Bearer ${token8}` } }
        );

        const order8 = await createOrder(token8);

        // Initiate and verify payment
        await axios.post(
            `${BASE_URL}/payments/initiate`,
            { orderId: order8.id, paymentMethod: 'RAZORPAY' },
            { headers: { Authorization: `Bearer ${token8}` } }
        );

        await axios.post(
            `${BASE_URL}/payments/verify`,
            {
                orderId: order8.id,
                paymentId: 'pay_test_stock',
                signature: 'valid_signature',
            },
            { headers: { Authorization: `Bearer ${token8}` } }
        );

        // Check stock after
        const productAfter = await prisma.product.findUnique({
            where: { id: product8.id },
        });

        recordTest(
            'Stock deducted correctly',
            productAfter.stock === initialStock - 2,
            `Expected ${initialStock - 2}, got ${productAfter.stock}`
        );

        recordTest(
            'Stock not negative',
            productAfter.stock >= 0,
            'Stock should never be negative'
        );

        // ========================================
        // FINAL SUMMARY
        // ========================================
        logSection('TEST SUMMARY');

        log(`Total tests: ${results.tests.length}`, colors.reset);
        log(`Passed: ${results.passed}`, colors.green);
        log(`Failed: ${results.failed}`, colors.red);

        if (results.failed > 0) {
            log('\nFailed tests:', colors.red);
            results.tests
                .filter((t) => !t.passed)
                .forEach((t) => {
                    log(`  - ${t.name}: ${t.message}`, colors.red);
                });
        }

        const allPassed = results.failed === 0;
        if (allPassed) {
            log('\n🎉 ALL TESTS PASSED!', colors.green + colors.bright);
        } else {
            log('\n❌ SOME TESTS FAILED', colors.red + colors.bright);
        }

        log('\nTest completed: ' + new Date().toLocaleString(), colors.reset);

        return allPassed;
    } catch (error) {
        log(`\n❌ Test suite failed: ${error.message}`, colors.red);
        console.error(error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

// Run tests
runTests()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
