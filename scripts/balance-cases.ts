import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function balanceCases() {
  console.log('Balancing cases for better RTP...\n');

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
    console.log(`\n=== ${caseItem.name} (${caseItem.price}₽) ===`);
    
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

    // Настройки для каждого кейса
    let legendaryChance = 0;
    let masterChance = 0;
    let veteranChance = 0;
    let stalkerChance = 0;
    let targetRTP = 0.7; // 70% окуп

    if (caseItem.name === 'Стартовый кейс') {
      // Стартовый: больше сталкерских, немного ветеранских
      stalkerChance = 85;
      veteranChance = 15;
      targetRTP = 1.0; // 100% окуп для новичков
    } else if (caseItem.name === 'Премиум кейс') {
      // Премиум: больше ветеранских, немного мастерских, редко легендарные
      veteranChance = 70;
      masterChance = 29.5;
      legendaryChance = 0.5;
      targetRTP = 0.75; // 75% окуп
    } else if (caseItem.name === 'Легендарный кейс') {
      // Легендарный: больше мастерских, немного ветеранских, легендарные реже
      veteranChance = 30;
      masterChance = 68;
      legendaryChance = 2;
      targetRTP = 0.8; // 80% окуп
    }

    // Функция для распределения шансов с учетом цены
    const distributeChances = async (itemsList: any[], totalChance: number) => {
      if (itemsList.length === 0) return;

      // Инвертируем цены для весов
      const maxPrice = Math.max(...itemsList.map(i => i.item.basePrice));
      const minPrice = Math.min(...itemsList.map(i => i.item.basePrice));
      const priceRange = maxPrice - minPrice;

      const weights = itemsList.map(i => {
        // Чем дороже - тем меньше вес (но не слишком мало)
        if (priceRange === 0) return 1;
        const normalizedPrice = (i.item.basePrice - minPrice) / priceRange;
        return 1 - (normalizedPrice * 0.7); // Дорогие предметы в 3 раза реже
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
    console.log(`RTP: ${rtp.toFixed(2)}% (target: ${targetRTP * 100}%)`);

    // Топ предметы
    console.log('\nTop 5 items by price:');
    updatedItems
      .sort((a, b) => b.item.basePrice - a.item.basePrice)
      .slice(0, 5)
      .forEach(i => {
        console.log(`  ${i.item.name} (${i.item.rarity}): ${i.item.basePrice.toFixed(2)}₽ - ${i.dropChance.toFixed(4)}%`);
      });

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
        console.log(`  ${rarity}: ${stats.count} items, ${stats.totalChance.toFixed(2)}% total chance`);
      }
    });
  }

  console.log('\n✓ All cases balanced!');
}

balanceCases()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
