import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showCases() {
  try {
    const cases = await prisma.case.findMany({
      include: {
        items: {
          include: { item: true },
          orderBy: { dropChance: 'asc' }
        }
      }
    });

    for (const caseItem of cases) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 ${caseItem.name} - ${caseItem.price}₽`);
      console.log(`${'='.repeat(60)}`);
      
      const byRarity = {
        LEGENDARY: caseItem.items.filter(i => i.item.rarity === 'LEGENDARY'),
        MASTER: caseItem.items.filter(i => i.item.rarity === 'MASTER'),
        VETERAN: caseItem.items.filter(i => i.item.rarity === 'VETERAN'),
        STALKER: caseItem.items.filter(i => i.item.rarity === 'STALKER')
      };

      for (const [rarity, items] of Object.entries(byRarity)) {
        if (items.length > 0) {
          const totalChance = items.reduce((sum, i) => sum + i.dropChance, 0);
          console.log(`\n🎯 ${rarity} (${items.length} шт, ${totalChance.toFixed(2)}% шанс):`);
          items.forEach(ci => {
            console.log(`   ${ci.dropChance.toFixed(2)}% - ${ci.item.name}`);
          });
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ Все кейсы теперь с STALCRAFT X тематикой!');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showCases();
