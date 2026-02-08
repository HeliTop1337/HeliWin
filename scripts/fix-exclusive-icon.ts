import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixExclusiveIcon() {
  try {
    console.log('🔧 Исправление пути к иконке...');

    const exclusiveCase = await prisma.case.findFirst({
      where: { name: 'Эксклюзивный кейс' },
    });

    if (!exclusiveCase) {
      console.error('❌ Эксклюзивный кейс не найден');
      return;
    }

    console.log(`✅ Найден кейс: "${exclusiveCase.name}"`);
    console.log(`   Текущая иконка: ${exclusiveCase.icon}`);

    // Обновляем на правильное имя файла
    const updatedCase = await prisma.case.update({
      where: { id: exclusiveCase.id },
      data: { 
        icon: '/exclusive-case.png.jpg'
      },
    });

    console.log('\n🎉 Путь к иконке исправлен!');
    console.log(`   Новая иконка: ${updatedCase.icon}`);
    console.log('\n📝 Теперь изображение должно отображаться на карточке кейса');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExclusiveIcon();
