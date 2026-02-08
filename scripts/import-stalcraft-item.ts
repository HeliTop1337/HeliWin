import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// Маппинг редкости из Stalcraft в нашу систему
const rarityMap: Record<string, string> = {
  'common': 'STALKER',
  'uncommon': 'STALKER',
  'rare': 'VETERAN',
  'epic': 'MASTER',
  'legendary': 'LEGENDARY',
};

async function importItem(itemId: string, category: string = 'armor/combined') {
  try {
    console.log(`Importing item ${itemId}...`);

    // Правильный формат URL для иконок
    const imageUrl = `https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/global/icons/${category}/${itemId}.png`;
    const jsonUrl = `https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/global/items/${category}/${itemId}.json`;

    console.log(`Image URL: ${imageUrl}`);
    console.log(`JSON URL: ${jsonUrl}`);
    
    let itemData: any;
    try {
      const response = await fetch(jsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      itemData = await response.json();
    } catch (error) {
      console.error('Failed to fetch JSON, using manual data');
      // Если не удалось получить JSON, используем базовые данные
      itemData = {
        name: { 'en-US': `Item ${itemId}` },
        category: 'armor',
        rarity: 'legendary',
      };
    }

    // Определяем редкость
    const rarity = rarityMap[itemData.rarity?.toLowerCase()] || 'VETERAN';

    // Определяем цену на основе редкости
    const priceMap: Record<string, number> = {
      'STALKER': 500,
      'VETERAN': 2000,
      'MASTER': 8000,
      'LEGENDARY': 15000,
    };

    const item = await prisma.item.create({
      data: {
        externalId: itemId,
        name: itemData.name?.['en-US'] || itemData.name?.['ru-RU'] || `Item ${itemId}`,
        category: itemData.category || 'Броня',
        rarity: rarity,
        basePrice: priceMap[rarity],
        icon: imageUrl,
        isActive: true,
      },
    });

    console.log('Item imported successfully:', item);
    return item;
  } catch (error) {
    console.error('Error importing item:', error);
    throw error;
  }
}

// Получаем ID предмета и категорию из аргументов командной строки
const itemId = process.argv[2];
const category = process.argv[3] || 'armor/combined';

if (!itemId) {
  console.error('Usage: npx ts-node scripts/import-stalcraft-item.ts <item-id> [category]');
  console.error('Example: npx ts-node scripts/import-stalcraft-item.ts wj4no armor/combined');
  console.error('Example: npx ts-node scripts/import-stalcraft-item.ts zz7j2 weapon/assault_rifle');
  process.exit(1);
}

importItem(itemId, category)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
