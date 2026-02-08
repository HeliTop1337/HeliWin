import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding Legendary case...');

  // Ищем легендарный кейс
  const legendaryCase = await prisma.case.findFirst({
    where: {
      name: {
        contains: 'Легендарный',
      },
    },
  });

  if (!legendaryCase) {
    console.error('Legendary case not found!');
    process.exit(1);
  }

  console.log(`Found case: ${legendaryCase.name} (${legendaryCase.id})`);

  // Находим предмет wj4no (Albatross)
  const albatross = await prisma.item.findUnique({
    where: { externalId: 'wj4no' },
  });

  if (!albatross) {
    console.error('Albatross item not found!');
    process.exit(1);
  }

  console.log(`Found Albatross: ${albatross.name}`);

  // Находим CR-380
  const cr380 = await prisma.item.findFirst({
    where: {
      name: {
        contains: 'CR-380',
      },
    },
  });

  if (!cr380) {
    console.error('CR-380 not found!');
    process.exit(1);
  }

  console.log(`Found CR-380: ${cr380.name}`);

  // Проверяем, есть ли уже Albatross в кейсе
  const existingAlbatross = await prisma.caseItem.findUnique({
    where: {
      caseId_itemId: {
        caseId: legendaryCase.id,
        itemId: albatross.id,
      },
    },
  });

  if (existingAlbatross) {
    console.log('Albatross already in case, updating drop chance...');
    await prisma.caseItem.update({
      where: {
        caseId_itemId: {
          caseId: legendaryCase.id,
          itemId: albatross.id,
        },
      },
      data: {
        dropChance: 1.0,
      },
    });
  } else {
    console.log('Adding Albatross to case...');
    await prisma.caseItem.create({
      data: {
        caseId: legendaryCase.id,
        itemId: albatross.id,
        dropChance: 1.0,
      },
    });
  }

  // Обновляем шанс CR-380
  const existingCR380 = await prisma.caseItem.findUnique({
    where: {
      caseId_itemId: {
        caseId: legendaryCase.id,
        itemId: cr380.id,
      },
    },
  });

  if (existingCR380) {
    console.log('Updating CR-380 drop chance to 1.00%...');
    await prisma.caseItem.update({
      where: {
        caseId_itemId: {
          caseId: legendaryCase.id,
          itemId: cr380.id,
        },
      },
      data: {
        dropChance: 1.0,
      },
    });
  } else {
    console.log('CR-380 not in case, adding with 1.00% chance...');
    await prisma.caseItem.create({
      data: {
        caseId: legendaryCase.id,
        itemId: cr380.id,
        dropChance: 1.0,
      },
    });
  }

  console.log('\n✅ Successfully updated Legendary case!');
  console.log(`- Albatross Heavy Assault Armored Exoskeleton: 1.00%`);
  console.log(`- CR-380: 1.00%`);

  // Показываем все предметы в кейсе
  const caseItems = await prisma.caseItem.findMany({
    where: { caseId: legendaryCase.id },
    include: { item: true },
    orderBy: { dropChance: 'asc' },
  });

  console.log(`\nTotal items in case: ${caseItems.length}`);
  console.log('\nLegendary items (1.00%):');
  caseItems
    .filter(ci => ci.dropChance === 1.0)
    .forEach(ci => {
      console.log(`  - ${ci.item.name}: ${ci.dropChance.toFixed(2)}%`);
    });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
