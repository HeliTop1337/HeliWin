import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePrices() {
  console.log('Checking current prices...\n');

  // Получаем все предметы
  const items = await prisma.item.findMany({
    where: {
      rarity: { in: ['VETERAN', 'MASTER'] },
    },
    orderBy: [{ rarity: 'asc' }, { name: 'asc' }],
  });

  const veteranItems = items.filter(i => i.rarity === 'VETERAN');
  const masterItems = items.filter(i => i.rarity === 'MASTER');

  console.log(`VETERAN items: ${veteranItems.length}`);
  console.log(`MASTER items: ${masterItems.length}\n`);

  // Показываем текущие цены
  const vetPrices = veteranItems.map(i => i.basePrice);
  const mastPrices = masterItems.map(i => i.basePrice);
  
  console.log('Current VETERAN prices:', Math.min(...vetPrices), '-', Math.max(...vetPrices));
  console.log('Current MASTER prices:', Math.min(...mastPrices), '-', Math.max(...mastPrices));
  console.log('\nUpdating prices...\n');

  // Обновляем цены для VETERAN (50-150₽)
  for (let i = 0; i < veteranItems.length; i++) {
    const item = veteranItems[i];
    const newPrice = 50 + Math.random() * 100; // 50-150₽
    await prisma.item.update({
      where: { id: item.id },
      data: { basePrice: Math.round(newPrice * 100) / 100 },
    });
  }

  // Обновляем цены для MASTER (200-500₽)
  for (let i = 0; i < masterItems.length; i++) {
    const item = masterItems[i];
    const newPrice = 200 + Math.random() * 300; // 200-500₽
    await prisma.item.update({
      where: { id: item.id },
      data: { basePrice: Math.round(newPrice * 100) / 100 },
    });
  }

  console.log('✓ Prices updated!');
  
  // Показываем новые цены
  const updatedItems = await prisma.item.findMany({
    where: {
      rarity: { in: ['VETERAN', 'MASTER'] },
    },
  });

  const newVetPrices = updatedItems.filter(i => i.rarity === 'VETERAN').map(i => i.basePrice);
  const newMastPrices = updatedItems.filter(i => i.rarity === 'MASTER').map(i => i.basePrice);
  
  console.log('\nNew VETERAN prices:', Math.min(...newVetPrices).toFixed(2), '-', Math.max(...newVetPrices).toFixed(2));
  console.log('New MASTER prices:', Math.min(...newMastPrices).toFixed(2), '-', Math.max(...newMastPrices).toFixed(2));
}

updatePrices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
