import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating drop chances in Legendary case...');

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

  console.log(`Found case: ${legendaryCase.name}`);

  // Получаем все предметы в кейсе
  const caseItems = await prisma.caseItem.findMany({
    where: { caseId: legendaryCase.id },
    include: { item: true },
  });

  console.log(`Total items in case: ${caseItems.length}\n`);

  // Группируем по редкости
  const itemsByRarity = {
    LEGENDARY: caseItems.filter(ci => ci.item.rarity === 'LEGENDARY'),
    MASTER: caseItems.filter(ci => ci.item.rarity === 'MASTER'),
    VETERAN: caseItems.filter(ci => ci.item.rarity === 'VETERAN'),
    STALKER: caseItems.filter(ci => ci.item.rarity === 'STALKER'),
  };

  console.log('Items by quality:');
  console.log(`- Legendary: ${itemsByRarity.LEGENDARY.length}`);
  console.log(`- Master: ${itemsByRarity.MASTER.length}`);
  console.log(`- Veteran: ${itemsByRarity.VETERAN.length}`);
  console.log(`- Stalker: ${itemsByRarity.STALKER.length}\n`);

  // Рассчитываем шансы для каждого предмета
  const totalLegendary = itemsByRarity.LEGENDARY.length;
  const totalMaster = itemsByRarity.MASTER.length;
  const totalVeteran = itemsByRarity.VETERAN.length;
  const totalStalker = itemsByRarity.STALKER.length;

  // Общий шанс для каждой категории
  const legendaryPoolChance = 0.01; // 0.01% на всю категорию
  const masterPoolChance = 19.5; // 19.5% на всю категорию
  const veteranPoolChance = 85.0; // 85% на всю категорию
  const stalkerPoolChance = 0.0; // 0% на всю категорию

  // Шанс для каждого предмета = общий шанс категории / количество предметов
  const legendaryChance = totalLegendary > 0 ? legendaryPoolChance / totalLegendary : 0;
  const masterChance = totalMaster > 0 ? masterPoolChance / totalMaster : 0;
  const veteranChance = totalVeteran > 0 ? veteranPoolChance / totalVeteran : 0;
  const stalkerChance = totalStalker > 0 ? stalkerPoolChance / totalStalker : 0;

  console.log('Calculated drop chances per item:');
  console.log(`- Legendary: ${legendaryChance.toFixed(4)}% each (${legendaryPoolChance}% total)`);
  console.log(`- Master: ${masterChance.toFixed(4)}% each (${masterPoolChance}% total)`);
  console.log(`- Veteran: ${veteranChance.toFixed(4)}% each (${veteranPoolChance}% total)`);
  console.log(`- Stalker: ${stalkerChance.toFixed(4)}% each (${stalkerPoolChance}% total)\n`);

  // Обновляем шансы для легендарных предметов
  if (totalLegendary > 0) {
    console.log('Updating Legendary items...');
    for (const caseItem of itemsByRarity.LEGENDARY) {
      await prisma.caseItem.update({
        where: { id: caseItem.id },
        data: { dropChance: legendaryChance },
      });
      console.log(`  ✓ ${caseItem.item.name}: ${legendaryChance.toFixed(4)}%`);
    }
  }

  // Обновляем шансы для мастерских предметов
  if (totalMaster > 0) {
    console.log('\nUpdating Master items...');
    for (const caseItem of itemsByRarity.MASTER) {
      await prisma.caseItem.update({
        where: { id: caseItem.id },
        data: { dropChance: masterChance },
      });
    }
    console.log(`  ✓ Updated ${totalMaster} items to ${masterChance.toFixed(4)}% each`);
  }

  // Обновляем шансы для ветеранских предметов
  if (totalVeteran > 0) {
    console.log('\nUpdating Veteran items...');
    for (const caseItem of itemsByRarity.VETERAN) {
      await prisma.caseItem.update({
        where: { id: caseItem.id },
        data: { dropChance: veteranChance },
      });
    }
    console.log(`  ✓ Updated ${totalVeteran} items to ${veteranChance.toFixed(4)}% each`);
  }

  // Обновляем шансы для сталкерских предметов
  if (totalStalker > 0) {
    console.log('\nUpdating Stalker items...');
    for (const caseItem of itemsByRarity.STALKER) {
      await prisma.caseItem.update({
        where: { id: caseItem.id },
        data: { dropChance: stalkerChance },
      });
    }
    console.log(`  ✓ Updated ${totalStalker} items to ${stalkerChance.toFixed(4)}% each`);
  }

  // Проверяем сумму
  const totalChance = 
    (legendaryChance * totalLegendary) +
    (masterChance * totalMaster) +
    (veteranChance * totalVeteran) +
    (stalkerChance * totalStalker);

  console.log('\n✅ Successfully updated all drop chances!');
  console.log(`Total probability: ${totalChance.toFixed(2)}%`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
