
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLES = [
    'ADMIN',
    'MANAGER',
    'Product Manager',
    'Inventory Manager',
    'Support',
    'Finance',
    'Analyst',
    'Developer',
    'CUSTOMER',
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
    'fraud.view',
    'fraud.config.update',
    'rbac.manage',
    'SYSTEM_CONFIG_EDIT'
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
    'ADMIN': PERMISSIONS,
    'MANAGER': [
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
    'CUSTOMER': []
};

async function main() {
    console.log('🌱 Starting database seed...\n');

    console.log('🗑️  Skipping deleteMany for idempotent seeding...');

    // 1. Seed Permissions
    console.log('🔐 Seeding Permissions...');
    for (const key of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { key },
            update: {},
            create: { key, description: `Permission for ${key}` },
        });
    }

    // 2. Seed Roles
    console.log('🎭 Seeding Roles...');
    const roleMap: Record<string, string> = {};
    for (const name of ROLES) {
        const role = await prisma.role.upsert({
            where: { name },
            update: {},
            create: { name, description: `Role ${name}` },
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
                // Upsert for role permissions by checking compound key if possible,
                // or just use createMany with skipDuplicates.
                try {
                    await prisma.rolePermission.upsert({
                        where: {
                            roleId_permissionId: {
                                roleId: roleId,
                                permissionId: permission.id,
                            }
                        },
                        update: {},
                        create: {
                            roleId,
                            permissionId: permission.id,
                            assignedBy: 'SEED',
                        },
                    });
                } catch (err) {
                    // Ignore duplicate errors if upsert fails somehow
                }
            }
        }
    }

    const hashedPassword = await bcrypt.hash('Test@1234', 10);

    // 4. Create Users
    console.log('👥 Creating users...');

    // Admin
    const adminRoleId = roleMap['ADMIN'];
    await prisma.user.upsert({
        where: { email: 'admin@ecommerce.com' },
        update: {
            password: hashedPassword,
            roleId: adminRoleId,
        },
        create: {
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
    const customerRoleId = roleMap['CUSTOMER'];
    const customers = [];
    for (let i = 1; i <= 20; i++) {
        const customer = await prisma.user.upsert({
            where: { email: `customer${i}@gmail.com` },
            update: {
                password: hashedPassword,
                roleId: customerRoleId,
            },
            create: {
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
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        const category = await prisma.category.upsert({
            where: { slug },
            update: {},
            create: {
                name,
                description: `${name} products`,
                slug,
            },
        });
        categories.push(category);
    }

    // 6. Create Products
    console.log('🛍️  Creating products...');
    const products = [];

    // 5 low stock (5-10)
    for (let i = 0; i < 5; i++) {
        const slug = `low-stock-${i + 1}`;
        const product = await prisma.product.upsert({
            where: { slug },
            update: {},
            create: {
                name: `Low Stock Product ${i + 1}`,
                description: 'Test product',
                price: 50 + i * 10,
                stock: 5 + i,
                categoryId: categories[i % 5].id,
                slug,
                images: ['https://via.placeholder.com/300'],
                isActive: true,
            },
        });
        products.push(product);
    }

    // 10 medium stock (20-50)
    for (let i = 0; i < 10; i++) {
        const slug = `medium-stock-${i + 1}`;
        const product = await prisma.product.upsert({
            where: { slug },
            update: {},
            create: {
                name: `Medium Stock Product ${i + 1}`,
                description: 'Test product',
                price: 30 + i * 5,
                stock: 20 + i * 3,
                categoryId: categories[i % 5].id,
                slug,
                images: ['https://via.placeholder.com/300'],
                isActive: true,
            },
        });
        products.push(product);
    }

    // 10 high stock (100+)
    for (let i = 0; i < 10; i++) {
        const slug = `high-stock-${i + 1}`;
        const product = await prisma.product.upsert({
            where: { slug },
            update: {},
            create: {
                name: `High Stock Product ${i + 1}`,
                description: 'Test product',
                price: 15 + i * 2,
                stock: 100 + i * 50,
                categoryId: categories[i % 5].id,
                slug,
                images: ['https://via.placeholder.com/300'],
                isActive: true,
            },
        });
        products.push(product);
    }

    // 5 inactive
    for (let i = 0; i < 5; i++) {
        const slug = `inactive-${i + 1}`;
        const product = await prisma.product.upsert({
            where: { slug },
            update: {},
            create: {
                name: `Inactive Product ${i + 1}`,
                description: 'Test product',
                price: 25,
                stock: 50,
                categoryId: categories[i % 5].id,
                slug,
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
        let address = await prisma.address.findFirst({ where: { userId: customer.id } });
        if (!address) {
            address = await prisma.address.create({
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
        }
        addresses.push(address);
    }

    // 8. Create Carts
    console.log('🛒 Creating carts...');
    for (let i = 0; i < 10; i++) {
        const customer = customers[i];
        const cart = await prisma.cart.upsert({
            where: { userId: customer.id },
            update: {},
            create: { userId: customer.id },
        });

        await prisma.cartItem.upsert({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: products[i % 25].id,
                }
            },
            update: {},
            create: {
                cartId: cart.id,
                productId: products[i % 25].id,
                quantity: 2,
            },
        });
    }

    // 9. Create SystemConfig
    try {
        console.log('⚙️  Creating system configuration...');
        await prisma.systemConfig.upsert({
            where: { id: 'DEFAULT_CONFIG' },
            update: {},
            create: {
                id: 'DEFAULT_CONFIG',
                maxLoginAttempts: 5,
                fraudRiskThreshold: 80,
                enableEmailVerification: true
            },
        });
        console.log('✅ System configuration ready');
    } catch (error) {
        console.warn('⚠️ SystemConfig table not ready yet, skipping');
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
