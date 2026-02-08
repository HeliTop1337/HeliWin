import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeStalkerItems() {
  try {
    // Находим Эксклюзивный кейс
    const exclusiveCase = await prisma.case.findFirst({
      where: { name: 'Эксклюзивный кейс' }
    });

    if (!exclusiveCase) {
      console.log('❌ Эксклюзивный кейс не найден');
      return;
    }

    // Находим все сталкерские предметы
    const stalkerItems = await prisma.item.findMany({
      where: {
        name: {
          contains: 'Сталкерск'
        }
      }
    });

    console.log(`📋 Найдено сталкерских предметов: ${stalkerItems.length}`);

    // Удаляем связи между кейсом и сталкерскими предметами
    const deleted = await prisma.caseItem.deleteMany({
      where: {
        caseId: exclusiveCase.id,
        itemId: {
          in: stalkerItems.map(item => item.id)
        }
      }
    });

    console.log(`✅ Удалено ${deleted.count} сталкерских предметов из Эксклюзивного кейса`);

    // Показываем оставшиеся предметы
    const remainingItems = await prisma.caseItem.findMany({
      where: { caseId: exclusiveCase.id },
      include: { item: true }
    });

    console.log(`\n📦 Осталось предметов в кейсе: ${remainingItems.length}`);
    remainingItems.forEach(ci => {
      console.log(`- ${ci.item.name} (${ci.item.rarity}) - ${ci.dropChance}%`);
    });

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeStalkerItems();
