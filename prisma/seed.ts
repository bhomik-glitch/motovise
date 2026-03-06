import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
      name: "Carbon Fiber Spoiler Pro",
      slug: "carbon-fiber-spoiler-pro",
      description: "Ultra-lightweight aerodynamic spoiler made from genuine carbon fiber.",
      price: 299.00,
      stock: 50,
      categoryId: bodywork.id,
      images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"],
      isFeatured: true,
      isActive: true,
    },
    {
      name: "Performance Air Filter Kit",
      slug: "performance-air-filter-kit",
      description: "High-flow intake system for increased horsepower and torque.",
      price: 89.00,
      stock: 100,
      categoryId: performance.id,
      images: ["https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800"],
      isFeatured: true,
      isActive: true,
    },
    {
      name: "LED Headlight Upgrade",
      slug: "led-headlight-upgrade",
      description: "Cristal clear 6000K white LED bulbs for superior visibility.",
      price: 249.00,
      stock: 30,
      categoryId: performance.id,
      images: ["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800"],
      isFeatured: true,
      isActive: true,
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p },
      create: { ...p },
    });
  }

  console.log("✅ Products created");
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
