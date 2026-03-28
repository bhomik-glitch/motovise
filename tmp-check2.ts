import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.cartItem.deleteMany({ where: { productId: 'cmn7qjgs2001pndmigk0cunqh' } });
  await prisma.inventoryLog.deleteMany({ where: { productId: 'cmn7qjgs2001pndmigk0cunqh' }});
  await prisma.orderItem.deleteMany({ where: { productId: 'cmn7qjgs2001pndmigk0cunqh' }});
  await prisma.productImage.deleteMany({ where: { productId: 'cmn7qjgs2001pndmigk0cunqh' }});
  await prisma.product.delete({ where: { id: 'cmn7qjgs2001pndmigk0cunqh' }});
  console.log('Deleted Variety Pack');
}
run().catch(console.error).finally(() => prisma.$disconnect());
