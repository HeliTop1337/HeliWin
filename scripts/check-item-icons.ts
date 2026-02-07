import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.item.findMany({
    take: 5,
    select: {
      name: true,
      icon: true,
      externalId: true,
    },
  });

  console.log('Sample items with icons:');
  items.forEach(item => {
    console.log(`\nName: ${item.name}`);
    console.log(`External ID: ${item.externalId}`);
    console.log(`Icon URL: ${item.icon}`);
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
