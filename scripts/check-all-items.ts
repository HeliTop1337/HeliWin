import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkItems() {
  try {
    const items = await prisma.item.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`📋 Всего предметов в базе: ${items.length}\n`);

    const stalker = items.filter(i => i.name.includes('Сталкерск') || i.name.includes('Артефакт'));
    const csgo = items.filter(i => 
      i.name.includes('AK-47') || 
      i.name.includes('M4A4') || 
      i.name.includes('AWP') ||
      i.name.includes('Glock') ||
      i.name.includes('USP') ||
      i.name.includes('Desert Eagle') ||
      i.name.includes('Karambit') ||
      i.name.includes('Butterfly')
    );
    const other = items.filter(i => !stalker.includes(i) && !csgo.includes(i));

    console.log(`🎮 STALCRAFT предметы (${stalker.length}):`);
    stalker.forEach(i => console.log(`  - ${i.name} (${i.rarity})`));

    console.log(`\n🔫 CS:GO предметы (${csgo.length}):`);
    csgo.forEach(i => console.log(`  - ${i.name} (${i.rarity})`));

    console.log(`\n❓ Другие предметы (${other.length}):`);
    other.forEach(i => console.log(`  - ${i.name} (${i.rarity})`));

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkItems();
