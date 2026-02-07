import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setLegendaryChance() {
  console.log('Setting legendary drop chance to 0.001936%...\n');

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

  const items = legendaryCase.items;
  
  // Группируем по редкости
  const legendary = items.filter(i => i.item.rarity === 'LEGENDARY');
  const master = items.filter(i => i.item.rarity === 'MASTER');
  const veteran = items.filter(i => i.item.rarity === 'VETERAN');

  console.log(`Items: Legendary(${legendary.length}), Master(${master.length}), Veteran(${veteran.length})\n`);

  // Устанавливаем шансы
  const legendaryChance = 0.001936;  // 0.001936% - ЭКСТРЕМАЛЬНО редко!
  const masterChance = 39.998064;    // ~40%
  const veteranChance = 60;          // 60%

  console.log('Distribution:');
  console.log(`  Legendary: ${legendaryChance}%`);
  console.log(`  Master: ${masterChance}%`);
  console.log(`  Veteran: ${veteranChance}%\n`);

  // Функция для распределения шансов с учетом цены
  const distributeChances = async (itemsList: any[], totalChance: number) => {
    if (itemsList.length === 0) return;

    const maxPrice = Math.max(...itemsList.map(i => i.item.basePrice));
    const minPrice = Math.min(...itemsList.map(i => i.item.basePrice));
    const priceRange = maxPrice - minPrice;

    const weights = itemsList.map(i => {
      if (priceRange === 0) return 1;
      const normalizedPrice = (i.item.basePrice - minPrice) / priceRange;
      // Дорогие предметы реже
      return 1 - (normalizedPrice * 0.8);
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    for (let i = 0; i < itemsList.length; i++) {
      const chance = (weights[i] / totalWeight) * totalChance;
      await prisma.caseItem.update({
        where: { id: itemsList[i].id },
        data: { dropChance: Math.round(chance * 1000000) / 1000000 }, // 6 знаков после запятой
      });
    }
  };

  console.log('Updating drop chances...\n');

  await distributeChances(legendary, legendaryChance);
  await distributeChances(master, masterChance);
  await distributeChances(veteran, veteranChance);

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

  const updatedItems = updatedCase!.items;

  const totalChance = updatedItems.reduce((sum, i) => sum + i.dropChance, 0);
  const expectedValue = updatedItems.reduce((sum, i) => {
    return sum + (i.item.basePrice * i.dropChance / 100);
  }, 0);
  const rtp = (expectedValue / legendaryCase.price) * 100;

  console.log('=== Results ===');
  console.log(`Total chance: ${totalChance.toFixed(4)}%`);
  console.log(`Expected value: ${expectedValue.toFixed(2)}₽`);
  console.log(`RTP: ${rtp.toFixed(2)}%\n`);

  // Показываем распределение по редкости
  const rarityStats = {
    LEGENDARY: { count: 0, totalChance: 0 },
    MASTER: { count: 0, totalChance: 0 },
    VETERAN: { count: 0, totalChance: 0 },
  };

  updatedItems.forEach(i => {
    if (rarityStats[i.item.rarity]) {
      rarityStats[i.item.rarity].count++;
      rarityStats[i.item.rarity].totalChance += i.dropChance;
    }
  });

  console.log('Rarity distribution:');
  Object.entries(rarityStats).forEach(([rarity, stats]) => {
    if (stats.count > 0) {
      console.log(`  ${rarity}: ${stats.count} items, ${stats.totalChance.toFixed(6)}% total`);
    }
  });

  console.log('\nLegendary items (EXTREMELY RARE - 0.001936%):');
  updatedItems
    .filter(i => i.item.rarity === 'LEGENDARY')
    .forEach(i => {
      const dropRate = 1 / (i.dropChance / 100);
      console.log(`  ${i.item.name}: ${i.item.basePrice.toFixed(2)}₽ - ${i.dropChance.toFixed(6)}% (1 in ${Math.round(dropRate)} cases)`);
    });

  console.log('\nTop 3 Master items:');
  updatedItems
    .filter(i => i.item.rarity === 'MASTER')
    .sort((a, b) => b.item.basePrice - a.item.basePrice)
    .slice(0, 3)
    .forEach(i => {
      console.log(`  ${i.item.name}: ${i.item.basePrice.toFixed(2)}₽ - ${i.dropChance.toFixed(4)}%`);
    });

  console.log('\nTop 3 Veteran items:');
  updatedItems
    .filter(i => i.item.rarity === 'VETERAN')
    .sort((a, b) => b.item.basePrice - a.item.basePrice)
    .slice(0, 3)
    .forEach(i => {
      console.log(`  ${i.item.name}: ${i.item.basePrice.toFixed(2)}₽ - ${i.dropChance.toFixed(4)}%`);
    });

  console.log('\n✓ Legendary case updated!');
  console.log('Legendary items are now EXTREMELY RARE - only 0.001936% chance!');
  console.log('That means approximately 1 legendary per 51,653 cases opened!');
}

setLegendaryChance()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
