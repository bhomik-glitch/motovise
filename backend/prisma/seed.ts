
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLES = [
    'Admin',
    'Manager',
    'Product Manager',
    'Inventory Manager',
    'Support',
    'Finance',
    'Analyst',
    'Developer',
    'Customer',
];

const PERMISSIONS = [
    'product.create',
    'product.update',
    'product.delete',
    'price.change.request',
    'price.change.approve.manager',
    'price.change.approve.admin',
    'refund.initiate',
    'refund.approve.manager',
    'refund.approve.finance',
    'user.manage',
    'audit.view',
    'analytics.view',
    'export.bulk',
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
    'Admin': PERMISSIONS,
    'Manager': [
        'product.create', 'product.update', 'product.delete',
        'price.change.approve.manager',
        'refund.approve.manager',
        'user.manage',
        'analytics.view',
        'export.bulk'
    ],
    'Product Manager': ['product.create', 'product.update', 'price.change.request'],
    'Inventory Manager': ['product.update', 'export.bulk'],
    'Support': ['user.manage', 'refund.initiate'],
    'Finance': ['refund.approve.finance', 'analytics.view', 'export.bulk'],
    'Analyst': ['analytics.view', 'export.bulk', 'audit.view'],
    'Developer': ['audit.view', 'analytics.view'],
    'Customer': []
};

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    // Order matters for relational integrity
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();

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
    await prisma.role.deleteMany(); // Delete roles after users

    console.log('✅ Cleared\n');

    // 1. Seed Permissions
    console.log('🔐 Seeding Permissions...');
    for (const key of PERMISSIONS) {
        await prisma.permission.create({
            data: { key, description: `Permission for ${key}` },
        });
    }

    // 2. Seed Roles
    console.log('🎭 Seeding Roles...');
    const roleMap: Record<string, string> = {};
    for (const name of ROLES) {
        const role = await prisma.role.create({
            data: { name, description: `Role ${name}` },
        });
        roleMap[name] = role.id;
    }

    // 3. Assign Permissions
    console.log('🔗 Assigning Permissions...');
    for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
        const roleId = roleMap[roleName];
        if (!roleId) continue;

        for (const permKey of perms) {
            const permission = await prisma.permission.findUnique({ where: { key: permKey } });
            if (permission) {
                await prisma.rolePermission.create({
                    data: {
                        roleId,
                        permissionId: permission.id,
                        assignedBy: 'SEED',
                    },
                });
            }
        }
    }

    const hashedPassword = await bcrypt.hash('Test@1234', 10);

    // 4. Create Users
    console.log('👥 Creating users...');

    // Admin
    const adminRoleId = roleMap['Admin'];
    await prisma.user.create({
        data: {
            email: 'admin@ecommerce.com',
            password: hashedPassword,
            name: 'Admin User',
            phone: '+1-555-0001',
            emailVerified: true,
            role: 'ADMIN', // Legacy Enum
            roleRef: { connect: { id: adminRoleId } } // New Relation
        },
    });

    // Customers
    const customerRoleId = roleMap['Customer'];
    const customers = [];
    for (let i = 1; i <= 20; i++) {
        const customer = await prisma.user.create({
            data: {
                email: `customer${i}@gmail.com`,
                password: hashedPassword,
                name: `Customer ${i}`,
                phone: `+1-555-${String(100 + i).padStart(4, '0')}`,
                emailVerified: true,
                role: 'CUSTOMER', // Legacy Enum
                roleRef: { connect: { id: customerRoleId } } // New Relation
            },
        });
        customers.push(customer);
    }
    console.log(`✅ Created Admin + ${customers.length} customers\n`);

    // 5. Create Categories
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

    // 6. Create Products
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

    // 7. Create Addresses
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

    // 8. Create Carts
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

    console.log('\n========================================');
    console.log('✅ Database seeding completed!');
    console.log('========================================\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
