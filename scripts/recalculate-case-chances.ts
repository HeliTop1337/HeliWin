import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function recalculateCaseChances() {
  console.log('Recalculating case drop chances based on item prices...\n');

  // Получаем все кейсы
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
      console.log('No items in case, skipping...');
      continue;
    }

    // Группируем по редкости
    const legendary = items.filter(i => i.item.rarity === 'LEGENDARY');
    const master = items.filter(i => i.item.rarity === 'MASTER');
    const veteran = items.filter(i => i.item.rarity === 'VETERAN');
    const stalker = items.filter(i => i.item.rarity === 'STALKER');

    console.log(`Items: Legendary(${legendary.length}), Master(${master.length}), Veteran(${veteran.length}), Stalker(${stalker.length})`);

    // Базовые шансы по редкости
    let legendaryChance = 0.01; // 0.01%
    let masterChance = 19.99;   // ~20%
    let veteranChance = 80;     // 80%
    let stalkerChance = 0;      // 0% (если есть)

    // Если нет легендарных, перераспределяем
    if (legendary.length === 0) {
      masterChance = 20;
      veteranChance = 80;
    }

    // Если есть сталкерские
    if (stalker.length > 0) {
      stalkerChance = 5;
      veteranChance = 75;
    }

    // Рассчитываем шансы для каждого предмета внутри редкости на основе цены
    // Чем дороже предмет - тем меньше шанс
    
    const updateChances = async (itemsList: any[], totalChance: number) => {
      if (itemsList.length === 0) return;

      // Инвертируем цены (чем дороже - тем меньше вес)
      const maxPrice = Math.max(...itemsList.map(i => i.item.basePrice));
      const weights = itemsList.map(i => {
        // Инвертированный вес: дорогие предметы получают меньший вес
        return maxPrice - i.item.basePrice + 1;
      });

      const totalWeight = weights.reduce((sum, w) => sum + w, 0);

      // Распределяем шанс пропорционально весам
      for (let i = 0; i < itemsList.length; i++) {
        const chance = (weights[i] / totalWeight) * totalChance;
        await prisma.caseItem.update({
          where: { id: itemsList[i].id },
          data: { dropChance: Math.round(chance * 10000) / 10000 },
        });
      }
    };

    await updateChances(legendary, legendaryChance);
    await updateChances(master, masterChance);
    await updateChances(veteran, veteranChance);
    await updateChances(stalker, stalkerChance);

    // Проверяем сумму
    const updatedItems = await prisma.caseItem.findMany({
      where: { caseId: caseItem.id },
      include: { item: true },
    });

    const totalChance = updatedItems.reduce((sum, i) => sum + i.dropChance, 0);
    console.log(`Total chance: ${totalChance.toFixed(4)}%`);

    // Рассчитываем ожидаемую стоимость
    const expectedValue = updatedItems.reduce((sum, i) => {
      return sum + (i.item.basePrice * i.dropChance / 100);
    }, 0);

    const rtp = (expectedValue / caseItem.price) * 100;
    console.log(`Expected value: ${expectedValue.toFixed(2)}₽`);
    console.log(`RTP (Return to Player): ${rtp.toFixed(2)}%`);

    // Показываем топ-5 самых дорогих предметов и их шансы
    const topItems = updatedItems
      .sort((a, b) => b.item.basePrice - a.item.basePrice)
      .slice(0, 5);
    
    console.log('\nTop 5 most expensive items:');
    topItems.forEach(i => {
      console.log(`  ${i.item.name} (${i.item.rarity}): ${i.item.basePrice}₽ - ${i.dropChance.toFixed(4)}%`);
    });
  }

  console.log('\n✓ All cases updated!');
}

recalculateCaseChances()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
