import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating rarity system...');

  // Update COMMON and UNCOMMON to STALKER
  const stalker = await prisma.item.updateMany({
    where: {
      OR: [
        { rarity: 'COMMON' },
        { rarity: 'UNCOMMON' }
      ]
    },
    data: {
      rarity: 'STALKER'
    }
  });
  console.log(`Updated ${stalker.count} items to STALKER`);

  // Update RARE to VETERAN
  const veteran = await prisma.item.updateMany({
    where: { rarity: 'RARE' },
    data: { rarity: 'VETERAN' }
  });
  console.log(`Updated ${veteran.count} items to VETERAN`);

  // Update EXCEPTIONAL to MASTER
  const master = await prisma.item.updateMany({
    where: { rarity: 'EXCEPTIONAL' },
    data: { rarity: 'MASTER' }
  });
  console.log(`Updated ${master.count} items to MASTER`);

  console.log('Rarity system updated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
