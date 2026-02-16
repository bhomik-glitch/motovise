/**
 * Phase 4.5 - TRUE Multi-User Race Condition Test
 * 
 * This test validates the CRITICAL stock race condition scenario:
 * - 20 different users
 * - 1 product with stock = 10
 * - All users attempt to purchase simultaneously
 * - Expected: 10 succeed, 10 fail, stock = 0 (never negative)
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

async function getAddress(token) {
    const response = await axios.get(`${BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data[0];
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

async function addToCart(token, productId) {
    await axios.post(
        `${BASE_URL}/cart/add`,
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
    );
}

async function createOrder(token, addressId, userEmail) {
    const startTime = Date.now();
    try {
        const response = await axios.post(
            `${BASE_URL}/orders`,
            { addressId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return {
            success: true,
            user: userEmail,
            orderNumber: response.data.data.orderNumber,
            orderId: response.data.data.id,
            duration: Date.now() - startTime,
        };
    } catch (error) {
        return {
            success: false,
            user: userEmail,
            error: error.response?.data?.message || error.message,
            duration: Date.now() - startTime,
        };
    }
}

async function runMultiUserRaceTest() {
    logSection('PHASE 4.5 - TRUE MULTI-USER RACE CONDITION TEST');

    // Step 1: Find product with low stock
    log('[1/5] Finding product with low stock...', colors.yellow);
    const adminToken = await login('admin@ecommerce.com');
    const productsResp = await axios.get(`${BASE_URL}/products?limit=100`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const products = productsResp.data.data.data || productsResp.data.data;

    // Find a low-stock product (5-10 units)
    let testProduct = products.find(p => p.isActive && p.stock >= 5 && p.stock <= 10);

    if (!testProduct) {
        // If no low-stock product, update one
        testProduct = products.find(p => p.isActive);
        log(`   Updating product stock to 10...`, colors.yellow);
        await axios.patch(
            `${BASE_URL}/products/${testProduct.id}`,
            { stock: 10 },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        testProduct.stock = 10;
    }

    const initialStock = testProduct.stock;
    log(`✅ Test product: ${testProduct.name}`, colors.green);
    log(`   Initial stock: ${initialStock}`, colors.reset);

    // Step 2: Prepare 20 users
    log('\n[2/5] Preparing 20 customer accounts...', colors.yellow);
    const NUM_USERS = 20;
    const userContexts = [];

    for (let i = 1; i <= NUM_USERS; i++) {
        const email = `customer${i}@gmail.com`;
        try {
            const token = await login(email);
            const address = await getAddress(token);

            if (!address) {
                log(`   ⚠️  Customer ${i} has no address, skipping`, colors.yellow);
                continue;
            }

            // Prepare cart for each user
            await clearCart(token);
            await addToCart(token, testProduct.id);

            userContexts.push({
                email,
                token,
                addressId: address.id,
            });
        } catch (error) {
            log(`   ⚠️  Customer ${i} failed: ${error.message}`, colors.yellow);
        }
    }

    log(`✅ Prepared ${userContexts.length} users with carts ready`, colors.green);

    if (userContexts.length < 8) {
        throw new Error('Not enough users prepared for meaningful test');
    }

    // Step 3: Record initial state
    log('\n[3/5] Recording initial database state...', colors.yellow);
    const initialOrderCount = await prisma.order.count();
    log(`   Orders in DB: ${initialOrderCount}`, colors.reset);
    log(`   Product stock: ${initialStock}`, colors.reset);

    // Step 4: Execute concurrent orders
    logSection(`EXECUTING ${userContexts.length} CONCURRENT ORDER REQUESTS`);
    log('🔥 FIRING PARALLEL REQUESTS FROM DIFFERENT USERS...', colors.yellow);
    log(`   Each user has product in cart`, colors.reset);
    log(`   All requests fire simultaneously`, colors.reset);
    log(`   Product stock: ${initialStock} units`, colors.reset);
    log(`   Expected: ${initialStock} succeed, ${userContexts.length - initialStock} fail\n`, colors.reset);

    const startTime = Date.now();

    // CRITICAL: All users fire order requests concurrently
    const promises = userContexts.map(ctx =>
        createOrder(ctx.token, ctx.addressId, ctx.email)
    );

    const results = await Promise.all(promises);
    const totalDuration = Date.now() - startTime;

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    log(`\n✅ Test completed in ${(totalDuration / 1000).toFixed(2)}s`, colors.green);

    // Step 5: Analyze results
    logSection('EXECUTION RESULTS');
    log(`Total users: ${userContexts.length}`, colors.reset);
    log(`Successful orders: ${successful.length}`, successful.length > 0 ? colors.green : colors.red);
    log(`Failed orders: ${failed.length}`, failed.length > 0 ? colors.yellow : colors.green);

    if (successful.length > 0) {
        log('\nSuccessful Orders:', colors.green);
        successful.slice(0, 10).forEach(r => {
            log(`   ${r.user}: ${r.orderNumber}`, colors.reset);
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

    // Database verification
    logSection('DATABASE VERIFICATION');

    // Test 1: Duplicate check
    log('TEST 1: Order Number Uniqueness', colors.cyan);
    const duplicates = await prisma.$queryRaw`
        SELECT "orderNumber", COUNT(*) as count
        FROM "Order"
        GROUP BY "orderNumber"
        HAVING COUNT(*) > 1
    `;

    if (duplicates.length === 0) {
        log('   ✅ PASSED - No duplicates', colors.green);
    } else {
        log('   ❌ FAILED - Duplicates found!', colors.red);
        duplicates.forEach(d => log(`      ${d.orderNumber}: ${d.count}x`, colors.red));
    }

    // Test 2: Stock verification
    log('\nTEST 2: Stock Race Condition', colors.cyan);
    const productAfter = await prisma.product.findUnique({
        where: { id: testProduct.id },
        select: { stock: true },
    });
    const finalStock = productAfter.stock;
    const expectedStock = Math.max(0, initialStock - successful.length);

    log(`   Initial stock: ${initialStock}`, colors.reset);
    log(`   Successful orders: ${successful.length}`, colors.reset);
    log(`   Expected final stock: ${expectedStock}`, colors.reset);
    log(`   Actual final stock: ${finalStock}`, colors.reset);

    const stockTest = finalStock === expectedStock && finalStock >= 0;
    if (stockTest) {
        log('   ✅ PASSED - Stock correct and non-negative', colors.green);
    } else {
        log('   ❌ FAILED - Stock mismatch or negative!', colors.red);
    }

    // Test 3: Overselling check
    log('\nTEST 3: Overselling Prevention', colors.cyan);
    const expectedSuccess = Math.min(initialStock, userContexts.length);
    const expectedFailures = Math.max(0, userContexts.length - initialStock);

    log(`   Expected successes: ${expectedSuccess}`, colors.reset);
    log(`   Actual successes: ${successful.length}`, colors.reset);
    log(`   Expected failures: ${expectedFailures}`, colors.reset);
    log(`   Actual failures: ${failed.length}`, colors.reset);

    const oversellingTest = successful.length <= initialStock;
    if (oversellingTest) {
        log('   ✅ PASSED - No overselling occurred', colors.green);
    } else {
        log('   ❌ FAILED - OVERSELLING DETECTED!', colors.red);
    }

    // Test 4: Negative stock check
    log('\nTEST 4: Negative Stock Check', colors.cyan);
    const negativeStock = await prisma.product.count({
        where: { stock: { lt: 0 } },
    });

    if (negativeStock === 0) {
        log('   ✅ PASSED - No negative stock', colors.green);
    } else {
        log(`   ❌ FAILED - ${negativeStock} products with negative stock!`, colors.red);
    }

    // Final summary
    logSection('FINAL SUMMARY');

    const allTestsPassed =
        duplicates.length === 0 &&
        stockTest &&
        oversellingTest &&
        negativeStock === 0;

    if (allTestsPassed) {
        log('🎉 ALL MULTI-USER RACE TESTS PASSED!', colors.green + colors.bright);
        log('', colors.reset);
        log('   ✅ No duplicate order numbers', colors.green);
        log('   ✅ Stock management correct', colors.green);
        log('   ✅ No overselling', colors.green);
        log('   ✅ No negative stock', colors.green);
        log('   ✅ Multi-user race condition VALIDATED', colors.green);
    } else {
        log('❌ TESTS FAILED', colors.red);
    }

    log('\nTest completed: ' + new Date().toLocaleString(), colors.reset);
    console.log('');

    return {
        totalUsers: userContexts.length,
        successful: successful.length,
        failed: failed.length,
        initialStock,
        finalStock,
        allTestsPassed,
    };
}

// Run the test
runMultiUserRaceTest()
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
