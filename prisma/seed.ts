import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create Manager User
  const managerPassword = await bcrypt.hash("manager123", 10);
  const manager = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: {
      email: "manager@example.com",
      name: "Manager User",
      password: managerPassword,
      role: Role.MANAGER,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Created manager user:", manager.email);

  // Create Manager Permissions
  await prisma.managerPermissions.upsert({
    where: { userId: manager.id },
    update: {},
    create: {
      userId: manager.id,
      canManageProducts: true,
      canViewOrders: true,
      canUpdateOrders: true,
      canManageCategories: false,
      canViewAnalytics: true,
      canManageInventory: true,
    },
  });
  console.log("✅ Created manager permissions");

  // Create Customer User
  const customerPassword = await bcrypt.hash("customer123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      name: "John Doe",
      password: customerPassword,
      role: Role.CUSTOMER,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Created customer user:", customer.email);

  // Create Categories
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and accessories",
      isActive: true,
      sortOrder: 1,
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: {
      name: "Clothing",
      slug: "clothing",
      description: "Fashion and apparel",
      isActive: true,
      sortOrder: 2,
    },
  });

  const home = await prisma.category.upsert({
    where: { slug: "home-garden" },
    update: {},
    create: {
      name: "Home & Garden",
      slug: "home-garden",
      description: "Home decor and garden supplies",
      isActive: true,
      sortOrder: 3,
    },
  });

  console.log("✅ Created categories");

  // Create Subcategories
  const smartphones = await prisma.category.upsert({
    where: { slug: "smartphones" },
    update: {},
    create: {
      name: "Smartphones",
      slug: "smartphones",
      description: "Mobile phones and accessories",
      parentId: electronics.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  const laptops = await prisma.category.upsert({
    where: { slug: "laptops" },
    update: {},
    create: {
      name: "Laptops",
      slug: "laptops",
      description: "Laptops and notebooks",
      parentId: electronics.id,
      isActive: true,
      sortOrder: 2,
    },
  });

  console.log("✅ Created subcategories");

  // Create Products
  const products = [
    {
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      description:
        "The latest iPhone with A17 Pro chip, titanium design, and advanced camera system.",
      price: 129900,
      compareAtPrice: 139900,
      sku: "IPHONE-15-PRO-256",
      stock: 50,
      categoryId: smartphones.id,
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      ],
      thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
      isActive: true,
      isFeatured: true,
      metaTitle: "iPhone 15 Pro - Buy Now",
      metaDescription: "Get the latest iPhone 15 Pro with amazing features",
    },
    {
      name: "MacBook Pro 14",
      slug: "macbook-pro-14",
      description:
        "Supercharged by M3 Pro or M3 Max chip. Up to 18 hours of battery life.",
      price: 199900,
      compareAtPrice: 219900,
      sku: "MBP-14-M3-512",
      stock: 30,
      categoryId: laptops.id,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      ],
      thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      isActive: true,
      isFeatured: true,
      metaTitle: "MacBook Pro 14 - Professional Laptop",
      metaDescription: "Powerful MacBook Pro for professionals",
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description:
        "Galaxy AI is here. The most powerful Galaxy smartphone with S Pen.",
      price: 124999,
      sku: "GALAXY-S24-ULTRA-256",
      stock: 45,
      categoryId: smartphones.id,
      images: [
        "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
      ],
      thumbnail: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Dell XPS 15",
      slug: "dell-xps-15",
      description:
        "Stunning 15.6-inch OLED display, Intel Core i7, 16GB RAM, 512GB SSD.",
      price: 159900,
      sku: "DELL-XPS-15-I7",
      stock: 25,
      categoryId: laptops.id,
      images: [
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
      ],
      thumbnail: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Premium Cotton T-Shirt",
      slug: "premium-cotton-tshirt",
      description: "100% organic cotton, comfortable fit, available in multiple colors.",
      price: 1999,
      compareAtPrice: 2999,
      sku: "TSHIRT-COTTON-M",
      stock: 100,
      categoryId: clothing.id,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      ],
      thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Designer Ceramic Vase",
      slug: "designer-ceramic-vase",
      description: "Handcrafted ceramic vase, perfect for home decoration.",
      price: 3499,
      sku: "VASE-CERAMIC-001",
      stock: 20,
      categoryId: home.id,
      images: [
        "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800",
      ],
      thumbnail: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400",
      isActive: true,
      isFeatured: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log(`✅ Created ${products.length} products`);

  // Create Customer Address
  await prisma.address.upsert({
    where: { id: "sample-address-1" },
    update: {},
    create: {
      id: "sample-address-1",
      userId: customer.id,
      fullName: "John Doe",
      phone: "+91 9876543210",
      addressLine1: "123 Main Street",
      addressLine2: "Apartment 4B",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "India",
      isDefault: true,
    },
  });

  console.log("✅ Created customer address");

  // Create Sample Order
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      userId: customer.id,
      subtotal: 131899,
      tax: 23741.82,
      shipping: 0,
      discount: 0,
      total: 155640.82,
      status: "DELIVERED",
      paymentStatus: "PAID",
      shippingAddressId: "sample-address-1",
      billingAddressId: "sample-address-1",
      trackingNumber: "TRACK123456789",
      items: {
        create: [
          {
            productId: (await prisma.product.findUnique({ where: { slug: "iphone-15-pro" } }))!.id,
            quantity: 1,
            price: 129900,
          },
          {
            productId: (await prisma.product.findUnique({ where: { slug: "premium-cotton-tshirt" } }))!.id,
            quantity: 1,
            price: 1999,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: sampleOrder.id,
      amount: 155640.82,
      currency: "INR",
      status: "PAID",
      method: "card",
      razorpayOrderId: `order_${Date.now()}`,
      razorpayPaymentId: `pay_${Date.now()}`,
    },
  });

  console.log("✅ Created sample order with payment");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📝 Test Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:");
  console.log("  Email: admin@example.com");
  console.log("  Password: admin123");
  console.log("\nManager:");
  console.log("  Email: manager@example.com");
  console.log("  Password: manager123");
  console.log("\nCustomer:");
  console.log("  Email: customer@example.com");
  console.log("  Password: customer123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
