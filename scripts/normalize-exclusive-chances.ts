import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function normalizeChances() {
  try {
    console.log('⚖️ Нормализация шансов в эксклюзивном кейсе...');

    // Находим эксклюзивный кейс
    const exclusiveCase = await prisma.case.findFirst({
      where: { name: 'Эксклюзивный кейс' },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!exclusiveCase) {
      console.error('❌ Эксклюзивный кейс не найден');
      return;
    }

    // Правильное распределение шансов (сумма = 100%)
    const newChances = [
      { rarity: 'LEGENDARY', baseChance: 0.5 },  // Легендарные: очень редкие
      { rarity: 'MASTER', baseChance: 2.5 },     // Мастерские: редкие
      { rarity: 'VETERAN', baseChance: 10 },     // Ветеранские: обычные
    ];

    // Группируем предметы по редкости
    const itemsByRarity: Record<string, any[]> = {
      LEGENDARY: [],
      MASTER: [],
      VETERAN: [],
    };

    exclusiveCase.items.forEach((ci) => {
      if (itemsByRarity[ci.item.rarity]) {
        itemsByRarity[ci.item.rarity].push(ci);
      }
    });

    console.log('\n📊 Распределение предметов:');
    console.log(`   Легендарные: ${itemsByRarity.LEGENDARY.length}`);
    console.log(`   Мастерские: ${itemsByRarity.MASTER.length}`);
    console.log(`   Ветеранские: ${itemsByRarity.VETERAN.length}`);

    // Обновляем шансы
    for (const rarityConfig of newChances) {
      const items = itemsByRarity[rarityConfig.rarity];
      if (items && items.length > 0) {
        const chancePerItem = rarityConfig.baseChance / items.length;
        
        console.log(`\n🎲 ${rarityConfig.rarity}: ${rarityConfig.baseChance}% / ${items.length} = ${chancePerItem.toFixed(2)}% на предмет`);
        
        for (const caseItem of items) {
          await prisma.caseItem.update({
            where: { id: caseItem.id },
            data: { dropChance: chancePerItem },
          });
          console.log(`   ✅ ${caseItem.item.name}: ${chancePerItem.toFixed(2)}%`);
        }
      }
    }

    // Получаем обновленную информацию
    const updatedCase = await prisma.case.findUnique({
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

    console.log('\n🎉 Шансы нормализованы!');
    console.log('📋 Обновленное содержимое:');
    
    let totalChance = 0;
    const byRarity: Record<string, number> = {};
    
    updatedCase?.items.forEach((ci) => {
      console.log(`   - ${ci.item.name} (${ci.item.rarity}) - ${ci.dropChance.toFixed(2)}% - ${ci.item.basePrice} ₽`);
      totalChance += ci.dropChance;
      byRarity[ci.item.rarity] = (byRarity[ci.item.rarity] || 0) + ci.dropChance;
    });
    
    console.log(`\n📊 Статистика шансов:`);
    console.log(`   Легендарные: ${byRarity.LEGENDARY?.toFixed(2) || 0}%`);
    console.log(`   Мастерские: ${byRarity.MASTER?.toFixed(2) || 0}%`);
    console.log(`   Ветеранские: ${byRarity.VETERAN?.toFixed(2) || 0}%`);
    console.log(`   Общий шанс: ${totalChance.toFixed(2)}%`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

normalizeChances();
