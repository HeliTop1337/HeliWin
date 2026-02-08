import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCases() {
  try {
    const cases = await prisma.case.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        isActive: true,
      },
    });

    console.log('\n=== Доступные кейсы ===\n');
    
    if (cases.length === 0) {
      console.log('❌ Кейсы не найдены! Выполните: npm run seed');
    } else {
      cases.forEach((c) => {
        console.log(`✅ ${c.name}`);
        console.log(`   ID: ${c.id}`);
        console.log(`   Цена: ${c.price} ₽`);
        console.log(`   Активен: ${c.isActive ? 'Да' : 'Нет'}`);
        console.log(`   URL: http://localhost:4001/cases/${c.id}\n`);
      });
    }
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCases();
