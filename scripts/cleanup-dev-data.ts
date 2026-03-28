import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    // Ordered to respect foreign key constraints if they exist
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.cart.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.alert.deleteMany()
    await prisma.metricsSnapshot.deleteMany()
    await prisma.inventoryLog.deleteMany()

    console.log("Dummy data removed")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
