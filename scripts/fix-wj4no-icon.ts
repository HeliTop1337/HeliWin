import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing icon URL for wj4no...');

  const item = await prisma.item.update({
    where: { externalId: 'wj4no' },
    data: {
      icon: 'https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/global/icons/armor/combined/wj4no.png',
    },
  });

  console.log('Icon URL updated:', item);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
