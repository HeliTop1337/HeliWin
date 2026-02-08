import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addStalkerItems() {
  try {
    console.log('🎯 Добавление сталкерских предметов...');

    const exclusiveCase = await prisma.case.findFirst({
      where: { name: 'Эксклюзивный кейс' },
    });

    if (!exclusiveCase) {
      console.error('❌ Эксклюзивный кейс не найден');
      return;
    }

    // Создаем сталкерские предметы
    const stalkerItems = [
      { name: 'Сталкерский ПМ', category: 'Оружие', icon: '🔫', basePrice: 500 },
      { name: 'Сталкерский АК-74', category: 'Оружие', icon: '🔫', basePrice: 600 },
      { name: 'Сталкерский Дробовик', category: 'Оружие', icon: '🔫', basePrice: 550 },
      { name: 'Сталкерский Пистолет', category: 'Оружие', icon: '🔫', basePrice: 450 },
      { name: 'Сталкерская Куртка', category: 'Броня', icon: '🧥', basePrice: 400 },
      { name: 'Сталкерский Шлем', category: 'Броня', icon: '⛑️', basePrice: 420 },
      { name: 'Сталкерский Бронежилет', category: 'Броня', icon: '🦺', basePrice: 480 },
      { name: 'Сталкерский Рюкзак', category: 'Оборудование', icon: '🎒', basePrice: 380 },
      { name: 'Сталкерский Детектор', category: 'Оборудование', icon: '📡', basePrice: 520 },
      { name: 'Сталкерский Нож', category: 'Оружие', icon: '🔪', basePrice: 350 },
      { name: 'Сталкерские Патроны', category: 'Боеприпасы', icon: '💊', basePrice: 300 },
      { name: 'Сталкерская Аптечка', category: 'Медикаменты', icon: '💉', basePrice: 320 },
      { name: 'Сталкерский Фонарь', category: 'Оборудование', icon: '🔦', basePrice: 280 },
      { name: 'Сталкерский Компас', category: 'Оборудование', icon: '🧭', basePrice: 260 },
      { name: 'Сталкерская Граната', category: 'Взрывчатка', icon: '💣', basePrice: 580 },
    ];

    console.log(`📦 Создание ${stalkerItems.length} сталкерских предметов...`);

    const createdItems = [];
    for (const itemData of stalkerItems) {
      const existingItem = await prisma.item.findFirst({
        where: { name: itemData.name },
      });

      let item;
      if (existingItem) {
        item = existingItem;
        console.log(`⚠️ Предмет "${itemData.name}" уже существует`);
      } else {
        item = await prisma.item.create({
          data: {
            name: itemData.name,
            category: itemData.category,
            icon: itemData.icon,
            rarity: 'STALKER',
            basePrice: itemData.basePrice,
            isActive: true,
          },
        });
        console.log(`✅ Создан: ${item.name} - ${item.basePrice} ₽`);
      }

      createdItems.push(item);
    }

    // Добавляем в кейс с равными шансами
    const chancePerItem = 87 / createdItems.length; // Оставшиеся 87%
    
    console.log(`\n➕ Добавление в кейс с шансом ${chancePerItem.toFixed(2)}% на предмет...`);

    for (const item of createdItems) {
      const existingCaseItem = await prisma.caseItem.findFirst({
        where: {
          caseId: exclusiveCase.id,
          itemId: item.id,
        },
      });

      if (!existingCaseItem) {
        await prisma.caseItem.create({
          data: {
            caseId: exclusiveCase.id,
            itemId: item.id,
            dropChance: chancePerItem,
          },
        });
        console.log(`   ✅ ${item.name}: ${chancePerItem.toFixed(2)}%`);
      }
    }

    // Получаем финальную статистику
    const finalCase = await prisma.case.findUnique({
      where: { id: exclusiveCase.id },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    let totalChance = 0;
    const byRarity: Record<string, number> = {};
    
    finalCase?.items.forEach((ci) => {
      totalChance += ci.dropChance;
      byRarity[ci.item.rarity] = (byRarity[ci.item.rarity] || 0) + ci.dropChance;
    });

    console.log('\n🎉 Эксклюзивный кейс готов!');
    console.log('📋 Информация:');
    console.log(`   Название: ${finalCase?.name}`);
    console.log(`   Цена: ${finalCase?.price} ₽`);
    console.log(`   Всего предметов: ${finalCase?.items.length}`);
    console.log('\n📊 Распределение шансов:');
    console.log(`   Сталкерские: ${byRarity.STALKER?.toFixed(2) || 0}%`);
    console.log(`   Ветеранские: ${byRarity.VETERAN?.toFixed(2) || 0}%`);
    console.log(`   Мастерские: ${byRarity.MASTER?.toFixed(2) || 0}%`);
    console.log(`   Легендарные: ${byRarity.LEGENDARY?.toFixed(2) || 0}%`);
    console.log(`   Общий шанс: ${totalChance.toFixed(2)}%`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addStalkerItems();
