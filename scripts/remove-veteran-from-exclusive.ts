import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeVeteranFromExclusive() {
  try {
    // Находим Эксклюзивный кейс
    const exclusiveCase = await prisma.case.findFirst({
      where: { name: 'Эксклюзивный кейс' }
    });

    if (!exclusiveCase) {
      console.log('❌ Эксклюзивный кейс не найден');
      return;
    }

    // Удаляем все ветеранские предметы
    const deleted = await prisma.caseItem.deleteMany({
      where: {
        caseId: exclusiveCase.id,
        item: {
          rarity: 'VETERAN'
        }
      }
    });

    console.log(`✅ Удалено ${deleted.count} ветеранских предметов`);

    // Добавляем больше легендарных и мастерских предметов
    const legendary = await prisma.item.findMany({
      where: { rarity: 'LEGENDARY' }
    });
    const master = await prisma.item.findMany({
      where: { rarity: 'MASTER' },
      take: 20
    });

    // Очищаем кейс полностью
    await prisma.caseItem.deleteMany({
      where: { caseId: exclusiveCase.id }
    });

    // Добавляем новые предметы
    const items = [
      ...legendary.map(i => ({ item: i, weight: 1 })),
      ...master.map(i => ({ item: i, weight: 10 }))
    ];

    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    
    for (const { item, weight } of items) {
      await prisma.caseItem.create({
        data: {
          caseId: exclusiveCase.id,
          itemId: item.id,
          dropChance: (weight / totalWeight) * 100
        }
      });
    }

    console.log(`✅ Добавлено ${items.length} предметов (${legendary.length} LEGENDARY + ${master.length} MASTER)`);

    // Показываем результат
    const result = await prisma.caseItem.findMany({
      where: { caseId: exclusiveCase.id },
      include: { item: true },
      orderBy: { dropChance: 'asc' }
    });

    console.log('\n📦 Эксклюзивный кейс теперь содержит:');
    const byRarity = {
      LEGENDARY: result.filter(i => i.item.rarity === 'LEGENDARY'),
      MASTER: result.filter(i => i.item.rarity === 'MASTER')
    };

    for (const [rarity, items] of Object.entries(byRarity)) {
      const totalChance = items.reduce((sum, i) => sum + i.dropChance, 0);
      console.log(`\n🎯 ${rarity} (${items.length} шт, ${totalChance.toFixed(2)}%):`);
      items.slice(0, 5).forEach(ci => {
        console.log(`   ${ci.dropChance.toFixed(2)}% - ${ci.item.name}`);
      });
      if (items.length > 5) {
        console.log(`   ... и еще ${items.length - 5} предметов`);
      }
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeVeteranFromExclusive();
