import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addStalkerGear() {
  try {
    console.log('📦 Добавляю сталкерское снаряжение...\n');

    const stalkerGear = [
      // Инструменты
      { name: 'Сталкерский Детектор', category: 'Детектор', price: 15.50 },
      { name: 'Сталкерский Компас', category: 'Инструмент', price: 8.20 },
      { name: 'Сталкерский Фонарь', category: 'Инструмент', price: 12.30 },
      
      // Расходники
      { name: 'Сталкерская Аптечка', category: 'Медикамент', price: 18.40 },
      { name: 'Сталкерская Граната', category: 'Граната', price: 22.60 },
      { name: 'Сталкерские Патроны 5.45', category: 'Патроны', price: 5.80 },
      { name: 'Сталкерские Патроны 7.62', category: 'Патроны', price: 7.20 },
      { name: 'Сталкерский Бинт', category: 'Медикамент', price: 6.50 },
      { name: 'Сталкерский Стимулятор', category: 'Медикамент', price: 25.30 },
      
      // Дополнительная броня
      { name: 'Сталкерский Шлем', category: 'Шлем', price: 28.90 },
      { name: 'Сталкерские Перчатки', category: 'Перчатки', price: 14.70 },
      { name: 'Сталкерские Ботинки', category: 'Обувь', price: 19.80 },
    ];

    for (const gear of stalkerGear) {
      // Проверяем существует ли уже
      const existing = await prisma.item.findFirst({
        where: { name: gear.name }
      });

      if (existing) {
        console.log(`⏭️  ${gear.name} уже существует`);
        continue;
      }

      await prisma.item.create({
        data: {
          name: gear.name,
          category: gear.category,
          icon: '🎒',
          rarity: 'STALKER',
          basePrice: gear.price,
          isActive: true
        }
      });

      console.log(`✅ Добавлен: ${gear.name} (${gear.price}₽)`);
    }

    console.log('\n✅ Сталкерское снаряжение добавлено!');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addStalkerGear();
