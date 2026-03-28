const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            take: 10,
            select: { id: true, email: true, name: true }
        });
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
})();
