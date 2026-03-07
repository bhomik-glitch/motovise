import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

if (process.env.NODE_ENV === "production") {
  console.log("Seed disabled in production");
  process.exit(0);
}

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", description: "Administrator" },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: "MANAGER" },
    update: {},
    create: { name: "MANAGER", description: "Manager" },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: "CUSTOMER" },
    update: {},
    create: { name: "CUSTOMER", description: "Customer" },
  });

  console.log("✅ Roles created");

  // 2. Create Users
  const password = await bcrypt.hash("Test@1234", 10);

  const adminEmail = "admin@ecommerce.com";
  const managerEmail = "manager1@gmail.com";
  const customerEmail = "customer1@gmail.com";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { roleId: adminRole.id, role: UserRole.ADMIN },
    create: {
      email: adminEmail,
      name: "Admin User",
      password: password,
      roleId: adminRole.id,
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: managerEmail },
    update: { roleId: managerRole.id, role: UserRole.MANAGER },
    create: {
      email: managerEmail,
      name: "Manager User",
      password: password,
      roleId: managerRole.id,
      role: UserRole.MANAGER,
      emailVerified: true,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: customerEmail },
    update: { roleId: customerRole.id, role: UserRole.CUSTOMER },
    create: {
      email: customerEmail,
      name: "Customer User",
      password: password,
      roleId: customerRole.id,
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  console.log("✅ Users created");

  // 3. Categories
  const performance = await prisma.category.upsert({
    where: { slug: "performance" },
    update: {},
    create: {
      name: "Performance",
      slug: "performance",
      description: "High performance automotive parts",
    },
  });

  const bodywork = await prisma.category.upsert({
    where: { slug: "bodywork" },
    update: {},
    create: {
      name: "Bodywork",
      slug: "bodywork",
      description: "Exterior styling and protection",
    },
  });

  console.log("✅ Categories created");

  // 4. Products
  const products = [
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
      isFeatured: true,
      isActive: true,
      categoryId: performance.id,
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
      isFeatured: true,
      isActive: true,
      categoryId: performance.id,
    },
    {
      name: "Playbox Max Video Box CarPlay Adapter",
      slug: "playbox-max",
      price: 12999,
      stock: 20,
      description: "Transform your car screen into a powerful android tablet. Watch YouTube, Netflix, and more on your car display. Supports wireless CarPlay and Android Auto.",
      thumbnail: "/images/products/playbox-max/1.png",
      images: ["/images/products/playbox-max/1.png"],
      isFeatured: true,
      isActive: true,
      categoryId: performance.id,
    },
    {
      name: "Y2 CarPlay Adapter",
      slug: "y2-adapter",
      price: 5499,
      stock: 50,
      description: "Compact and efficient, the Y2 adapter is the perfect entry-level solution for wireless CarPlay. Mini size, hidden design, and high performance.",
      thumbnail: "/images/products/y2-adapter/1.png",
      images: ["/images/products/y2-adapter/1.png"],
      isFeatured: true,
      isActive: true,
      categoryId: performance.id,
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
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
      create: { ...p },
    });
  }

  console.log("✅ Products created");

  // 5. System Configuration
  await prisma.systemConfig.upsert({
    where: { id: "DEFAULT_CONFIG" },
    update: {},
    create: {
      id: "DEFAULT_CONFIG",
      maxLoginAttempts: 5,
      fraudRiskThreshold: 80,
      enableEmailVerification: false,
    },
  });

  console.log("✅ System configuration created");
  console.log("🌱 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
