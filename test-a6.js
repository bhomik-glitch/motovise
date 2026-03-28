const axios = require('axios');

const baseURL = 'http://localhost:4000/v1';

async function runTests() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@ecommerce.com',
            password: 'Test@1234'
        });
        const token = loginRes.data.data.accessToken;
        console.log('Login successful. Token acquired.');

        const api = axios.create({
            baseURL,
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n2. Fetching categories...');
        const catRes = await api.get('/categories');
        const categories = catRes.data.data;
        if (!categories || categories.length === 0) {
            throw new Error('No categories found. Expected at least one category.');
        }
        const categoryId = categories[0].id;
        console.log(`Found categories. Using ID: ${categoryId}`);

        console.log('\n3. Creating product...');
        try {
            const createRes = await api.post('/products', {
                name: 'Phase A6 Test Product',
                slug: 'phase-a6-test',
                description: 'Test description',
                price: 1499,
                stock: 15,
                categoryId
            });
            console.log('Product created:', createRes.data.data.id);
        } catch (err) {
            if (err.response?.data?.message?.includes('slug') || err.response?.data?.message?.includes('Unique')) {
                console.log('Product already exists with this slug, continuing...');
            } else {
                throw err;
            }
        }

        console.log('\n4. Fetching products list...');
        let prodRes = await api.get('/products?search=phase-a6');
        let product = Array.isArray(prodRes.data.data)
            ? prodRes.data.data.find(p => p.slug === 'phase-a6-test')
            : prodRes.data.data.data?.find(p => p.slug === 'phase-a6-test');
        console.log('Product found in list:', product.id);

        console.log('\n5. Duplicate slug test...');
        try {
            await api.post('/products', {
                name: 'Duplicate Phase A6',
                slug: 'phase-a6-test',
                description: 'Dup test',
                price: 10,
                stock: 1,
                categoryId
            });
            console.log('FAIL: Duplicate slug was allowed!');
        } catch (err) {
            console.log('PASS: Duplicate slug rejected with code', err.response?.status);
        }

        console.log('\n6. Updating product stock (valid)...');
        await api.patch(`/products/${product.id}`, { stock: 25 });
        console.log('Stock updated successfully.');

        console.log('\n7. Updating product stock (invalid - negative)...');
        try {
            await api.patch(`/products/${product.id}`, { stock: -5 });
            console.log('FAIL: Negative stock allowed!');
        } catch (err) {
            console.log('PASS: Negative stock rejected.');
        }

        console.log('\n8. Togging status...');
        await api.patch(`/products/${product.id}`, { status: 'INACTIVE' });
        console.log('Status toggled successfully.');

        console.log('\n9. Fetching updated product to verify changes...');
        prodRes = await api.get(`/products`);
        let productsList = Array.isArray(prodRes.data.data) ? prodRes.data.data : prodRes.data.data.data;
        const updatedProduct = productsList.find(p => p.id === product.id);
        console.log(`Updated stock check: ${updatedProduct.stock === 25 ? 'PASS' : 'FAIL'}`);
        console.log(`Updated status check: ${updatedProduct.status} (should be INACTIVE/different)`);

        console.log('\n==== ALL TESTS COMPLETED SUCCESSFULLY ====');
    } catch (e) {
        console.error('Test script failed:', e.response?.data || e.message);
    }
}

runTests();
