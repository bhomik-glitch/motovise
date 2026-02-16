/**
 * Test Product Update Endpoint
 * Verifies admin can update product stock
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000/v1';

async function testProductUpdate() {
    try {
        console.log('='.repeat(60));
        console.log('  PRODUCT UPDATE ENDPOINT TEST');
        console.log('='.repeat(60));
        console.log();

        // Login as admin
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@ecommerce.com',
            password: 'Test@1234',
        });

        const token = loginResponse.data.data?.accessToken ||
            loginResponse.data.access_token ||
            loginResponse.data.accessToken;

        console.log('✓ Admin logged in successfully');
        console.log();

        // Get first active product
        console.log('2. Fetching products...');
        const productsResponse = await axios.get(`${BASE_URL}/products?limit=10`);
        const products = productsResponse.data.data?.data || productsResponse.data.data || productsResponse.data;
        const product = products.find(p => p.isActive);

        if (!product) {
            console.log('✗ No active products found');
            return;
        }

        console.log(`✓ Found product: ${product.name}`);
        console.log(`  Current stock: ${product.stock}`);
        console.log();

        // Update stock
        const newStock = product.stock + 10;
        console.log(`3. Updating stock to ${newStock}...`);

        const updateResponse = await axios.patch(
            `${BASE_URL}/products/${product.id}`,
            { stock: newStock },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('✓ Product updated successfully');
        console.log(`  New stock: ${updateResponse.data.data?.stock || updateResponse.data.stock}`);
        console.log();

        console.log('='.repeat(60));
        console.log('✅ PRODUCT UPDATE TEST PASSED');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('='.repeat(60));
        console.error('❌ PRODUCT UPDATE TEST FAILED');
        console.error('='.repeat(60));
        console.error();
        console.error('Error:', error.response?.data || error.message);
        console.error();

        if (error.response?.status === 500) {
            console.error('Server returned 500 error.');
            console.error('Possible causes:');
            console.error('  1. RolesGuard still using user.id instead of user.sub');
            console.error('  2. Prisma client not regenerated');
            console.error('  3. Database connection issue');
        }

        process.exit(1);
    }
}

testProductUpdate();
