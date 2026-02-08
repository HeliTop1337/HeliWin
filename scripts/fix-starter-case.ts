import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStarterCase() {
  try {
    const starterCase = await prisma.case.findFirst({
      where: { name: 'Стартовый кейс' }
    });

    if (!starterCase) {
      console.log('❌ Стартовый кейс не найден');
      return;
    }

    // Получаем все сталкерские предметы
    const stalkerItems = await prisma.item.findMany({
      where: { rarity: 'STALKER' }
    });

    console.log(`📋 Найдено сталкерских предметов: ${stalkerItems.length}`);

    // Группируем по категориям
    const weapons = stalkerItems.filter(i => 
      i.category.includes('винтовка') || 
      i.category.includes('автомат') ||
      i.category.includes('пистолет') ||
      i.category.includes('дробовик') ||
      i.category.includes('карабин')
    );
    
    const gear = stalkerItems.filter(i => 
      i.name.includes('Бронежилет') ||
      i.name.includes('Шлем') ||
      i.name.includes('Куртка') ||
      i.name.includes('Рюкзак')
    );

    const tools = stalkerItems.filter(i =>
      i.name.includes('Детектор') ||
      i.name.includes('Компас') ||
      i.name.includes('Фонарь')
    );

    const consumables = stalkerItems.filter(i =>
      i.name.includes('Аптечка') ||
      i.name.includes('Граната') ||
      i.name.includes('Патроны')
    );

    const other = stalkerItems.filter(i =>
      i.name.includes('Нож') ||
      i.name.includes('Пистолет')
    );

    console.log(`\n📊 Распределение:`);
    console.log(`   Оружие: ${weapons.length}`);
    console.log(`   Броня/одежда: ${gear.length}`);
    console.log(`   Инструменты: ${tools.length}`);
    console.log(`   Расходники: ${consumables.length}`);
    console.log(`   Прочее: ${other.length}`);

    // Очищаем кейс
    await prisma.caseItem.deleteMany({
      where: { caseId: starterCase.id }
    });

    // Добавляем разнообразные предметы
    const items = [
      ...weapons.slice(0, 12).map(i => ({ item: i, weight: 3 })),
      ...gear.map(i => ({ item: i, weight: 2 })),
      ...tools.map(i => ({ item: i, weight: 1.5 })),
      ...consumables.map(i => ({ item: i, weight: 4 })),
      ...other.map(i => ({ item: i, weight: 2 }))
    ];

    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);

    for (const { item, weight } of items) {
      await prisma.caseItem.create({
        data: {
          caseId: starterCase.id,
          itemId: item.id,
          dropChance: (weight / totalWeight) * 100
        }
      });
    }

    console.log(`\n✅ Добавлено ${items.length} предметов в Стартовый кейс`);

    // Показываем результат
    const result = await prisma.caseItem.findMany({
      where: { caseId: starterCase.id },
      include: { item: true }
    });

    console.log('\n📦 Стартовый кейс теперь содержит:');
    const byCategory = {
      'Оружие': result.filter(i => weapons.find(w => w.id === i.item.id)),
      'Броня': result.filter(i => gear.find(g => g.id === i.item.id)),
      'Инструменты': result.filter(i => tools.find(t => t.id === i.item.id)),
      'Расходники': result.filter(i => consumables.find(c => c.id === i.item.id)),
      'Прочее': result.filter(i => other.find(o => o.id === i.item.id))
    };

    for (const [category, items] of Object.entries(byCategory)) {
      if (items.length > 0) {
        const totalChance = items.reduce((sum, i) => sum + i.dropChance, 0);
        console.log(`\n🎯 ${category} (${items.length} шт, ${totalChance.toFixed(2)}%):`);
        items.forEach(ci => {
          console.log(`   ${ci.dropChance.toFixed(2)}% - ${ci.item.name}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStarterCase();
