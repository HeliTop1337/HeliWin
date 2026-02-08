import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMcMillan() {
  try {
    const item = await prisma.item.findFirst({
      where: { name: { contains: 'McMillan' } }
    });

    if (item) {
      console.log('📋 McMillan CS5:');
      console.log(JSON.stringify(item, null, 2));
    } else {
      console.log('❌ McMillan CS5 не найден');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMcMillan();
