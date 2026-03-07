/**
 * seed-products.ts
 *
 * Additive seed — inserts 20 test products (Product 1 … Product 20) into the
 * live database WITHOUT deleting any existing data.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/seed-products.ts
 *
 * Or via package.json script:
 *   npm run seed:products
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load backend .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const PLACEHOLDER_IMAGE =
    'https://placehold.co/800x800/1a1a2e/ffffff?text=Product';

async function main() {
    console.log('🛍️  Starting product seed…\n');

    // ── 0. Ensure basic roles exist ────────────────────────────────────────────
    console.log('🎭 Checking essential roles...');
    const roles = ['Admin', 'Customer', 'Manager', 'Developer'];
    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: {
                name: roleName,
                description: `Base role for ${roleName}`
            }
        });
    }
    console.log('✅ Roles verified\n');

    // ── 1. Resolve / create category ────────────────────────────────────────────
    let category = await prisma.category.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
    });

    if (!category) {
        console.log('📂 No categories found — creating default "Test Category"…');
        category = await prisma.category.create({
            data: {
                name: 'Test Category',
                slug: 'test-category',
                description: 'Default category for test products',
                isActive: true,
            },
        });
        console.log(`✅ Category created: ${category.name} (${category.id})\n`);
    } else {
        console.log(`✅ Using existing category: ${category.name} (${category.id})\n`);
    }

    // ── 2. Define 20 test products ───────────────────────────────────────────────
    type ProductSeed = {
        name: string;
        slug: string;
        price: number;
        compareAtPrice: number;
        stock: number;
        description: string;
        thumbnail: string;
        images: string[];
        isActive: boolean;
        isFeatured: boolean;
    };

    const products: ProductSeed[] = [
        {
            name: "Duo ConnectX Wireless CarPlay Adapter",
            slug: "duo-connectx",
            price: 7999,
            compareAtPrice: 9999,
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
        },
        {
            name: "Duo Connect B Wireless CarPlay Adapter",
            slug: "duo-connect-b",
            price: 6499,
            compareAtPrice: 7999,
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
        },
        {
            name: "Playbox Max Video Box CarPlay Adapter",
            slug: "playbox-max",
            price: 12999,
            compareAtPrice: 15999,
            stock: 20,
            description: "Transform your car screen into a powerful android tablet. Watch YouTube, Netflix, and more on your car display. Supports wireless CarPlay and Android Auto.",
            thumbnail: "/images/products/playbox-max/1.png",
            images: ["/images/products/playbox-max/1.png"],
            isActive: true,
            isFeatured: true,
        },
        {
            name: "Y2 CarPlay Adapter",
            slug: "y2-adapter",
            price: 5499,
            compareAtPrice: 6999,
            stock: 50,
            description: "Compact and efficient, the Y2 adapter is the perfect entry-level solution for wireless CarPlay. Mini size, hidden design, and high performance.",
            thumbnail: "/images/products/y2-adapter/1.png",
            images: ["/images/products/y2-adapter/1.png"],
            isActive: true,
            isFeatured: true,
        }
    ];

    // ── 3. Upsert products (idempotent — safe to run multiple times) ─────────────
    let created = 0;
    let updated = 0;

    for (const p of products) {
        const existing = await prisma.product.findUnique({
            where: { slug: p.slug },
        });

        if (existing) {
            await prisma.product.update({
                where: { slug: p.slug },
                data: {
                    name: p.name,
                    price: p.price,
                    compareAtPrice: p.compareAtPrice,
                    stock: p.stock,
                    description: p.description,
                    thumbnail: p.thumbnail,
                    images: p.images,
                    isActive: p.isActive,
                    isFeatured: p.isFeatured,
                    categoryId: category.id,
                },
            });
            console.log(`  ↻  Updated  : ${p.name} (slug: ${p.slug})`);
            updated++;
        } else {
            await prisma.product.create({
                data: {
                    name: p.name,
                    slug: p.slug,
                    price: p.price,
                    compareAtPrice: p.compareAtPrice,
                    stock: p.stock,
                    description: p.description,
                    thumbnail: p.thumbnail,
                    images: p.images,
                    isActive: p.isActive,
                    isFeatured: p.isFeatured,
                    categoryId: category.id,
                },
            });
            console.log(`  ✚  Created  : ${p.name} (slug: ${p.slug})`);
            created++;
        }
    }

    // ── 4. Summary ───────────────────────────────────────────────────────────────
    const total = await prisma.product.count({ where: { isActive: true } });

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`✅ Seed complete!`);
    console.log(`   Created : ${created} products`);
    console.log(`   Updated : ${updated} products`);
    console.log(`   Total active products in DB: ${total}`);
    console.log('═══════════════════════════════════════════════════\n');
    console.log('Verify via API:');
    console.log('  GET http://localhost:4000/products');
    console.log('  GET http://localhost:4000/products/product-1');
    console.log('  GET http://localhost:4000/products/product-20\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
