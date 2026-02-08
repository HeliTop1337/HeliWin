import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setHardChances() {
  console.log('Setting hard drop chances for all cases...\n');
  console.log('Distribution: Veteran 90%, Master 9%, Legendary 1%\n');

  const cases = await prisma.case.findMany({
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  for (const caseItem of cases) {
    console.log(`\n=== ${caseItem.name} ===`);
    
    const items = caseItem.items;
    
    if (items.length === 0) {
      console.log('No items, skipping...');
      continue;
    }

    // Группируем по редкости
    const legendary = items.filter(i => i.item.rarity === 'LEGENDARY');
    const master = items.filter(i => i.item.rarity === 'MASTER');
    const veteran = items.filter(i => i.item.rarity === 'VETERAN');
    const stalker = items.filter(i => i.item.rarity === 'STALKER');

    console.log(`Items: Legendary(${legendary.length}), Master(${master.length}), Veteran(${veteran.length}), Stalker(${stalker.length})`);

    // Жесткие шансы
    let legendaryChance = 1;   // 1%
    let masterChance = 9;      // 9%
    let veteranChance = 90;    // 90%
    let stalkerChance = 0;     // 0%

    // Если нет легендарных - перераспределяем
    if (legendary.length === 0) {
      masterChance = 10;
      veteranChance = 90;
    }

    // Если есть сталкерские (стартовый кейс)
    if (stalker.length > 0) {
      stalkerChance = 85;
      veteranChance = 15;
      masterChance = 0;
      legendaryChance = 0;
    }

    // Функция для распределения шансов с учетом цены
    const distributeChances = async (itemsList: any[], totalChance: number) => {
      if (itemsList.length === 0) return;

      // Инвертируем цены для весов (дорогие реже)
      const maxPrice = Math.max(...itemsList.map(i => i.item.basePrice));
      const minPrice = Math.min(...itemsList.map(i => i.item.basePrice));
      const priceRange = maxPrice - minPrice;

      const weights = itemsList.map(i => {
        if (priceRange === 0) return 1;
        const normalizedPrice = (i.item.basePrice - minPrice) / priceRange;
        // Дорогие предметы в 5 раз реже
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

    await distributeChances(legendary, legendaryChance);
    await distributeChances(master, masterChance);
    await distributeChances(veteran, veteranChance);
    await distributeChances(stalker, stalkerChance);

    // Проверяем результат
    const updatedItems = await prisma.caseItem.findMany({
      where: { caseId: caseItem.id },
      include: { item: true },
    });

    const totalChance = updatedItems.reduce((sum, i) => sum + i.dropChance, 0);
    const expectedValue = updatedItems.reduce((sum, i) => {
      return sum + (i.item.basePrice * i.dropChance / 100);
    }, 0);
    const rtp = (expectedValue / caseItem.price) * 100;

    console.log(`Total chance: ${totalChance.toFixed(2)}%`);
    console.log(`Expected value: ${expectedValue.toFixed(2)}₽`);
    console.log(`RTP: ${rtp.toFixed(2)}%`);

    // Показываем распределение по редкости
    const rarityStats = {
      LEGENDARY: { count: 0, totalChance: 0 },
      MASTER: { count: 0, totalChance: 0 },
      VETERAN: { count: 0, totalChance: 0 },
      STALKER: { count: 0, totalChance: 0 },
    };

    updatedItems.forEach(i => {
      if (rarityStats[i.item.rarity]) {
        rarityStats[i.item.rarity].count++;
        rarityStats[i.item.rarity].totalChance += i.dropChance;
      }
    });

    console.log('\nRarity distribution:');
    Object.entries(rarityStats).forEach(([rarity, stats]) => {
      if (stats.count > 0) {
        console.log(`  ${rarity}: ${stats.count} items, ${stats.totalChance.toFixed(2)}% total`);
      }
    });

    // Топ-3 самых дорогих и их шансы
    console.log('\nTop 3 most expensive items:');
    updatedItems
      .sort((a, b) => b.item.basePrice - a.item.basePrice)
      .slice(0, 3)
      .forEach(i => {
        console.log(`  ${i.item.name} (${i.item.rarity}): ${i.item.basePrice.toFixed(2)}₽ - ${i.dropChance.toFixed(4)}%`);
      });
  }

  console.log('\n✓ All cases updated with hard chances!');
}

setHardChances()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
