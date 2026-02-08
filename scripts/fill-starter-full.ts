import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fillStarterFull() {
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

    console.log(`📋 Всего сталкерских предметов: ${stalkerItems.length}`);

    // Очищаем кейс
    await prisma.caseItem.deleteMany({
      where: { caseId: starterCase.id }
    });

    // Берем все предметы
    const items = stalkerItems.map(i => ({ item: i, weight: 1 }));
    const totalWeight = items.length;

    for (const { item } of items) {
      await prisma.caseItem.create({
        data: {
          caseId: starterCase.id,
          itemId: item.id,
          dropChance: (1 / totalWeight) * 100
        }
      });
    }

    console.log(`✅ Добавлено ${items.length} предметов в Стартовый кейс`);
    console.log(`📊 Каждый предмет имеет шанс ${(100 / items.length).toFixed(2)}%`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fillStarterFull();
