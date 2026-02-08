import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function convertToStalcraft() {
  try {
    console.log('🎮 Начинаю конвертацию в STALCRAFT X тематику...\n');

    // 1. Удаляем CS:GO предметы
    console.log('1️⃣ Удаление CS:GO предметов...');
    const csgoItems = await prisma.item.findMany({
      where: {
        OR: [
          { name: { contains: 'Desert Eagle' } },
          { name: { contains: 'Karambit' } },
          { name: { contains: 'Butterfly' } }
        ]
      }
    });
    
    for (const item of csgoItems) {
      await prisma.caseItem.deleteMany({ where: { itemId: item.id } });
      await prisma.item.delete({ where: { id: item.id } });
      console.log(`   ❌ Удален: ${item.name}`);
    }

    // 2. Получаем все кейсы
    const cases = await prisma.case.findMany();
    console.log(`\n2️⃣ Найдено кейсов: ${cases.length}`);

    for (const caseItem of cases) {
      console.log(`\n📦 Обрабатываю кейс: ${caseItem.name}`);
      
      // Очищаем текущие предметы
      await prisma.caseItem.deleteMany({ where: { caseId: caseItem.id } });

      let items: any[] = [];
      
      // Распределяем предметы по кейсам в зависимости от названия
      if (caseItem.name.includes('Легендарный')) {
        // Легендарный кейс - только LEGENDARY и MASTER
        const legendary = await prisma.item.findMany({
          where: { rarity: 'LEGENDARY' },
          take: 8
        });
        const master = await prisma.item.findMany({
          where: { rarity: 'MASTER' },
          take: 12
        });
        items = [
          ...legendary.map(i => ({ item: i, chance: 0.5 })),
          ...master.map(i => ({ item: i, chance: 4.0 }))
        ];
      } 
      else if (caseItem.name.includes('Мастерский')) {
        // Мастерский кейс - MASTER и VETERAN
        const master = await prisma.item.findMany({
          where: { rarity: 'MASTER' },
          take: 10
        });
        const veteran = await prisma.item.findMany({
          where: { rarity: 'VETERAN' },
          take: 15
        });
        items = [
          ...master.map(i => ({ item: i, chance: 2.0 })),
          ...veteran.map(i => ({ item: i, chance: 5.2 }))
        ];
      }
      else if (caseItem.name.includes('Ветеранский')) {
        // Ветеранский кейс - VETERAN и STALKER
        const veteran = await prisma.item.findMany({
          where: { rarity: 'VETERAN' },
          take: 12
        });
        const stalker = await prisma.item.findMany({
          where: { rarity: 'STALKER' },
          take: 18
        });
        items = [
          ...veteran.map(i => ({ item: i, chance: 1.5 })),
          ...stalker.map(i => ({ item: i, chance: 4.8 }))
        ];
      }
      else if (caseItem.name.includes('Сталкерский')) {
        // Сталкерский кейс - только STALKER
        const stalker = await prisma.item.findMany({
          where: { rarity: 'STALKER' },
          take: 25
        });
        items = stalker.map(i => ({ item: i, chance: 4.0 }));
      }
      else if (caseItem.name.includes('Эксклюзивный')) {
        // Эксклюзивный кейс - микс всех редкостей
        const legendary = await prisma.item.findMany({
          where: { rarity: 'LEGENDARY' },
          take: 5
        });
        const master = await prisma.item.findMany({
          where: { rarity: 'MASTER' },
          take: 8
        });
        const veteran = await prisma.item.findMany({
          where: { rarity: 'VETERAN' },
          take: 10
        });
        items = [
          ...legendary.map(i => ({ item: i, chance: 0.3 })),
          ...master.map(i => ({ item: i, chance: 1.5 })),
          ...veteran.map(i => ({ item: i, chance: 4.0 }))
        ];
      }

      // Нормализуем шансы до 100%
      const totalChance = items.reduce((sum, i) => sum + i.chance, 0);
      const normalized = items.map(i => ({
        ...i,
        chance: (i.chance / totalChance) * 100
      }));

      // Добавляем предметы в кейс
      for (const { item, chance } of normalized) {
        await prisma.caseItem.create({
          data: {
            caseId: caseItem.id,
            itemId: item.id,
            dropChance: chance
          }
        });
      }

      console.log(`   ✅ Добавлено ${items.length} предметов`);
    }

    console.log('\n✅ Конвертация завершена!');
    console.log('🎮 Все кейсы теперь содержат только STALCRAFT X предметы');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

convertToStalcraft();
