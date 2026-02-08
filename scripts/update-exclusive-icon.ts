import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExclusiveIcon() {
  try {
    console.log('🖼️ Обновление иконки эксклюзивного кейса...');

    // Находим эксклюзивный кейс
    const exclusiveCase = await prisma.case.findFirst({
      where: { name: 'Эксклюзивный кейс' },
    });

    if (!exclusiveCase) {
      console.error('❌ Эксклюзивный кейс не найден');
      return;
    }

    console.log(`✅ Найден кейс: "${exclusiveCase.name}"`);
    console.log(`   Текущая иконка: ${exclusiveCase.icon}`);

    // Обновляем иконку на путь к изображению
    const updatedCase = await prisma.case.update({
      where: { id: exclusiveCase.id },
      data: { 
        icon: '/exclusive-case.png' // Путь к изображению в папке public
      },
    });

    console.log('\n🎉 Иконка успешно обновлена!');
    console.log(`   Кейс: ${updatedCase.name}`);
    console.log(`   Новая иконка: ${updatedCase.icon}`);
    console.log(`   Цена: ${updatedCase.price} ₽`);
    console.log('\n📝 Убедитесь, что файл exclusive-case.png находится в папке frontend/public/');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExclusiveIcon();
