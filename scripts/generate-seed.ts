import fs from "fs";

// Читаем обработанные предметы
const itemsData = JSON.parse(
  fs.readFileSync("./scripts/items-parsed.json", "utf-8")
);

console.log(`📦 Загружено ${itemsData.length} предметов\n`);

// Генерируем код для seed.ts
const itemsCode = itemsData.map((item: any) => {
  return `  { externalId: '${item.externalId}', name: '${item.name}', category: '${item.category}', rarity: '${item.rarity}', basePrice: ${item.basePrice}, icon: '${item.icon}' },`;
}).join("\n");

const seedTemplate = `import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const stalcraftItems = [
${itemsCode}
];

async function main() {
  console.log('Заполнение базы данных...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@heliwin.com' },
    update: {},
    create: {
      email: 'admin@heliwin.com',
      username: 'admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      balance: 10000,
    },
  });

  console.log('Создан администратор:', admin.username);

  const items = [];
  for (const itemData of stalcraftItems) {
    const item = await prisma.item.upsert({
      where: { externalId: itemData.externalId },
      update: {
        name: itemData.name,
        category: itemData.category,
        icon: itemData.icon,
        rarity: itemData.rarity,
        basePrice: itemData.basePrice,
      },
      create: {
        externalId: itemData.externalId,
        name: itemData.name,
        category: itemData.category,
        icon: itemData.icon,
        rarity: itemData.rarity,
        basePrice: itemData.basePrice,
      },
    });
    items.push(item);
  }

  console.log(\`Создано \${items.length} предметов из Stalcraft\`);

  const starterCase = await prisma.case.upsert({
    where: { name: 'Стартовый кейс' },
    update: {},
    create: {
      name: 'Стартовый кейс',
      description: 'Базовый кейс с обычными предметами для новичков',
      price: 50,
      icon: 'https://eapi.stalcraft.net/RU/ru/item/case-starter/icon',
    },
  });

  const premiumCase = await prisma.case.upsert({
    where: { name: 'Премиум кейс' },
    update: {},
    create: {
      name: 'Премиум кейс',
      description: 'Кейс высокого уровня с редкими предметами',
      price: 200,
      icon: 'https://eapi.stalcraft.net/RU/ru/item/case-premium/icon',
    },
  });

  const legendaryCase = await prisma.case.upsert({
    where: { name: 'Легендарный кейс' },
    update: {},
    create: {
      name: 'Легендарный кейс',
      description: 'Эксклюзивный кейс с легендарными предметами',
      price: 500,
      icon: 'https://eapi.stalcraft.net/RU/ru/item/case-legendary/icon',
      discount: 10,
    },
  });

  const commonItems = items.filter((i) => i.rarity === 'COMMON');
  const uncommonItems = items.filter((i) => i.rarity === 'UNCOMMON');
  const rareItems = items.filter((i) => i.rarity === 'RARE');
  const exceptionalItems = items.filter((i) => i.rarity === 'EXCEPTIONAL');
  const legendaryItems = items.filter((i) => i.rarity === 'LEGENDARY');

  // Стартовый кейс: COMMON (50%), UNCOMMON (35%), RARE (15%)
  for (const item of commonItems) {
    await prisma.caseItem.upsert({
      where: {
        caseId_itemId: {
          caseId: starterCase.id,
          itemId: item.id,
        },
      },
      update: {},
      create: {
        caseId: starterCase.id,
        itemId: item.id,
        dropChance: 50 / commonItems.length,
      },
    });
  }
  
  for (const item of uncommonItems) {
    await prisma.caseItem.upsert({
      where: {
        caseId_itemId: {
          caseId: starterCase.id,
          itemId: item.id,
        },
      },
      update: {},
      create: {
        caseId: starterCase.id,
        itemId: item.id,
        dropChance: 35 / uncommonItems.length,
      },
    });
  }
  
  if (rareItems.length > 0) {
    const rareForStarter = rareItems.slice(0, Math.min(3, rareItems.length));
    for (const item of rareForStarter) {
      await prisma.caseItem.upsert({
        where: {
          caseId_itemId: {
            caseId: starterCase.id,
            itemId: item.id,
          },
        },
        update: {},
        create: {
          caseId: starterCase.id,
          itemId: item.id,
          dropChance: 15 / rareForStarter.length,
        },
      });
    }
  }

  // Премиум кейс: UNCOMMON (40%), RARE (35%), EXCEPTIONAL (20%), LEGENDARY (5%)
  for (const item of uncommonItems) {
    await prisma.caseItem.upsert({
      where: {
        caseId_itemId: {
          caseId: premiumCase.id,
          itemId: item.id,
        },
      },
      update: {},
      create: {
        caseId: premiumCase.id,
        itemId: item.id,
        dropChance: 40 / uncommonItems.length,
      },
    });
  }
  
  for (const item of rareItems) {
    await prisma.caseItem.upsert({
      where: {
        caseId_itemId: {
          caseId: premiumCase.id,
          itemId: item.id,
        },
      },
      update: {},
      create: {
        caseId: premiumCase.id,
        itemId: item.id,
        dropChance: 35 / rareItems.length,
      },
    });
  }
  
  for (const item of exceptionalItems) {
    await prisma.caseItem.upsert({
      where: {
        caseId_itemId: {
          caseId: premiumCase.id,
          itemId: item.id,
        },
      },
      update: {},
      create: {
        caseId: premiumCase.id,
        itemId: item.id,
        dropChance: 20 / exceptionalItems.length,
      },
    });
  }
  
  if (legendaryItems.length > 0) {
    const legendaryForPremium = legendaryItems.slice(0, Math.min(2, legendaryItems.length));
    for (const item of legendaryForPremium) {
      await prisma.caseItem.upsert({
        where: {
          caseId_itemId: {
            caseId: premiumCase.id,
            itemId: item.id,
          },
        },
        update: {},
        create: {
          caseId: premiumCase.id,
          itemId: item.id,
          dropChance: 5 / legendaryForPremium.length,
        },
      });
    }
  }

  // Легендарный кейс: RARE (30%), EXCEPTIONAL (40%), LEGENDARY (30%)
  for (const item of rareItems) {
    await prisma.caseItem.upsert({
      where: {
        caseId_itemId: {
          caseId: legendaryCase.id,
          itemId: item.id,
        },
      },
      update: {},
      create: {
        caseId: legendaryCase.id,
        itemId: item.id,
        dropChance: 30 / rareItems.length,
      },
    });
  }
  
  for (const item of exceptionalItems) {
    await prisma.caseItem.upsert({
      where: {
        caseId_itemId: {
          caseId: legendaryCase.id,
          itemId: item.id,
        },
      },
      update: {},
      create: {
        caseId: legendaryCase.id,
        itemId: item.id,
        dropChance: 40 / exceptionalItems.length,
      },
    });
  }
  
  for (const item of legendaryItems) {
    await prisma.caseItem.upsert({
      where: {
        caseId_itemId: {
          caseId: legendaryCase.id,
          itemId: item.id,
        },
      },
      update: {},
      create: {
        caseId: legendaryCase.id,
        itemId: item.id,
        dropChance: 30 / legendaryItems.length,
      },
    });
  }

  console.log('Кейсы созданы с предметами');

  await prisma.promoCode.upsert({
    where: { code: 'WELCOME100' },
    update: {},
    create: {
      code: 'WELCOME100',
      type: 'BALANCE',
      value: 100,
      maxUses: 1000,
    },
  });

  console.log('Промокоды созданы');
  console.log('Заполнение базы данных завершено!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

// Сохраняем новый seed.ts
fs.writeFileSync("./prisma/seed-new.ts", seedTemplate);

console.log("✅ Создан новый seed файл: prisma/seed-new.ts");
console.log("\nСтатистика:");

const byRarity: Record<string, number> = {};
const byCategory: Record<string, number> = {};

itemsData.forEach((item: any) => {
  byRarity[item.rarity] = (byRarity[item.rarity] || 0) + 1;
  byCategory[item.category] = (byCategory[item.category] || 0) + 1;
});

console.log("\nПо редкости:");
Object.entries(byRarity).forEach(([r, c]) => console.log(`  • ${r}: ${c}`));

console.log("\nПо категориям:");
Object.entries(byCategory).forEach(([c, n]) => console.log(`  • ${c}: ${n}`));

console.log("\n📝 Чтобы применить изменения:");
console.log("   1. mv prisma/seed-new.ts prisma/seed.ts");
console.log("   2. npm run prisma:migrate");
console.log("   3. npm run prisma:seed");
