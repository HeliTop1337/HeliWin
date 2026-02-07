import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const GITHUB_RAW = "https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/global";

// Базовые ID предметов (без модификаций)
const WEAPONS = {
  assault_rifle: ["ak74m", "akm", "ak74", "groza", "an94", "ak12", "m4a1", "scar-l", "famas", "g36"],
  shotgun_rifle: ["toz34", "mp153", "saiga12k", "spas12", "protecta"],
  sniper_rifle: ["sks", "svd", "vss", "val", "gauss", "m14", "fal", "svt40"],
};

const ARMOR = {
  combined: ["sunrise", "psz9d", "berill5m", "seva"],
  combat: ["skat9", "bulat", "skat10"],
  scientist: ["exoskeleton", "exo-monolith"],
};

const OUT_DIR_GUNS = "./scripts/final/guns";
const OUT_DIR_ARMOR = "./scripts/final/armor";

fs.mkdirSync(OUT_DIR_GUNS, { recursive: true });
fs.mkdirSync(OUT_DIR_ARMOR, { recursive: true });

const RARITY_MAP: Record<string, string> = {
  "common": "COMMON",
  "uncommon": "UNCOMMON",
  "rare": "RARE",
  "epic": "EXCEPTIONAL",
  "legendary": "LEGENDARY",
};

interface ItemData {
  id: string;
  name: {
    lines: Record<string, string>;
  };
  color?: string;
}

function getRarityFromColor(color?: string): string {
  if (!color) return "COMMON";
  
  const colorMap: Record<string, string> = {
    "RANK_NEWBIE": "COMMON",
    "RANK_EXPERIENCED": "UNCOMMON",
    "RANK_VETERAN": "RARE",
    "RANK_MASTER": "EXCEPTIONAL",
    "RANK_LEGEND": "LEGENDARY",
  };
  
  return colorMap[color] || "COMMON";
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    "assault_rifle": "Автомат",
    "shotgun_rifle": "Дробовик",
    "sniper_rifle": "Снайперская винтовка",
    "combined": "Комбинированная броня",
    "combat": "Боевая броня",
    "scientist": "Научная броня",
  };
  return names[category] || category;
}

function calculatePrice(rarity: string, isWeapon: boolean): number {
  const base: Record<string, number> = {
    "COMMON": 30,
    "UNCOMMON": 80,
    "RARE": 180,
    "EXCEPTIONAL": 350,
    "LEGENDARY": 900,
  };
  
  let price = base[rarity] || 50;
  if (isWeapon) {
    price *= 1.3;
  }
  return Math.round(price);
}

async function downloadItem(itemId: string, category: string, type: "weapon" | "armor") {
  try {
    const jsonUrl = `${GITHUB_RAW}/items/${type}/${category}/${itemId}.json`;
    const jsonRes = await fetch(jsonUrl);
    
    if (!jsonRes.ok) {
      console.log(`   ⚠️  Не найден: ${itemId}`);
      return null;
    }
    
    const text = await jsonRes.text();
    const jsonData: ItemData = JSON.parse(text);
    
    // Сохраняем JSON
    const outDir = type === "weapon" ? OUT_DIR_GUNS : OUT_DIR_ARMOR;
    const jsonDir = path.join(outDir, category);
    fs.mkdirSync(jsonDir, { recursive: true });
    fs.writeFileSync(
      path.join(jsonDir, `${itemId}.json`),
      JSON.stringify(jsonData, null, 2)
    );
    
    // Скачиваем PNG
    const pngUrl = `${GITHUB_RAW}/icons/${type}/${itemId}.png`;
    const pngRes = await fetch(pngUrl);
    
    if (pngRes.ok) {
      const buffer = await pngRes.arrayBuffer();
      fs.writeFileSync(
        path.join(jsonDir, `${itemId}.png`),
        Buffer.from(buffer)
      );
    }
    
    const itemName = jsonData.name?.lines?.ru || itemId;
    const rarity = getRarityFromColor(jsonData.color);
    const basePrice = calculatePrice(rarity, type === "weapon");
    
    return {
      externalId: itemId,
      name: itemName,
      category: getCategoryName(category),
      rarity: rarity,
      basePrice: basePrice,
      icon: `https://eapi.stalcraft.net/RU/ru/item/${itemId}/icon`,
    };
  } catch (error: any) {
    console.error(`   ❌ Ошибка ${itemId}:`, error.message);
    return null;
  }
}

async function run() {
  console.log("🚀 Скачивание базовых предметов STALCRAFT\n");
  
  const allItems: any[] = [];
  let totalDownloaded = 0;

  // === ОРУЖИЕ ===
  console.log("=".repeat(70));
  console.log("🔫 ОРУЖИЕ");
  console.log("=".repeat(70));
  
  for (const [category, items] of Object.entries(WEAPONS)) {
    console.log(`\n📁 ${getCategoryName(category)}: ${items.length} предметов`);
    console.log("-".repeat(70));
    
    for (const itemId of items) {
      const item = await downloadItem(itemId, category, "weapon");
      if (item) {
        allItems.push(item);
        totalDownloaded++;
        console.log(`   ✅ [${totalDownloaded}] ${item.name} (${item.rarity}) - ${item.basePrice}₽`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // === БРОНЯ ===
  console.log(`\n${"=".repeat(70)}`);
  console.log("🛡️  БРОНЯ");
  console.log("=".repeat(70));
  
  for (const [category, items] of Object.entries(ARMOR)) {
    console.log(`\n📁 ${getCategoryName(category)}: ${items.length} предметов`);
    console.log("-".repeat(70));
    
    for (const itemId of items) {
      const item = await downloadItem(itemId, category, "armor");
      if (item) {
        allItems.push(item);
        totalDownloaded++;
        console.log(`   ✅ [${totalDownloaded}] ${item.name} (${item.rarity}) - ${item.basePrice}₽`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Сохраняем сводку
  fs.writeFileSync(
    "./scripts/final/items-final.json",
    JSON.stringify(allItems, null, 2)
  );

  // Статистика
  console.log(`\n${"=".repeat(70)}`);
  console.log("📊 СТАТИСТИКА");
  console.log("=".repeat(70));
  console.log(`✅ Всего скачано: ${totalDownloaded} предметов\n`);
  
  const byRarity: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  
  allItems.forEach(item => {
    byRarity[item.rarity] = (byRarity[item.rarity] || 0) + 1;
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  });
  
  console.log("По редкости:");
  Object.entries(byRarity).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => {
    console.log(`  • ${r}: ${c}`);
  });
  
  console.log("\nПо категориям:");
  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
    console.log(`  • ${c}: ${n}`);
  });
  
  console.log(`\n💾 Сводка: ./scripts/final/items-final.json`);
  console.log(`📁 Оружие: ./scripts/final/guns/`);
  console.log(`🛡️  Броня: ./scripts/final/armor/`);
  console.log("\n✨ Готово!\n");
}

run().catch(console.error);
