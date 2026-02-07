import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showPrices() {
  const items = await prisma.item.findMany({
    where: {
      rarity: { in: ['VETERAN', 'MASTER'] },
    },
    orderBy: [{ rarity: 'asc' }, { basePrice: 'desc' }],
  });

  console.log('\n=== MASTER items (top 10) ===');
  items
    .filter(i => i.rarity === 'MASTER')
    .slice(0, 10)
    .forEach(i => {
      console.log(`${i.basePrice.toFixed(2).padStart(7)}₽ - ${i.name}`);
    });

  console.log('\n=== VETERAN items (top 10) ===');
  items
    .filter(i => i.rarity === 'VETERAN')
    .slice(0, 10)
    .forEach(i => {
      console.log(`${i.basePrice.toFixed(2).padStart(7)}₽ - ${i.name}`);
    });

  const masterItems = items.filter(i => i.rarity === 'MASTER');
  const veteranItems = items.filter(i => i.rarity === 'VETERAN');

  console.log('\n=== Summary ===');
  console.log(`MASTER: ${masterItems.length} items, ${Math.min(...masterItems.map(i => i.basePrice)).toFixed(2)}₽ - ${Math.max(...masterItems.map(i => i.basePrice)).toFixed(2)}₽`);
  console.log(`VETERAN: ${veteranItems.length} items, ${Math.min(...veteranItems.map(i => i.basePrice)).toFixed(2)}₽ - ${Math.max(...veteranItems.map(i => i.basePrice)).toFixed(2)}₽`);
}

showPrices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
