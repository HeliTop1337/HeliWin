import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fillAllCases() {
  try {
    console.log('📦 Заполняю все кейсы STALCRAFT X предметами...\n');

    // Получаем предметы по редкости
    const legendary = await prisma.item.findMany({ where: { rarity: 'LEGENDARY' } });
    const master = await prisma.item.findMany({ where: { rarity: 'MASTER' } });
    const veteran = await prisma.item.findMany({ where: { rarity: 'VETERAN' } });
    const stalker = await prisma.item.findMany({ where: { rarity: 'STALKER' } });

    console.log(`📊 Статистика предметов:`);
    console.log(`   LEGENDARY: ${legendary.length}`);
    console.log(`   MASTER: ${master.length}`);
    console.log(`   VETERAN: ${veteran.length}`);
    console.log(`   STALKER: ${stalker.length}\n`);

    // Стартовый кейс - только STALKER предметы
    const starterCase = await prisma.case.findFirst({ where: { name: 'Стартовый кейс' } });
    if (starterCase) {
      await prisma.caseItem.deleteMany({ where: { caseId: starterCase.id } });
      const items = stalker.slice(0, 20);
      for (const item of items) {
        await prisma.caseItem.create({
          data: {
            caseId: starterCase.id,
            itemId: item.id,
            dropChance: 100 / items.length
          }
        });
      }
      console.log(`✅ Стартовый кейс: ${items.length} предметов (STALKER)`);
    }

    // Премиум кейс - STALKER + VETERAN
    const premiumCase = await prisma.case.findFirst({ where: { name: 'Премиум кейс' } });
    if (premiumCase) {
      await prisma.caseItem.deleteMany({ where: { caseId: premiumCase.id } });
      const items = [
        ...veteran.slice(0, 10).map(i => ({ item: i, weight: 2 })),
        ...stalker.slice(0, 15).map(i => ({ item: i, weight: 5 }))
      ];
      const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
      for (const { item, weight } of items) {
        await prisma.caseItem.create({
          data: {
            caseId: premiumCase.id,
            itemId: item.id,
            dropChance: (weight / totalWeight) * 100
          }
        });
      }
      console.log(`✅ Премиум кейс: ${items.length} предметов (VETERAN + STALKER)`);
    }

    // Легендарный кейс - уже заполнен, проверим
    const legendaryCase = await prisma.case.findFirst({ 
      where: { name: 'Легендарный кейс' },
      include: { items: true }
    });
    if (legendaryCase) {
      console.log(`✅ Легендарный кейс: ${legendaryCase.items.length} предметов (LEGENDARY + MASTER)`);
    }

    // Эксклюзивный кейс - уже заполнен, проверим
    const exclusiveCase = await prisma.case.findFirst({ 
      where: { name: 'Эксклюзивный кейс' },
      include: { items: true }
    });
    if (exclusiveCase) {
      console.log(`✅ Эксклюзивный кейс: ${exclusiveCase.items.length} предметов (MIX)`);
    }

    console.log('\n🎮 Все кейсы заполнены STALCRAFT X предметами!');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fillAllCases();
