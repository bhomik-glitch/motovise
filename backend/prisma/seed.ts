import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting simplified database seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.orderSequence.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.address.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleared\n');

    const hashedPassword = await bcrypt.hash('Test@1234', 10);

    // 1. Create Users
    console.log('👥 Creating users...');
    const admin = await prisma.user.create({
        data: {
            email: 'admin@ecommerce.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
            phone: '+1-555-0001',
            emailVerified: true,
        },
    });

    const customers = [];
    for (let i = 1; i <= 20; i++) {
        const customer = await prisma.user.create({
            data: {
                email: `customer${i}@gmail.com`,
                password: hashedPassword,
                name: `Customer ${i}`,
                role: 'CUSTOMER',
                phone: `+1-555-${String(100 + i).padStart(4, '0')}`,
                emailVerified: true,
            },
        });
        customers.push(customer);
    }
    console.log(`✅ Created ${customers.length + 1} users\n`);

    // 2. Create Categories
    console.log('📦 Creating categories...');
    const categories = [];
    const categoryNames = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
    for (const name of categoryNames) {
        const category = await prisma.category.create({
            data: {
                name,
                description: `${name} products`,
                slug: name.toLowerCase().replace(/\s+/g, '-'),
            },
        });
        categories.push(category);
    }
    console.log(`✅ Created ${categories.length} categories\n`);

    // 3. Create Products
    console.log('🛍️  Creating products...');
    const products = [];

    // 5 low stock (5-10)
    for (let i = 0; i < 5; i++) {
        const product = await prisma.product.create({
            data: {
                name: `Low Stock Product ${i + 1}`,
                description: 'Test product',
                price: 50 + i * 10,
                stock: 5 + i,
                categoryId: categories[i % 5].id,
                slug: `low-stock-${i + 1}`,
                images: ['https://via.placeholder.com/300'],
                isActive: true,
            },
        });
        products.push(product);
    }

    // 10 medium stock (20-50)
    for (let i = 0; i < 10; i++) {
        const product = await prisma.product.create({
            data: {
                name: `Medium Stock Product ${i + 1}`,
                description: 'Test product',
                price: 30 + i * 5,
                stock: 20 + i * 3,
                categoryId: categories[i % 5].id,
                slug: `medium-stock-${i + 1}`,
                images: ['https://via.placeholder.com/300'],
                isActive: true,
            },
        });
        products.push(product);
    }

    // 10 high stock (100+)
    for (let i = 0; i < 10; i++) {
        const product = await prisma.product.create({
            data: {
                name: `High Stock Product ${i + 1}`,
                description: 'Test product',
                price: 15 + i * 2,
                stock: 100 + i * 50,
                categoryId: categories[i % 5].id,
                slug: `high-stock-${i + 1}`,
                images: ['https://via.placeholder.com/300'],
                isActive: true,
            },
        });
        products.push(product);
    }

    // 5 inactive
    for (let i = 0; i < 5; i++) {
        const product = await prisma.product.create({
            data: {
                name: `Inactive Product ${i + 1}`,
                description: 'Test product',
                price: 25,
                stock: 50,
                categoryId: categories[i % 5].id,
                slug: `inactive-${i + 1}`,
                images: ['https://via.placeholder.com/300'],
                isActive: false,
            },
        });
        products.push(product);
    }

    console.log(`✅ Created ${products.length} products\n`);

    // 4. Create Addresses
    console.log('📍 Creating addresses...');
    const addresses = [];
    for (let i = 0; i < 15; i++) {
        const customer = customers[i];
        const address = await prisma.address.create({
            data: {
                userId: customer.id,
                fullName: customer.name,
                phone: customer.phone || '+1-555-9999',
                addressLine1: `${100 + i} Main St`,
                city: 'New York',
                state: 'NY',
                postalCode: `${10000 + i}`,
                country: 'USA',
                isDefault: true,
            },
        });
        addresses.push(address);
    }
    console.log(`✅ Created ${addresses.length} addresses\n`);

    // 5. Create Carts
    console.log('🛒 Creating carts...');
    for (let i = 0; i < 10; i++) {
        const customer = customers[i];
        const cart = await prisma.cart.create({
            data: { userId: customer.id },
        });

        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: products[i % 25].id,
                quantity: 2,
            },
        });
    }
    console.log(`✅ Created 10 carts\n`);

    // Print Summary
    console.log('========================================');
    console.log('📊 DATABASE SEED SUMMARY');
    console.log('========================================\n');

    const counts = {
        users: await prisma.user.count(),
        categories: await prisma.category.count(),
        products: await prisma.product.count(),
        addresses: await prisma.address.count(),
        carts: await prisma.cart.count(),
        cartItems: await prisma.cartItem.count(),
    };

    console.log(`👥 Users: ${counts.users}`);
    console.log(`📦 Categories: ${counts.categories}`);
    console.log(`🛍️  Products: ${counts.products} (25 active, 5 inactive)`);
    console.log(`📍 Addresses: ${counts.addresses}`);
    console.log(`🛒 Carts: ${counts.carts} (${counts.cartItems} items)`);

    console.log('\n========================================');
    console.log('✅ Database seeding completed!');
    console.log('========================================\n');

    console.log('🔑 Test Credentials:');
    console.log('   Admin: admin@ecommerce.com / Test@1234');
    console.log('   Customer: customer1@gmail.com / Test@1234');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
