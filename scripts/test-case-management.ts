import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCaseManagement() {
  console.log('🔍 Проверка функционала управления кейсами...\n');

  // Получаем все кейсы
  const cases = await prisma.case.findMany({
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  console.log(`📦 Всего кейсов: ${cases.length}\n`);

  for (const caseData of cases) {
    console.log(`\n📦 ${caseData.name}`);
    console.log(`   Цена: ${caseData.price}₽`);
    console.log(`   Скидка: ${caseData.discount}%`);
    console.log(`   Активен: ${caseData.isActive ? '✅' : '❌'}`);
    console.log(`   Иконка: ${caseData.icon || 'Не установлена'}`);
    console.log(`   Предметов: ${caseData.items.length}`);
    
    if (caseData.items.length > 0) {
      console.log(`   \n   Предметы в кейсе:`);
      let totalChance = 0;
      
      for (const ci of caseData.items) {
        console.log(`   - ${ci.item.name} (${ci.item.rarity}): ${ci.dropChance}%`);
        totalChance += ci.dropChance;
      }
      
      console.log(`   \n   Общая сумма шансов: ${totalChance.toFixed(2)}%`);
      
      if (Math.abs(totalChance - 100) > 0.01) {
        console.log(`   ⚠️  ВНИМАНИЕ: Сумма шансов не равна 100%!`);
      }
    }
  }

  // Получаем все предметы
  const items = await prisma.item.findMany();
  console.log(`\n\n🎯 Всего предметов в базе: ${items.length}`);
  
  // Группируем по редкости
  const byRarity = items.reduce((acc, item) => {
    acc[item.rarity] = (acc[item.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\nПредметы по редкости:');
  Object.entries(byRarity).forEach(([rarity, count]) => {
    console.log(`  ${rarity}: ${count}`);
  });

  console.log('\n✅ Проверка завершена!');
}

testCaseManagement()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
