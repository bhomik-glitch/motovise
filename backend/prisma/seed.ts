
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
    const productsData = [
        {
            name: "Duo ConnectX Wireless CarPlay Adapter",
            slug: "duo-connectx",
            price: 7999,
            stock: 45,
            description: "Upgrade your car to wireless CarPlay with the Duo ConnectX. Fast stable connection, automatic pairing, and zero latency. Compatible with all factory CarPlay cars.",
            thumbnail: "/images/products/duo-connectx/1.png",
            images: [
                "/images/products/duo-connectx/1.png",
                "/images/products/duo-connectx/2.png",
                "/images/products/duo-connectx/3.png",
                "/images/products/duo-connectx/4.png",
                "/images/products/duo-connectx/5.png",
                "/images/products/duo-connectx/6.png",
                "/images/products/duo-connectx/7.png",
                "/images/products/duo-connectx/8.png",
                "/images/products/duo-connectx/9.png"
            ],
            isActive: true,
            isFeatured: true,
            categoryId: categories[0].id,
        },
        {
            name: "Duo Connect B Wireless CarPlay Adapter",
            slug: "duo-connect-b",
            price: 6499,
            stock: 30,
            description: "The classic Duo Connect B offers a slim design and reliable performance. Enjoy high-quality audio and responsive touch controls without the cables.",
            thumbnail: "/images/products/duo-connect-b/1.png",
            images: [
                "/images/products/duo-connect-b/1.png",
                "/images/products/duo-connect-b/2.png",
                "/images/products/duo-connect-b/3.png",
                "/images/products/duo-connect-b/4.png",
                "/images/products/duo-connect-b/5.png",
                "/images/products/duo-connect-b/6.png",
                "/images/products/duo-connect-b/7.png",
                "/images/products/duo-connect-b/8.png",
                "/images/products/duo-connect-b/9.png",
                "/images/products/duo-connect-b/10.png",
                "/images/products/duo-connect-b/11.png",
                "/images/products/duo-connect-b/12.png"
            ],
            isActive: true,
            isFeatured: true,
            categoryId: categories[0].id,
        },
        {
            name: "Playbox Max Video Box CarPlay Adapter",
            slug: "playbox-max",
            price: 12999,
            stock: 20,
            description: "Transform your car screen into a powerful android tablet. Watch YouTube, Netflix, and more on your car display. Supports wireless CarPlay and Android Auto.",
            thumbnail: "/images/products/playbox-max/1.png",
            images: ["/images/products/playbox-max/1.png"],
            isActive: true,
            isFeatured: true,
            categoryId: categories[0].id,
        },
        {
            name: "Y2 CarPlay Adapter",
            slug: "y2-adapter",
            price: 5499,
            stock: 50,
            description: "Compact and efficient, the Y2 adapter is the perfect entry-level solution for wireless CarPlay. Mini size, hidden design, and high performance.",
            thumbnail: "/images/products/y2-adapter/1.png",
            images: ["/images/products/y2-adapter/1.png"],
            isActive: true,
            isFeatured: true,
            categoryId: categories[0].id,
        }
    ];

    const products = [];
    for (const p of productsData) {
        const product = await prisma.product.upsert({
            where: { slug: p.slug },
            update: {
                name: p.name,
                description: p.description,
                price: p.price,
                stock: p.stock,
                categoryId: p.categoryId,
                thumbnail: p.thumbnail,
                images: p.images,
                isActive: p.isActive,
                isFeatured: p.isFeatured,
            },
            create: p,
        });
        products.push(product);
    }

    console.log(`✅ Upserted ${products.length} real products\n`);

    // 7. Create Addresses
    console.log('📍 Creating addresses...');
    try {
        const addresses = [];
        // Only seed addresses for the first 15 customers found
        for (const customer of customers.slice(0, 15)) {
            let address = await prisma.address.findFirst({ where: { userId: customer.id } });
            if (!address) {
                address = await prisma.address.create({
                    data: {
                        userId: customer.id,
                        fullName: customer.name,
                        phone: customer.phone || '+1-555-9999',
                        addressLine1: `${100 + Math.floor(Math.random() * 900)} Main St`,
                        city: 'New York',
                        state: 'NY',
                        postalCode: `${10000 + Math.floor(Math.random() * 90000)}`,
                        country: 'USA',
                        isDefault: true,
                    },
                });
            }
            addresses.push(address);
        }
        console.log(`✅ Seeded ${addresses.length} addresses`);
    } catch (error) {
        console.warn('⚠️ Address seeding skipped:', error.message);
    }

    // 8. Create Carts
    console.log('🛒 Creating carts...');
    try {
        const dbProducts = await prisma.product.findMany();
        if (!customers.length || !dbProducts.length) {
            console.log("⚠️ Skipping cart seed (missing users or products)");
        } else {
            const cartsSeeded = [];
            for (const customer of customers.slice(0, 10)) {
                const cart = await prisma.cart.upsert({
                    where: { userId: customer.id },
                    update: {},
                    create: { userId: customer.id },
                });

                // Pick a random product from what's actually in the DB
                const product = dbProducts[Math.floor(Math.random() * dbProducts.length)];

                if (product) {
                    await prisma.cartItem.upsert({
                        where: {
                            cartId_productId: {
                                cartId: cart.id,
                                productId: product.id,
                            }
                        },
                        update: {},
                        create: {
                            cartId: cart.id,
                            productId: product.id,
                            quantity: 1,
                        },
                    });
                    cartsSeeded.push(cart);
                }
            }
            console.log(`✅ Seeded ${cartsSeeded.length} carts with items`);
        }
    } catch (error) {
        console.warn('⚠️ Cart seeding skipped:', error.message);
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
