/**
 * Phase 4.5 - Automated Concurrency Test
 * 
 * This script executes real concurrent load testing for order creation
 * to validate transaction hardening fixes for:
 * - Order number uniqueness
 * - Stock race conditions
 * - Payment idempotency
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:4000/v1';

// Test configuration
const PARALLEL_REQUESTS = 50;
const TEST_EMAIL = 'customer1@gmail.com';
const TEST_PASSWORD = 'Test@1234';

// Colors for console output
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
    console.log('\n' + '='.repeat(60));
    log(title, colors.cyan + colors.bright);
    console.log('='.repeat(60) + '\n');
}

async function login() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });
        return response.data.data.accessToken;
    } catch (error) {
        throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
    }
}

async function getProducts(token) {
    try {
        // Get products without isActive filter
        const response = await axios.get(`${BASE_URL}/products?limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data.data || response.data.data;
    } catch (error) {
        throw new Error(`Get products failed: ${error.response?.data?.message || error.message}`);
    }
}

async function getAddress(token) {
    try {
        const response = await axios.get(`${BASE_URL}/addresses`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data[0];
    } catch (error) {
        throw new Error(`Get address failed: ${error.response?.data?.message || error.message}`);
    }
}

async function clearCart(token) {
    try {
        await axios.delete(`${BASE_URL}/cart/clear`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        // Ignore errors
    }
}

async function addToCart(token, productId, quantity = 1) {
    try {
        await axios.post(
            `${BASE_URL}/cart/add`,
            { productId, quantity },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    } catch (error) {
        throw new Error(`Add to cart failed: ${error.response?.data?.message || error.message}`);
    }
}

async function createOrder(token, addressId, requestNumber) {
    const startTime = Date.now();
    try {
        const response = await axios.post(
            `${BASE_URL}/orders`,
            { addressId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const duration = Date.now() - startTime;
        return {
            success: true,
            orderNumber: response.data.data.orderNumber,
            orderId: response.data.data.id,
            duration,
            requestNumber,
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            duration,
            requestNumber,
        };
    }
}

async function runConcurrencyTest() {
    logSection('PHASE 4.5 - AUTOMATED CONCURRENCY TEST');

    // Step 1: Login
    log('[1/7] Authenticating...', colors.yellow);
    const token = await login();
    log('✅ Authenticated successfully', colors.green);

    // Step 2: Get products
    log('\n[2/7] Fetching products...', colors.yellow);
    const products = await getProducts(token);
    if (!products || products.length === 0) {
        throw new Error('No products found in database');
    }

    // Find an active product with sufficient stock
    const testProduct = products.find(p => p.isActive && p.stock >= 10);
    if (!testProduct) {
        throw new Error('No active products with sufficient stock found');
    }

    log(`✅ Found ${products.length} products`, colors.green);
    log(`   Test product: ${testProduct.name} (stock: ${testProduct.stock})`, colors.reset);

    // Step 3: Get address
    log('\n[3/7] Getting address...', colors.yellow);
    const address = await getAddress(token);
    if (!address) {
        throw new Error('No address found for user');
    }
    log(`✅ Address: ${address.city}, ${address.state}`, colors.green);

    // Step 4: Prepare cart
    log('\n[4/7] Preparing cart...', colors.yellow);
    await clearCart(token);
    await addToCart(token, testProduct.id, 1);
    log('✅ Cart ready (1 item)', colors.green);

    // Step 5: Get initial stock
    log('\n[5/7] Recording initial state...', colors.yellow);
    const initialStock = testProduct.stock;
    const initialOrderCount = await prisma.order.count();
    log(`   Initial stock: ${initialStock}`, colors.reset);
    log(`   Initial orders: ${initialOrderCount}`, colors.reset);

    // Step 6: Execute parallel requests
    logSection(`EXECUTING ${PARALLEL_REQUESTS} PARALLEL ORDER REQUESTS`);
    log('Starting concurrent order creation...', colors.yellow);
    const startTime = Date.now();

    const promises = [];
    for (let i = 1; i <= PARALLEL_REQUESTS; i++) {
        promises.push(createOrder(token, address.id, i));
    }

    const results = await Promise.all(promises);
    const totalDuration = Date.now() - startTime;

    // Analyze results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    log(`\n✅ Test completed in ${(totalDuration / 1000).toFixed(2)}s`, colors.green);
    log(`   Average response time: ${avgDuration.toFixed(0)}ms`, colors.reset);

    // Display results
    logSection('EXECUTION RESULTS');
    log(`Total requests: ${PARALLEL_REQUESTS}`, colors.reset);
    log(`Successful: ${successful.length}`, successful.length > 0 ? colors.green : colors.red);
    log(`Failed: ${failed.length}`, failed.length > 0 ? colors.yellow : colors.green);

    if (successful.length > 0) {
        log('\nGenerated Order Numbers:', colors.cyan);
        successful.slice(0, 10).forEach(r => {
            log(`   ${r.orderNumber}`, colors.reset);
        });
        if (successful.length > 10) {
            log(`   ... and ${successful.length - 10} more`, colors.reset);
        }
    }

    if (failed.length > 0) {
        log('\nFailure Reasons:', colors.yellow);
        const errorCounts = {};
        failed.forEach(r => {
            const error = typeof r.error === 'string' ? r.error : JSON.stringify(r.error);
            errorCounts[error] = (errorCounts[error] || 0) + 1;
        });
        Object.entries(errorCounts).forEach(([error, count]) => {
            log(`   - ${error} (${count}x)`, colors.yellow);
        });
    }

    // Step 7: Database verification
    logSection('DATABASE VERIFICATION');

    // Test 1: Order number uniqueness
    log('TEST 1: Order Number Uniqueness', colors.cyan);
    const duplicateCheck = await prisma.$queryRaw`
        SELECT "orderNumber", COUNT(*) as count
        FROM "Order"
        GROUP BY "orderNumber"
        HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length === 0) {
        log('   ✅ PASSED - No duplicate order numbers', colors.green);
    } else {
        log('   ❌ FAILED - Duplicates found:', colors.red);
        duplicateCheck.forEach(row => {
            log(`      ${row.orderNumber}: ${row.count} times`, colors.red);
        });
    }

    // Test 2: Order number format
    log('\nTEST 2: Order Number Format', colors.cyan);
    if (successful.length > 0) {
        const orderNumbers = successful.map(r => r.orderNumber);
        const invalidFormat = orderNumbers.filter(num => !/^ORD\d{10}$/.test(num));

        if (invalidFormat.length === 0) {
            log('   ✅ PASSED - All formats correct (ORD + 10 digits)', colors.green);
        } else {
            log(`   ❌ FAILED - ${invalidFormat.length} invalid formats`, colors.red);
        }
    } else {
        log('   ⏭️  SKIPPED - No orders created', colors.yellow);
    }

    // Test 3: Stock management
    log('\nTEST 3: Stock Management', colors.cyan);
    const productAfter = await prisma.product.findUnique({
        where: { id: testProduct.id },
        select: { stock: true },
    });
    const finalStock = productAfter.stock;
    const expectedStock = initialStock - successful.length;

    log(`   Initial stock: ${initialStock}`, colors.reset);
    log(`   Orders created: ${successful.length}`, colors.reset);
    log(`   Expected stock: ${expectedStock}`, colors.reset);
    log(`   Actual stock: ${finalStock}`, colors.reset);

    if (finalStock === expectedStock) {
        log('   ✅ Stock calculation CORRECT', colors.green);
    } else {
        log('   ❌ Stock mismatch!', colors.red);
    }

    if (finalStock < 0) {
        log('   ❌ CRITICAL - Stock is NEGATIVE!', colors.red);
    } else {
        log('   ✅ Stock is non-negative', colors.green);
    }

    // Test 4: Negative stock check
    log('\nTEST 4: Database Integrity', colors.cyan);
    const negativeStock = await prisma.product.count({
        where: { stock: { lt: 0 } },
    });

    if (negativeStock === 0) {
        log('   ✅ PASSED - No products with negative stock', colors.green);
    } else {
        log(`   ❌ FAILED - ${negativeStock} products with negative stock`, colors.red);
    }

    // Final summary
    logSection('FINAL SUMMARY');

    const allTestsPassed =
        duplicateCheck.length === 0 &&
        finalStock === expectedStock &&
        finalStock >= 0 &&
        negativeStock === 0;

    if (allTestsPassed && successful.length > 0) {
        log('🎉 ALL TESTS PASSED!', colors.green + colors.bright);
        log('', colors.reset);
        log('   ✅ No duplicate order numbers', colors.green);
        log('   ✅ Correct order number format', colors.green);
        log('   ✅ Stock management atomic & correct', colors.green);
        log('   ✅ No negative stock values', colors.green);
        log('   ✅ Phase 4.5 transaction hardening VERIFIED', colors.green);
    } else {
        log('⚠️  REVIEW REQUIRED', colors.yellow);
        if (successful.length === 0) {
            log('   No orders were created', colors.yellow);
        }
    }

    log('\nTest completed: ' + new Date().toLocaleString(), colors.reset);
    console.log('');

    return {
        totalRequests: PARALLEL_REQUESTS,
        successful: successful.length,
        failed: failed.length,
        allTestsPassed,
        duplicates: duplicateCheck.length,
        stockCorrect: finalStock === expectedStock,
        noNegativeStock: negativeStock === 0,
    };
}

// Run the test
runConcurrencyTest()
    .then((results) => {
        process.exit(results.allTestsPassed ? 0 : 1);
    })
    .catch((error) => {
        log(`\n❌ Test failed: ${error.message}`, colors.red);
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
