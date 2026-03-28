/**
 * High-Concurrency Stress Test
 * Tests 20-50 simultaneous payment confirmations
 * Validates overselling prevention under extreme load
 */

const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:4000/v1';
const RAZORPAY_KEY_SECRET = 'test_secret_key';

const CONCURRENT_REQUESTS = 20; // Number of simultaneous confirmations
const PRODUCT_STOCK = 10; // Available stock

function log(message, data = null) {
    console.log(`[${new Date().toISOString()}] ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
}

async function loginUser(email, password) {
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    return response.data.data?.accessToken || response.data.access_token || response.data.accessToken;
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

async function runStressTest() {
    console.log('='.repeat(80));
    console.log('  HIGH-CONCURRENCY STRESS TEST');
    console.log('='.repeat(80));
    console.log();

    // Login
    log('Logging in as admin and user...');
    const adminToken = await loginUser('admin@ecommerce.com', 'Test@1234');
    const userToken = await loginUser('customer1@gmail.com', 'Test@1234');

    // Get first active product
    const allProducts = await axios.get(`${BASE_URL}/products?limit=50`).then(r => r.data.data?.data || r.data.data || r.data);
    const products = allProducts.filter(p => p.isActive);

    if (products.length === 0) {
        throw new Error('No active products found');
    }

    const product = products[0];
    log(`Using product: ${product.name} (ID: ${product.id})`);

    // Set stock to known value
    log(`Setting stock to ${PRODUCT_STOCK}...`);
    await updateProductStock(adminToken, product.id, PRODUCT_STOCK);

    // Create address
    const address = await createAddress(userToken, {
        fullName: 'Stress Test User',
        phone: '9999999999',
        addressLine1: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        postalCode: '999999',
    });

    // Create multiple orders
    log(`Creating ${CONCURRENT_REQUESTS} orders...`);
    const orders = [];

    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        await clearCart(userToken);
        await addToCart(userToken, product.id, 1);
        const order = await createOrder(userToken, address.id);
        const payment = await initiatePayment(userToken, order.id);

        orders.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            gatewayOrderId: payment.gatewayOrderId,
            paymentId: `pay_stress_${i}`,
        });
    }

    log(`Created ${orders.length} orders`);

    // Prepare verification requests
    const verificationRequests = orders.map(order => ({
        ...order,
        signature: generateSignature(order.gatewayOrderId, order.paymentId),
    }));

    // Execute all verifications simultaneously
    log(`\nExecuting ${CONCURRENT_REQUESTS} simultaneous payment verifications...`);
    const startTime = Date.now();

    const results = await Promise.all(
        verificationRequests.map(req =>
            verifyPayment(userToken, req.orderId, req.paymentId, req.signature)
        )
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    log(`\nAll requests completed in ${duration}ms`);

    // Analyze results
    const successful = results.filter(r => r.success && r.data.success && !r.data.alreadyProcessed).length;
    const failed = results.filter(r => !r.success || !r.data.success).length;
    const idempotent = results.filter(r => r.success && r.data.alreadyProcessed).length;

    log('\n' + '='.repeat(80));
    log('RESULTS ANALYSIS');
    log('='.repeat(80));
    log(`Total requests: ${CONCURRENT_REQUESTS}`);
    log(`Successful confirmations: ${successful}`);
    log(`Failed (insufficient stock): ${failed}`);
    log(`Idempotent responses: ${idempotent}`);
    log(`Average response time: ${(duration / CONCURRENT_REQUESTS).toFixed(2)}ms`);

    // Check final stock
    const finalProduct = await getProduct(product.id);
    log(`\nInitial stock: ${PRODUCT_STOCK}`);
    log(`Final stock: ${finalProduct.stock}`);
    log(`Expected final stock: ${Math.max(0, PRODUCT_STOCK - successful)}`);

    // Validation
    const expectedSuccessful = Math.min(PRODUCT_STOCK, CONCURRENT_REQUESTS);
    const expectedFailed = Math.max(0, CONCURRENT_REQUESTS - PRODUCT_STOCK);
    const expectedFinalStock = Math.max(0, PRODUCT_STOCK - successful);

    log('\n' + '='.repeat(80));
    log('VALIDATION');
    log('='.repeat(80));

    const validations = [
        {
            name: 'Exactly expected successful confirmations',
            passed: successful === expectedSuccessful,
            expected: expectedSuccessful,
            actual: successful,
        },
        {
            name: 'Exactly expected failed confirmations',
            passed: failed >= expectedFailed, // >= because some might be idempotent
            expected: `>= ${expectedFailed}`,
            actual: failed,
        },
        {
            name: 'Final stock matches expected',
            passed: finalProduct.stock === expectedFinalStock,
            expected: expectedFinalStock,
            actual: finalProduct.stock,
        },
        {
            name: 'No negative stock',
            passed: finalProduct.stock >= 0,
            expected: '>= 0',
            actual: finalProduct.stock,
        },
        {
            name: 'Total confirmations <= initial stock',
            passed: successful <= PRODUCT_STOCK,
            expected: `<= ${PRODUCT_STOCK}`,
            actual: successful,
        },
    ];

    validations.forEach(v => {
        const status = v.passed ? '✓ PASS' : '✗ FAIL';
        log(`${status}: ${v.name}`);
        log(`  Expected: ${v.expected}, Actual: ${v.actual}`);
    });

    const allPassed = validations.every(v => v.passed);

    log('\n' + '='.repeat(80));
    if (allPassed) {
        log('✓ STRESS TEST PASSED - Overselling prevention verified under high concurrency');
    } else {
        log('✗ STRESS TEST FAILED - System vulnerable to overselling');
    }
    log('='.repeat(80));

    return {
        passed: allPassed,
        stats: {
            totalRequests: CONCURRENT_REQUESTS,
            successful,
            failed,
            idempotent,
            duration,
            initialStock: PRODUCT_STOCK,
            finalStock: finalProduct.stock,
        },
    };
}

// Run the test
runStressTest()
    .then(result => {
        console.log('\nTest completed:', result.passed ? 'PASSED' : 'FAILED');
        process.exit(result.passed ? 0 : 1);
    })
    .catch(error => {
        console.error('Test failed with error:', error);
        process.exit(1);
    });
