import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deletePromo() {
  try {
    const promoCode = 'HELIWIN2026';
    
    const deleted = await prisma.promoCode.delete({
      where: { code: promoCode }
    });
    
    console.log(`✅ Промокод "${promoCode}" успешно удален`);
    console.log('Детали:', deleted);
  } catch (error) {
    console.error('❌ Ошибка при удалении промокода:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deletePromo();
