import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeLegendaryDiscount() {
  try {
    console.log('🔧 Удаление скидки с легендарного кейса...');

    // Находим легендарный кейс
    const legendaryCase = await prisma.case.findFirst({
      where: { 
        name: {
          contains: 'егендарн',
        }
      },
    });

    if (!legendaryCase) {
      console.error('❌ Легендарный кейс не найден');
      
      // Показываем все кейсы
      const allCases = await prisma.case.findMany();
      console.log('\n📦 Доступные кейсы:');
      allCases.forEach(c => {
        console.log(`   - ${c.name} (скидка: ${c.discount}%)`);
      });
      
      return;
    }

    console.log(`✅ Найден кейс: "${legendaryCase.name}"`);
    console.log(`   Текущая скидка: ${legendaryCase.discount}%`);
    console.log(`   Цена: ${legendaryCase.price} ₽`);

    // Убираем скидку
    const updatedCase = await prisma.case.update({
      where: { id: legendaryCase.id },
      data: { discount: 0 },
    });

    console.log('\n🎉 Скидка успешно удалена!');
    console.log(`   Кейс: ${updatedCase.name}`);
    console.log(`   Новая скидка: ${updatedCase.discount}%`);
    console.log(`   Цена: ${updatedCase.price} ₽`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeLegendaryDiscount();
