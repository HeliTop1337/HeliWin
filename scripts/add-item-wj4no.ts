import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding Albatross Heavy Assault Armored Exoskeleton...');

  // Создаем предмет
  const item = await prisma.item.create({
    data: {
      externalId: 'wj4no',
      name: 'Albatross Heavy Assault Armored Exoskeleton',
      category: 'Броня',
      rarity: 'LEGENDARY',
      basePrice: 15000,
      icon: 'https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/global/items/armor/combined/wj4no.png',
      isActive: true,
    },
  });

  console.log('Item created:', item);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
