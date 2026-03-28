const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    try {
        const result = await prisma.product.updateMany({
            where: { isActive: true },
            data: { stock: 500 }
        });
        console.log(`✓ Stock reset to 500 for ${result.count} active products`);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
})();
