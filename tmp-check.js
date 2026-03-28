import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, slug: true }});
  console.log("Current Products:");
  console.log(products);

  // Check for the ones to delete
  const toDelete = ["Variety Pack Offer", "Y2 CarPlay Adapter"];
  const varietyPack = products.find(p => p.name === "Variety Pack Offer");
  const y2Adapter = products.find(p => p.name === "Y2 CarPlay Adapter");

  if (varietyPack) {
    console.log(`Found Variety Pack: ${varietyPack.id}`);
    await prisma.cartItem.deleteMany({ where: { productId: varietyPack.id }});
    await prisma.inventoryLog.deleteMany({ where: { productId: varietyPack.id }});
    await prisma.orderItem.deleteMany({ where: { productId: varietyPack.id }});
    await prisma.productImage.deleteMany({ where: { productId: varietyPack.id }});
    await prisma.product.delete({ where: { id: varietyPack.id }});
    console.log("Deleted Variety Pack Offer");
  }

  if (y2Adapter) {
    console.log(`Found Y2 CarPlay Adapter: ${y2Adapter.id}`);
    await prisma.cartItem.deleteMany({ where: { productId: y2Adapter.id }});
    await prisma.inventoryLog.deleteMany({ where: { productId: y2Adapter.id }});
    await prisma.orderItem.deleteMany({ where: { productId: y2Adapter.id }});
    await prisma.productImage.deleteMany({ where: { productId: y2Adapter.id }});
    await prisma.product.delete({ where: { id: y2Adapter.id }});
    console.log("Deleted Y2 CarPlay Adapter");
  }

  const newProducts = await prisma.product.findMany({ select: { id: true, name: true, slug: true }});
  console.log("Remaining Products:");
  console.log(newProducts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
