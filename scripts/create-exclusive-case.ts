import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createExclusiveCase() {
  try {
    console.log('🎁 Создание эксклюзивного кейса...');

    // Создаем кейс
    const exclusiveCase = await prisma.case.create({
      data: {
        name: 'Эксклюзивный кейс',
        description: 'Премиум кейс с редчайшими легендарными предметами',
        price: 1000,
        discount: 0,
        icon: '🎁',
        isActive: true,
      },
    });

    console.log('✅ Кейс создан:', exclusiveCase.name, '-', exclusiveCase.price, '₽');

    // Получаем все легендарные предметы
    const legendaryItems = await prisma.item.findMany({
      where: { rarity: 'LEGENDARY' },
    });

    console.log(`📦 Найдено ${legendaryItems.length} легендарных предметов`);

    if (legendaryItems.length === 0) {
      console.log('⚠️ Легендарные предметы не найдены. Создаем...');
      
      // Создаем легендарные предметы
      const newItems = await Promise.all([
        prisma.item.create({
          data: {
            name: 'Золотой АК-47',
            category: 'Оружие',
            icon: '🔫',
            rarity: 'LEGENDARY',
            basePrice: 5000,
            isActive: true,
          },
        }),
        prisma.item.create({
          data: {
            name: 'Легендарный Экзоскелет',
            category: 'Броня',
            icon: '🛡️',
            rarity: 'LEGENDARY',
            basePrice: 4500,
            isActive: true,
          },
        }),
        prisma.item.create({
          data: {
            name: 'Артефакт "Сердце Зоны"',
            category: 'Артефакт',
            icon: '💎',
            rarity: 'LEGENDARY',
            basePrice: 6000,
            isActive: true,
          },
        }),
        prisma.item.create({
          data: {
            name: 'Легендарный Детектор',
            category: 'Оборудование',
            icon: '📡',
            rarity: 'LEGENDARY',
            basePrice: 3500,
            isActive: true,
          },
        }),
        prisma.item.create({
          data: {
            name: 'Мастерский Снайпер',
            category: 'Оружие',
            icon: '🎯',
            rarity: 'MASTER',
            basePrice: 2500,
            isActive: true,
          },
        }),
        prisma.item.create({
          data: {
            name: 'Мастерский Бронежилет',
            category: 'Броня',
            icon: '🦺',
            rarity: 'MASTER',
            basePrice: 2000,
            isActive: true,
          },
        }),
        prisma.item.create({
          data: {
            name: 'Ветеранский Автомат',
            category: 'Оружие',
            icon: '🔫',
            rarity: 'VETERAN',
            basePrice: 1200,
            isActive: true,
          },
        }),
        prisma.item.create({
          data: {
            name: 'Ветеранский Шлем',
            category: 'Броня',
            icon: '⛑️',
            rarity: 'VETERAN',
            basePrice: 1000,
            isActive: true,
          },
        }),
      ]);

      console.log(`✅ Создано ${newItems.length} новых предметов`);
      
      // Обновляем список легендарных предметов
      const allItems = await prisma.item.findMany({
        where: {
          rarity: {
            in: ['LEGENDARY', 'MASTER', 'VETERAN'],
          },
        },
      });

      // Добавляем предметы в кейс с шансами
      const caseItems = [];
      
      for (const item of allItems) {
        let dropChance = 0;
        
        if (item.rarity === 'LEGENDARY') {
          dropChance = 5; // 5% шанс на легендарные
        } else if (item.rarity === 'MASTER') {
          dropChance = 15; // 15% шанс на мастерские
        } else if (item.rarity === 'VETERAN') {
          dropChance = 30; // 30% шанс на ветеранские
        }

        caseItems.push(
          prisma.caseItem.create({
            data: {
              caseId: exclusiveCase.id,
              itemId: item.id,
              dropChance,
            },
          })
        );
      }

      await Promise.all(caseItems);
      console.log(`✅ Добавлено ${caseItems.length} предметов в кейс`);
    } else {
      // Добавляем существующие легендарные предметы
      const caseItems = [];
      
      for (const item of legendaryItems) {
        caseItems.push(
          prisma.caseItem.create({
            data: {
              caseId: exclusiveCase.id,
              itemId: item.id,
              dropChance: 10, // 10% шанс на каждый легендарный предмет
            },
          })
        );
      }

      await Promise.all(caseItems);
      console.log(`✅ Добавлено ${caseItems.length} предметов в кейс`);
    }

    // Получаем полную информацию о кейсе
    const fullCase = await prisma.case.findUnique({
      where: { id: exclusiveCase.id },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    console.log('\n🎉 Эксклюзивный кейс успешно создан!');
    console.log('📋 Информация:');
    console.log(`   Название: ${fullCase?.name}`);
    console.log(`   Цена: ${fullCase?.price} ₽`);
    console.log(`   Предметов: ${fullCase?.items.length}`);
    console.log('\n📦 Содержимое:');
    fullCase?.items.forEach((ci) => {
      console.log(`   - ${ci.item.name} (${ci.item.rarity}) - ${ci.dropChance}% шанс - ${ci.item.basePrice} ₽`);
    });

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createExclusiveCase();
