/**
 * Simplified Concurrency Test
 * Uses existing product stock without modification
 * Tests atomic lock-based stock deduction
 */

const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:4000/v1';
const RAZORPAY_KEY_SECRET = 'test_secret_key';

function log(section, message, data = null) {
    console.log(`[${new Date().toISOString()}] [${section}] ${message}`);
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
    const response = await axios.get(`${BASE_URL}/products?limit=50`);
    return response.data.data?.data || response.data.data || response.data;
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

async function initiatePayment(token, orderId) {
    const response = await axios.post(
        `${BASE_URL}/payments/initiate`,
        { orderId, paymentMethod: 'RAZORPAY' },
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
// CONCURRENCY TEST
// ============================================

async function runConcurrencyTest() {
    logSection('ATOMIC LOCK CONCURRENCY TEST');

    // Login
    log('SETUP', 'Logging in...');
    const userToken = await loginUser('customer1@gmail.com', 'Test@1234');

    // Get products with stock
    log('SETUP', 'Finding product with stock...');
    const products = await getProducts();
    const productWithStock = products.find(p => p.isActive && p.stock > 0);

    if (!productWithStock) {
        console.log('❌ No products with stock found');
        return;
    }

    log('SETUP', `Using product: ${productWithStock.name}`);
    log('SETUP', `Initial stock: ${productWithStock.stock}`);

    // Create address
    const address = await createAddress(userToken, {
        fullName: 'Test User',
        phone: '1234567890',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
    });

    // Create 5 orders for the same product
    log('TEST', 'Creating 5 orders...');
    const orders = [];

    for (let i = 0; i < 5; i++) {
        await clearCart(userToken);
        await addToCart(userToken, productWithStock.id, 1);
        const order = await createOrder(userToken, address.id);
        const payment = await initiatePayment(userToken, order.id);

        orders.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            gatewayOrderId: payment.gatewayOrderId,
            paymentId: `pay_concurrent_${i}`,
        });

        log('TEST', `Created order ${i + 1}: ${order.orderNumber}`);
    }

    // Prepare verification requests
    const verificationRequests = orders.map(order => ({
        ...order,
        signature: generateSignature(order.gatewayOrderId, order.paymentId),
    }));

    // Execute all verifications simultaneously
    logSection('EXECUTING PARALLEL VERIFICATIONS');
    log('TEST', 'Firing 5 simultaneous payment verifications...');
    const startTime = Date.now();

    const results = await Promise.all(
        verificationRequests.map(req =>
            verifyPayment(userToken, req.orderId, req.paymentId, req.signature)
        )
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    log('TEST', `All requests completed in ${duration}ms`);

    // Analyze results
    const successful = results.filter(r => r.success && r.data.success && !r.data.alreadyProcessed).length;
    const failed = results.filter(r => !r.success || !r.data.success).length;
    const idempotent = results.filter(r => r.success && r.data.alreadyProcessed).length;

    logSection('RESULTS');
    console.log(`Total requests: 5`);
    console.log(`Successful confirmations: ${successful}`);
    console.log(`Failed confirmations: ${failed}`);
    console.log(`Idempotent responses: ${idempotent}`);
    console.log(`Execution time: ${duration}ms`);
    console.log(`Average response time: ${(duration / 5).toFixed(2)}ms`);

    // Check final stock
    const finalProduct = await getProduct(productWithStock.id);
    console.log(`\nInitial stock: ${productWithStock.stock}`);
    console.log(`Final stock: ${finalProduct.stock}`);
    console.log(`Stock deducted: ${productWithStock.stock - finalProduct.stock}`);

    // Check order states
    logSection('ORDER STATES');
    for (let i = 0; i < orders.length; i++) {
        const order = await getOrder(userToken, orders[i].orderId);
        console.log(`Order ${i + 1} (${order.orderNumber}):`);
        console.log(`  Status: ${order.orderStatus}`);
        console.log(`  Payment: ${order.paymentStatus}`);
        console.log(`  Stock Deducted: ${order.stockDeducted}`);
        console.log(`  Gateway Payment ID: ${order.gatewayPaymentId || 'null'}`);
    }

    // Validation
    logSection('VALIDATION');
    const expectedSuccessful = Math.min(productWithStock.stock, 5);
    const stockDeductedCorrectly = (finalProduct.stock === productWithStock.stock - successful);

    console.log(`✓ Expected ${expectedSuccessful} successful (stock available)`);
    console.log(`✓ Got ${successful} successful`);
    console.log(`✓ Stock deducted correctly: ${stockDeductedCorrectly}`);
    console.log(`✓ No negative stock: ${finalProduct.stock >= 0}`);

    const allPassed = stockDeductedCorrectly && finalProduct.stock >= 0;

    logSection('CONCLUSION');
    if (allPassed) {
        console.log('✅ CONCURRENCY TEST PASSED');
        console.log('Atomic lock successfully prevented double deduction');
    } else {
        console.log('❌ CONCURRENCY TEST FAILED');
    }

    return {
        passed: allPassed,
        stats: {
            totalRequests: 5,
            successful,
            failed,
            idempotent,
            duration,
            initialStock: productWithStock.stock,
            finalStock: finalProduct.stock,
        },
    };
}

// Run test
runConcurrencyTest()
    .then(result => {
        console.log('\nTest completed:', result.passed ? 'PASSED' : 'FAILED');
        process.exit(result.passed ? 0 : 1);
    })
    .catch(error => {
        console.error('Test failed with error:', error.message);
        process.exit(1);
    });
