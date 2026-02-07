import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateLegendaryPrice() {
  console.log('Updating Legendary case price...\n');

  // Находим легендарный кейс
  const legendaryCase = await prisma.case.findFirst({
    where: {
      name: 'Легендарный кейс',
    },
  });

  if (!legendaryCase) {
    console.log('❌ Legendary case not found!');
    return;
  }

  console.log(`Current price: ${legendaryCase.price}₽`);
  console.log(`New price: 450₽ (with -10% discount)\n`);

  // Обновляем цену
  await prisma.case.update({
    where: { id: legendaryCase.id },
    data: { price: 450 },
  });

  console.log('✓ Price updated!\n');

  // Показываем все кейсы
  const allCases = await prisma.case.findMany({
    orderBy: { price: 'asc' },
  });

  console.log('=== All cases ===');
  allCases.forEach(c => {
    console.log(`${c.name.padEnd(25)} ${c.price.toString().padStart(6)}₽`);
  });
}

updateLegendaryPrice()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
