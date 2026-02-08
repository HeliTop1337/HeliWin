import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStarterCase() {
  console.log('Checking Starter case items...\n');

  const starterCase = await prisma.case.findFirst({
    where: {
      name: 'Стартовый кейс',
    },
    include: {
      items: {
        include: {
          item: true,
        },
        orderBy: {
          dropChance: 'desc',
        },
      },
    },
  });

  if (!starterCase) {
    console.log('❌ Starter case not found!');
    return;
  }

  console.log(`=== ${starterCase.name} ===`);
  console.log(`Total items: ${starterCase.items.length}\n`);

  // Группируем по шансу
  const withChance = starterCase.items.filter(i => i.dropChance > 0);
  const withoutChance = starterCase.items.filter(i => i.dropChance === 0);

  console.log(`Items with drop chance: ${withChance.length}`);
  console.log(`Items WITHOUT drop chance: ${withoutChance.length}\n`);

  if (withoutChance.length > 0) {
    console.log('=== Items with 0% drop chance ===');
    withoutChance.forEach(i => {
      console.log(`  ${i.item.name} (${i.item.rarity}) - ${i.item.basePrice}₽`);
    });
    console.log('');
  }

  // Показываем распределение по редкости
  const rarityStats: any = {};
  starterCase.items.forEach(i => {
    if (!rarityStats[i.item.rarity]) {
      rarityStats[i.item.rarity] = { count: 0, totalChance: 0, withChance: 0 };
    }
    rarityStats[i.item.rarity].count++;
    rarityStats[i.item.rarity].totalChance += i.dropChance;
    if (i.dropChance > 0) {
      rarityStats[i.item.rarity].withChance++;
    }
  });

  console.log('=== Rarity distribution ===');
  Object.entries(rarityStats).forEach(([rarity, stats]: [string, any]) => {
    console.log(`${rarity}: ${stats.withChance}/${stats.count} items active, ${stats.totalChance.toFixed(2)}% total chance`);
  });

  const totalChance = starterCase.items.reduce((sum, i) => sum + i.dropChance, 0);
  console.log(`\nTotal drop chance: ${totalChance.toFixed(2)}%`);
}

checkStarterCase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
