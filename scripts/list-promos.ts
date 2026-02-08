import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listPromos() {
  try {
    const promos = await prisma.promoCode.findMany();
    
    console.log(`📋 Всего промокодов: ${promos.length}\n`);
    
    promos.forEach(promo => {
      console.log(`Код: ${promo.code}`);
      console.log(`Тип: ${promo.type}`);
      console.log(`Значение: ${promo.value || 'N/A'}`);
      console.log(`Использований: ${promo.usedCount}/${promo.maxUses || '∞'}`);
      console.log(`Активен: ${promo.isActive ? 'Да' : 'Нет'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listPromos();
