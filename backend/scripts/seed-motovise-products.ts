/**
 * seed-motovise-products.ts
 *
 * Seeds the two product categories (Android Box, Wireless Adapter)
 * and four Motovise products (Playbox Max, Y2, Duoconnect X, Duoconnect B).
 *
 * Safe to run multiple times — uses upsert everywhere.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/seed-motovise-products.ts
 *
 * Or via package.json script:
 *   npm run seed:motovise
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('🚗  Seeding Motovise product catalog…\n');

    // ── 0. Ensure base roles ─────────────────────────────────────────────────────
    for (const roleName of ['Admin', 'Customer', 'Manager', 'Developer']) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName, description: `Base role for ${roleName}` },
        });
    }
    console.log('✅ Roles verified\n');

    // ── 1. Upsert categories ──────────────────────────────────────────────────────
    const androidBoxCat = await prisma.category.upsert({
        where: { slug: 'android-box' },
        update: { name: 'Android Box', description: 'Android multimedia boxes for car OEM screens', isActive: true },
        create: {
            name: 'Android Box',
            slug: 'android-box',
            description: 'Android multimedia boxes for car OEM screens',
            isActive: true,
            sortOrder: 1,
        },
    });

    const wirelessAdapterCat = await prisma.category.upsert({
        where: { slug: 'wireless-adapter' },
        update: { name: 'Wireless Adapter', description: 'Wireless CarPlay & Android Auto adapters', isActive: true },
        create: {
            name: 'Wireless Adapter',
            slug: 'wireless-adapter',
            description: 'Wireless CarPlay & Android Auto adapters',
            isActive: true,
            sortOrder: 2,
        },
    });

    console.log(`✅ Category: ${androidBoxCat.name}  (${androidBoxCat.id})`);
    console.log(`✅ Category: ${wirelessAdapterCat.name}  (${wirelessAdapterCat.id})\n`);

    // ── 2. Product definitions ────────────────────────────────────────────────────
    const products = [
        // ─── PLAYBOX MAX ──────────────────────────────────────────────────────────
        {
            slug: 'playbox-max',
            categoryId: androidBoxCat.id,
            data: {
                name: 'Motovise Playbox Max',
                slug: 'playbox-max',
                description:
                    'The Motovise Playbox Max transforms your factory car screen into a full Android multimedia powerhouse. Stream YouTube, Netflix, Spotify, and run any Android app directly on your car\'s OEM display — no modifications required. With quad-core performance and 4G LTE built-in, it\'s the ultimate in-car entertainment upgrade.',
                shortDescription:
                    'Full Android on your factory screen. Stream, browse, and enjoy — plug-in, no mods.',
                price: 12999,
                compareAtPrice: 15999,
                stock: 20,
                sku: 'MV-PBM-001',
                isActive: true,
                isFeatured: true,
                thumbnail: '/images/products/playbox-max/1.png',
                images: ['/images/products/playbox-max/1.png'],
                features: [
                    { icon: 'Monitor', title: 'Full Android OS', description: 'Run any Android app directly on your factory screen' },
                    { icon: 'Wifi', title: 'Wireless CarPlay / Android Auto', description: 'Ditch the cable — connect your phone wirelessly' },
                    { icon: 'Youtube', title: 'YouTube & Netflix', description: 'Stream video content while parked — entertainment at its best' },
                    { icon: 'Cpu', title: 'Quad-Core Performance', description: '8-core CPU with 4GB RAM for smooth, lag-free multitasking' },
                    { icon: 'Signal', title: '4G LTE Built-In', description: 'Stay connected without your phone hotspot via internal SIM slot' },
                    { icon: 'Bluetooth', title: 'Voice Control', description: 'Google Assistant hands-free support for safe in-car control' },
                ],
                compatibility: {
                    makes: ['Toyota', 'Honda', 'Mazda', 'Hyundai', 'Kia', 'Subaru', 'Volkswagen', 'Skoda'],
                    years: { from: 2018, to: 2025 },
                    note: 'Compatible with factory OEM screens that use standard LVDS/HDMI interface. Check our compatibility list for your exact model.',
                },
                specifications: [
                    { label: 'OS', value: 'Android 13' },
                    { label: 'CPU', value: 'Octa-Core 1.8GHz' },
                    { label: 'RAM', value: '4 GB' },
                    { label: 'Storage', value: '64 GB' },
                    { label: 'Connectivity', value: 'Wi-Fi 5 + Bluetooth 5.0 + 4G LTE' },
                    { label: 'CarPlay / Android Auto', value: 'Wireless' },
                    { label: 'GPS', value: 'Built-in GPS + offline maps' },
                    { label: 'USB Ports', value: '2x USB-A' },
                    { label: 'Video Output', value: 'HDMI' },
                    { label: 'Power', value: 'USB-C 5V/3A' },
                    { label: 'Dimensions', value: '105 × 62 × 14 mm' },
                    { label: 'Weight', value: '95 g' },
                ],
                boxContents: [
                    '1× Playbox Max Device',
                    '1× HDMI Cable',
                    '1× USB-C Power Cable',
                    '1× Nano-SIM Ejector Tool',
                    '1× Velcro Mounting Strip',
                    '1× Quick Start Guide',
                ],
            },
        },

        // ─── Y2 ──────────────────────────────────────────────────────────────────
        {
            slug: 'y2-android-box',
            categoryId: androidBoxCat.id,
            data: {
                name: 'Y2 Android Box',
                slug: 'y2-android-box',
                description:
                    'The Y2 Android Box brings the Android experience to your factory car screen at an accessible price. Enjoy wireless CarPlay, Android Auto, and your favourite streaming apps without the premium cost. Compact, simple setup, and reliable performance make the Y2 the smart choice for everyday drivers looking to upgrade.',
                shortDescription:
                    'Wireless CarPlay, Android Auto & streaming apps. Simple upgrade, serious value.',
                price: 8999,
                compareAtPrice: 10999,
                stock: 35,
                sku: 'MV-Y2-001',
                isActive: true,
                isFeatured: true,
                thumbnail: '/images/products/y2-adapter/1.png',
                images: ['/images/products/y2-adapter/1.png'],
                features: [
                    { icon: 'Monitor', title: 'Android on OEM Screen', description: 'Turn your factory display into an Android tablet' },
                    { icon: 'Wifi', title: 'Wireless CarPlay & Android Auto', description: 'Enjoy wireless phone mirroring — no cables ever' },
                    { icon: 'Music', title: 'Streaming Ready', description: 'Spotify, YouTube Music, and more — all from the car screen' },
                    { icon: 'Cpu', title: 'Efficient Dual-Core CPU', description: 'Responsive performance for everyday driving needs' },
                    { icon: 'MapPin', title: 'Navigation Apps', description: 'Google Maps, Waze, and offline navigation support' },
                    { icon: 'Package', title: 'Plug & Drive', description: 'Simple plug-in setup — ready to use in minutes' },
                ],
                compatibility: {
                    makes: ['Toyota', 'Honda', 'Mazda', 'Hyundai', 'Kia', 'Nissan', 'Mitsubishi'],
                    years: { from: 2016, to: 2025 },
                    note: 'Works with most factory OEM infotainment screens with USB or HDMI input.',
                },
                specifications: [
                    { label: 'OS', value: 'Android 12' },
                    { label: 'CPU', value: 'Quad-Core 1.5GHz' },
                    { label: 'RAM', value: '2 GB' },
                    { label: 'Storage', value: '32 GB' },
                    { label: 'Connectivity', value: 'Wi-Fi 5 + Bluetooth 5.0' },
                    { label: 'CarPlay / Android Auto', value: 'Wireless' },
                    { label: 'GPS', value: 'Built-in GPS' },
                    { label: 'USB Ports', value: '1x USB-A' },
                    { label: 'Power', value: 'USB-A 5V/2A' },
                    { label: 'Dimensions', value: '88 × 55 × 12 mm' },
                    { label: 'Weight', value: '72 g' },
                ],
                boxContents: [
                    '1× Y2 Android Box',
                    '1× USB-A Power Cable',
                    '1× HDMI Cable',
                    '1× Velcro Mounting Pad',
                    '1× Quick Start Guide',
                ],
            },
        },

        // ─── DUOCONNECT X ─────────────────────────────────────────────────────────
        {
            slug: 'duo-connectx',
            categoryId: wirelessAdapterCat.id,
            data: {
                name: 'Duoconnect X',
                slug: 'duo-connectx',
                description:
                    'The Duoconnect X converts your wired CarPlay setup into a seamless wireless experience. Plug it into your car\'s USB port and instantly enjoy wireless CarPlay — your phone connects automatically every time you get in the car. Fast 5GHz connection, sub-3 second pairing, and zero configuration.',
                shortDescription:
                    'Plug in. Connect. Done. Wireless CarPlay in under 3 seconds.',
                price: 7999,
                compareAtPrice: 9999,
                stock: 45,
                sku: 'MV-DCX-001',
                isActive: true,
                isFeatured: true,
                thumbnail: '/images/products/duo-connectx/1.png',
                images: [
                    '/images/products/duo-connectx/1.png',
                    '/images/products/duo-connectx/2.png',
                    '/images/products/duo-connectx/3.png',
                    '/images/products/duo-connectx/4.png',
                    '/images/products/duo-connectx/5.png',
                    '/images/products/duo-connectx/6.png',
                    '/images/products/duo-connectx/7.png',
                    '/images/products/duo-connectx/8.png',
                    '/images/products/duo-connectx/9.png',
                ],
                features: [
                    { icon: 'Zap', title: 'Instant Auto-Connect', description: 'Phone pairs automatically — under 3 seconds every time' },
                    { icon: 'Signal', title: '5GHz Fast Connection', description: 'Stable, lag-free wireless on the fast 5GHz band' },
                    { icon: 'Plug', title: 'Plug & Play', description: 'No apps, no setup — just plug the adapter and go' },
                    { icon: 'Shield', title: 'Works with All iPhones', description: 'Full compatibility with iPhone 7 and newer' },
                    { icon: 'Volume2', title: 'High-Fidelity Audio', description: 'Crystal-clear audio routed through your car stereo' },
                    { icon: 'RefreshCw', title: 'OTA Updates', description: 'Firmware updates over-the-air for continued improvements' },
                ],
                compatibility: {
                    makes: [],
                    years: { from: 2015, to: 2025 },
                    note: 'Works with any car that has factory wired Apple CarPlay. No vehicle-specific configuration required.',
                },
                specifications: [
                    { label: 'Compatibility', value: 'Factory Wired Apple CarPlay cars' },
                    { label: 'Connection', value: '5GHz Wi-Fi + Bluetooth 5.0' },
                    { label: 'Pairing Time', value: '< 3 seconds' },
                    { label: 'Interface', value: 'USB-A (plug into car USB port)' },
                    { label: 'Phone Support', value: 'iPhone 7 and newer (iOS 10+)' },
                    { label: 'Power Draw', value: '5V / 0.5A' },
                    { label: 'Dimensions', value: '72 × 26 × 12 mm' },
                    { label: 'Weight', value: '18 g' },
                ],
                boxContents: [
                    '1× Duoconnect X Adapter',
                    '1× USB-A Extension Cable (20cm)',
                    '1× Quick Start Card',
                ],
            },
        },

        // ─── DUOCONNECT B ─────────────────────────────────────────────────────────
        {
            slug: 'duo-connect-b',
            categoryId: wirelessAdapterCat.id,
            data: {
                name: 'Duoconnect B',
                slug: 'duo-connect-b',
                description:
                    'The Duoconnect B is the slim, reliable wireless CarPlay adapter for drivers who want simplicity without compromise. Its ultra-compact design hides neatly behind the dashboard, delivering the full wireless CarPlay experience with zero clutter. High-quality audio, fast pairing, and whisper-quiet operation.',
                shortDescription:
                    'Slim. Hidden. Wireless. The no-fuss CarPlay upgrade.',
                price: 6499,
                compareAtPrice: 7999,
                stock: 30,
                sku: 'MV-DCB-001',
                isActive: true,
                isFeatured: true,
                thumbnail: '/images/products/duo-connect-b/1.png',
                images: [
                    '/images/products/duo-connect-b/1.png',
                    '/images/products/duo-connect-b/2.png',
                    '/images/products/duo-connect-b/3.png',
                    '/images/products/duo-connect-b/4.png',
                    '/images/products/duo-connect-b/5.png',
                    '/images/products/duo-connect-b/6.png',
                    '/images/products/duo-connect-b/7.png',
                    '/images/products/duo-connect-b/8.png',
                    '/images/products/duo-connect-b/9.png',
                    '/images/products/duo-connect-b/10.png',
                    '/images/products/duo-connect-b/11.png',
                    '/images/products/duo-connect-b/12.png',
                ],
                features: [
                    { icon: 'Minimize2', title: 'Ultra-Compact Design', description: 'Disappears behind the dash — zero visual clutter' },
                    { icon: 'Zap', title: 'Sub-5s Auto Pairing', description: 'Consistent, reliable auto-connect every drive' },
                    { icon: 'Plug', title: 'No App Required', description: 'True plug-and-play, works out of the box immediately' },
                    { icon: 'Shield', title: 'Broad iPhone Support', description: 'Works with iPhone 6s and newer devices' },
                    { icon: 'Volume2', title: 'Clear Audio Output', description: 'High-quality stereo audio via your car speakers' },
                    { icon: 'Thermometer', title: 'Low Heat Profile', description: 'Efficient chipset runs cool — no overheating' },
                ],
                compatibility: {
                    makes: [],
                    years: { from: 2014, to: 2025 },
                    note: 'Requires a car with factory wired Apple CarPlay (OEM). Plug into the vehicle\'s USB CarPlay port.',
                },
                specifications: [
                    { label: 'Compatibility', value: 'Factory Wired Apple CarPlay cars' },
                    { label: 'Connection', value: '2.4GHz / 5GHz Wi-Fi + Bluetooth 4.2' },
                    { label: 'Pairing Time', value: '< 5 seconds' },
                    { label: 'Interface', value: 'USB-A' },
                    { label: 'Phone Support', value: 'iPhone 6s and newer (iOS 9+)' },
                    { label: 'Power Draw', value: '5V / 0.4A' },
                    { label: 'Dimensions', value: '58 × 22 × 10 mm' },
                    { label: 'Weight', value: '14 g' },
                ],
                boxContents: [
                    '1× Duoconnect B Adapter',
                    '1× Quick Start Card',
                ],
            },
        },
    ];

    // ── 3. Upsert products ────────────────────────────────────────────────────────
    let created = 0;
    let updated = 0;

    for (const p of products) {
        const existing = await prisma.product.findUnique({ where: { slug: p.slug } });

        if (existing) {
            await prisma.product.update({
                where: { slug: p.slug },
                data: p.data as any,
            });
            console.log(`  ↻  Updated  : ${p.data.name}`);
            updated++;
        } else {
            await prisma.product.create({ data: p.data as any });
            console.log(`  ✚  Created  : ${p.data.name}`);
            created++;
        }
    }

    // ── 4. Summary ────────────────────────────────────────────────────────────────
    const total = await prisma.product.count({ where: { isActive: true } });

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ Motovise product seed complete!');
    console.log(`   Created : ${created} products`);
    console.log(`   Updated : ${updated} products`);
    console.log(`   Total active products: ${total}`);
    console.log('═══════════════════════════════════════════════════\n');
    console.log('Verify via API:');
    console.log('  GET http://localhost:4000/products');
    console.log('  GET http://localhost:4000/products/playbox-max');
    console.log('  GET http://localhost:4000/products/duo-connectx\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
