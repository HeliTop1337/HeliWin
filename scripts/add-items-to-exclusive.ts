import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addItemsToExclusive() {
  try {
    console.log('🎁 Добавление предметов в эксклюзивный кейс...');

    // Находим эксклюзивный кейс
    const exclusiveCase = await prisma.case.findFirst({
      where: { name: 'Эксклюзивный кейс' },
    });

    if (!exclusiveCase) {
      console.error('❌ Эксклюзивный кейс не найден');
      return;
    }

    console.log('✅ Найден кейс:', exclusiveCase.name);

    // Создаем дополнительные предметы
    const newItems = [
      // Легендарные предметы
      {
        name: 'Золотой Desert Eagle',
        category: 'Оружие',
        icon: '🔫',
        rarity: 'LEGENDARY',
        basePrice: 8000,
        dropChance: 3,
      },
      {
        name: 'Легендарный Экзоскелет "Титан"',
        category: 'Броня',
        icon: '🛡️',
        rarity: 'LEGENDARY',
        basePrice: 9500,
        dropChance: 2,
      },
      {
        name: 'Артефакт "Звезда Зоны"',
        category: 'Артефакт',
        icon: '⭐',
        rarity: 'LEGENDARY',
        basePrice: 12000,
        dropChance: 1,
      },
      {
        name: 'Легендарный ПКМ',
        category: 'Оружие',
        icon: '🔫',
        rarity: 'LEGENDARY',
        basePrice: 7500,
        dropChance: 4,
      },
      // Мастерские предметы
      {
        name: 'Мастерский Снайпер SVD',
        category: 'Оружие',
        icon: '🎯',
        rarity: 'MASTER',
        basePrice: 3500,
        dropChance: 10,
      },
      {
        name: 'Мастерский Бронежилет "Страж"',
        category: 'Броня',
        icon: '🦺',
        rarity: 'MASTER',
        basePrice: 3000,
        dropChance: 12,
      },
      {
        name: 'Мастерский Детектор "Эхо"',
        category: 'Оборудование',
        icon: '📡',
        rarity: 'MASTER',
        basePrice: 2800,
        dropChance: 13,
      },
      {
        name: 'Мастерский АК-74М',
        category: 'Оружие',
        icon: '🔫',
        rarity: 'MASTER',
        basePrice: 3200,
        dropChance: 11,
      },
      // Ветеранские предметы
      {
        name: 'Ветеранский MP5',
        category: 'Оружие',
        icon: '🔫',
        rarity: 'VETERAN',
        basePrice: 1500,
        dropChance: 15,
      },
      {
        name: 'Ветеранский Шлем "Сфера"',
        category: 'Броня',
        icon: '⛑️',
        rarity: 'VETERAN',
        basePrice: 1300,
        dropChance: 16,
      },
      {
        name: 'Ветеранский Рюкзак',
        category: 'Оборудование',
        icon: '🎒',
        rarity: 'VETERAN',
        basePrice: 1200,
        dropChance: 13,
      },
    ];

    console.log(`📦 Создание ${newItems.length} новых предметов...`);

    for (const itemData of newItems) {
      // Проверяем, существует ли предмет
      const existingItem = await prisma.item.findFirst({
        where: { name: itemData.name },
      });

      let item;
      if (existingItem) {
        console.log(`⚠️ Предмет "${itemData.name}" уже существует, используем его`);
        item = existingItem;
      } else {
        // Создаем новый предмет
        item = await prisma.item.create({
          data: {
            name: itemData.name,
            category: itemData.category,
            icon: itemData.icon,
            rarity: itemData.rarity,
            basePrice: itemData.basePrice,
            isActive: true,
          },
        });
        console.log(`✅ Создан предмет: ${item.name} (${item.rarity}) - ${item.basePrice} ₽`);
      }

      // Проверяем, есть ли уже этот предмет в кейсе
      const existingCaseItem = await prisma.caseItem.findFirst({
        where: {
          caseId: exclusiveCase.id,
          itemId: item.id,
        },
      });

      if (!existingCaseItem) {
        // Добавляем предмет в кейс
        await prisma.caseItem.create({
          data: {
            caseId: exclusiveCase.id,
            itemId: item.id,
            dropChance: itemData.dropChance,
          },
        });
        console.log(`   ➕ Добавлен в кейс с шансом ${itemData.dropChance}%`);
      } else {
        console.log(`   ⚠️ Предмет уже в кейсе`);
      }
    }

    // Получаем полную информацию о кейсе
    const fullCase = await prisma.case.findUnique({
      where: { id: exclusiveCase.id },
      include: {
        items: {
          include: {
            item: true,
          },
          orderBy: {
            item: {
              basePrice: 'desc',
            },
          },
        },
      },
    });

    console.log('\n🎉 Эксклюзивный кейс обновлен!');
    console.log('📋 Информация:');
    console.log(`   Название: ${fullCase?.name}`);
    console.log(`   Цена: ${fullCase?.price} ₽`);
    console.log(`   Предметов: ${fullCase?.items.length}`);
    console.log('\n📦 Полное содержимое:');
    
    let totalChance = 0;
    fullCase?.items.forEach((ci) => {
      console.log(`   - ${ci.item.name} (${ci.item.rarity}) - ${ci.dropChance}% - ${ci.item.basePrice} ₽`);
      totalChance += ci.dropChance;
    });
    
    console.log(`\n📊 Общий шанс: ${totalChance}%`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addItemsToExclusive();
