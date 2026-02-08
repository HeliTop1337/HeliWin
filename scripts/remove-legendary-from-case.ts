import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeLegendaryFromCase() {
  console.log('Removing legendary items from Legendary case...\n');

  const legendaryCase = await prisma.case.findFirst({
    where: {
      name: 'Легендарный кейс',
    },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  if (!legendaryCase) {
    console.log('❌ Legendary case not found!');
    return;
  }

  console.log(`=== ${legendaryCase.name} ===`);

  // Находим легендарные предметы
  const legendaryItems = legendaryCase.items.filter(i => i.item.rarity === 'LEGENDARY');
  const masterItems = legendaryCase.items.filter(i => i.item.rarity === 'MASTER');
  const veteranItems = legendaryCase.items.filter(i => i.item.rarity === 'VETERAN');

  console.log(`Current items: Legendary(${legendaryItems.length}), Master(${masterItems.length}), Veteran(${veteranItems.length})\n`);

  if (legendaryItems.length > 0) {
    console.log('Legendary items to remove:');
    legendaryItems.forEach(i => {
      console.log(`  - ${i.item.name} (${i.item.basePrice}₽)`);
    });
    console.log('');

    // Удаляем легендарные предметы из кейса
    await prisma.caseItem.deleteMany({
      where: {
        caseId: legendaryCase.id,
        item: {
          rarity: 'LEGENDARY',
        },
      },
    });

    console.log('✓ Legendary items removed!\n');
  }

  // Пересчитываем шансы: Master 10%, Veteran 90%
  const masterChance = 10;
  const veteranChance = 90;

  // Функция для распределения шансов
  const distributeChances = async (itemsList: any[], totalChance: number) => {
    if (itemsList.length === 0) return;

    const maxPrice = Math.max(...itemsList.map(i => i.item.basePrice));
    const minPrice = Math.min(...itemsList.map(i => i.item.basePrice));
    const priceRange = maxPrice - minPrice;

    const weights = itemsList.map(i => {
      if (priceRange === 0) return 1;
      const normalizedPrice = (i.item.basePrice - minPrice) / priceRange;
      return 1 - (normalizedPrice * 0.8);
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    for (let i = 0; i < itemsList.length; i++) {
      const chance = (weights[i] / totalWeight) * totalChance;
      await prisma.caseItem.update({
        where: { id: itemsList[i].id },
        data: { dropChance: Math.round(chance * 10000) / 10000 },
      });
    }
  };

  await distributeChances(masterItems, masterChance);
  await distributeChances(veteranItems, veteranChance);

  // Проверяем результат
  const updatedCase = await prisma.case.findFirst({
    where: { id: legendaryCase.id },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  const updatedLegendary = updatedCase!.items.filter(i => i.item.rarity === 'LEGENDARY');
  const updatedMaster = updatedCase!.items.filter(i => i.item.rarity === 'MASTER');
  const updatedVeteran = updatedCase!.items.filter(i => i.item.rarity === 'VETERAN');

  console.log('=== Updated distribution ===');
  console.log(`Legendary: ${updatedLegendary.length} items`);
  console.log(`Master: ${updatedMaster.length} items - ${updatedMaster.reduce((sum, i) => sum + i.dropChance, 0).toFixed(2)}%`);
  console.log(`Veteran: ${updatedVeteran.length} items - ${updatedVeteran.reduce((sum, i) => sum + i.dropChance, 0).toFixed(2)}%`);

  const totalChance = updatedCase!.items.reduce((sum, i) => sum + i.dropChance, 0);
  const expectedValue = updatedCase!.items.reduce((sum, i) => {
    return sum + (i.item.basePrice * i.dropChance / 100);
  }, 0);
  const rtp = (expectedValue / legendaryCase.price) * 100;

  console.log(`\nTotal chance: ${totalChance.toFixed(2)}%`);
  console.log(`Expected value: ${expectedValue.toFixed(2)}₽`);
  console.log(`RTP: ${rtp.toFixed(2)}%`);

  console.log('\nTop 5 most expensive items:');
  updatedCase!.items
    .sort((a, b) => b.item.basePrice - a.item.basePrice)
    .slice(0, 5)
    .forEach(i => {
      console.log(`  ${i.item.name} (${i.item.rarity}): ${i.item.basePrice.toFixed(2)}₽ - ${i.dropChance.toFixed(4)}%`);
    });

  console.log('\n✓ Done!');
}

removeLegendaryFromCase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
