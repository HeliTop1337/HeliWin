import fs from "fs";
import path from "path";

const GUNS_DIR = "./scripts/downloaded/guns";
const ARMOR_DIR = "./scripts/downloaded/armor";

const RARITY_MAP: Record<string, string> = {
  "RANK_NEWBIE": "COMMON",
  "RANK_EXPERIENCED": "UNCOMMON", 
  "RANK_VETERAN": "RARE",
  "RANK_MASTER": "EXCEPTIONAL",
  "RANK_LEGEND": "LEGENDARY",
};

interface ItemJson {
  id: string;
  category: string;
  name: {
    lines: {
      ru?: string;
      en?: string;
    };
  };
  color?: string;
  infoBlocks?: Array<{
    elements?: Array<{
      key?: { lines?: { ru?: string } };
      value?: { lines?: { ru?: string } };
    }>;
  }>;
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

function parseJsonFile(filePath: string, category: string, isWeapon: boolean) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data: ItemJson = JSON.parse(content);
    
    const fileName = path.basename(filePath, ".json");
    
    // Извлекаем название (русское или английское)
    const itemName = data.name?.lines?.ru || data.name?.lines?.en || fileName;
    
    // Определяем редкость по цвету
    const rarity = RARITY_MAP[data.color || ""] || "COMMON";
    
    // Определяем ранг из infoBlocks
    let rank = "Новичок";
    if (data.infoBlocks) {
      for (const block of data.infoBlocks) {
        if (block.elements) {
          for (const element of block.elements) {
            if (element.key?.lines?.ru === "Ранг" && element.value?.lines?.ru) {
              rank = element.value.lines.ru;
              break;
            }
          }
        }
      }
    }
    
    const basePrice = calculatePrice(rarity, isWeapon);
    
    // Используем ID из JSON для формирования URL картинки с GitHub
    const itemId = data.id || fileName;
    const itemType = isWeapon ? "weapon" : "armor";
    const iconUrl = `https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/global/icons/${itemType}/${category}/${fileName}.png`;
    
    return {
      externalId: fileName,
      itemId: itemId,
      name: itemName,
      category: getCategoryName(category),
      rarity: rarity,
      rank: rank,
      basePrice: basePrice,
      icon: iconUrl,
    };
  } catch (error: any) {
    console.error(`❌ Ошибка парсинга ${filePath}:`, error.message);
    return null;
  }
}

function processDirectory(baseDir: string, isWeapon: boolean) {
  const items: any[] = [];
  
  if (!fs.existsSync(baseDir)) {
    console.log(`⚠️  Директория не найдена: ${baseDir}`);
    return items;
  }
  
  const categories = fs.readdirSync(baseDir).filter(f => 
    fs.statSync(path.join(baseDir, f)).isDirectory()
  );
  
  for (const category of categories) {
    const categoryPath = path.join(baseDir, category);
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith(".json"));
    
    console.log(`\n📁 ${getCategoryName(category)}: ${files.length} файлов`);
    console.log("-".repeat(70));
    
    // Группируем по названию чтобы убрать дубликаты
    const uniqueItems = new Map<string, any>();
    
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const item = parseJsonFile(filePath, category, isWeapon);
      
      if (item) {
        // Используем название как ключ для уникальности
        if (!uniqueItems.has(item.name)) {
          uniqueItems.set(item.name, item);
          console.log(`   ✅ ${item.name} (${item.rarity}) - ${item.rank} - ${item.basePrice}₽`);
        }
      }
    }
    
    items.push(...Array.from(uniqueItems.values()));
  }
  
  return items;
}

function run() {
  console.log("🔍 Парсинг JSON файлов предметов...\n");
  console.log("=".repeat(70));
  
  const allItems: any[] = [];
  
  // Парсим оружие
  if (fs.existsSync(GUNS_DIR)) {
    console.log("🔫 ОРУЖИЕ");
    console.log("=".repeat(70));
    const weapons = processDirectory(GUNS_DIR, true);
    allItems.push(...weapons);
  }
  
  // Парсим броню
  if (fs.existsSync(ARMOR_DIR)) {
    console.log(`\n${"=".repeat(70)}`);
    console.log("🛡️  БРОНЯ");
    console.log("=".repeat(70));
    const armor = processDirectory(ARMOR_DIR, false);
    allItems.push(...armor);
  }
  
  // Сохраняем результат
  fs.writeFileSync(
    "./scripts/items-parsed.json",
    JSON.stringify(allItems, null, 2)
  );
  
  // Статистика
  console.log(`\n${"=".repeat(70)}`);
  console.log("📊 СТАТИСТИКА");
  console.log("=".repeat(70));
  console.log(`✅ Уникальных предметов: ${allItems.length}\n`);
  
  const byRarity: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byRank: Record<string, number> = {};
  
  allItems.forEach(item => {
    byRarity[item.rarity] = (byRarity[item.rarity] || 0) + 1;
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    byRank[item.rank] = (byRank[item.rank] || 0) + 1;
  });
  
  console.log("По редкости:");
  Object.entries(byRarity).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => {
    console.log(`  • ${r}: ${c}`);
  });
  
  console.log("\nПо категориям:");
  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
    console.log(`  • ${c}: ${n}`);
  });
  
  console.log("\nПо рангу:");
  Object.entries(byRank).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => {
    console.log(`  • ${r}: ${c}`);
  });
  
  console.log(`\n💾 Результат: ./scripts/items-parsed.json`);
  
  // Примеры предметов
  console.log("\n📝 Примеры предметов:");
  const examples = allItems.slice(0, 5);
  examples.forEach(item => {
    console.log(`\n  ${item.name}`);
    console.log(`    ID: ${item.externalId}`);
    console.log(`    Категория: ${item.category}`);
    console.log(`    Редкость: ${item.rarity}`);
    console.log(`    Ранг: ${item.rank}`);
    console.log(`    Цена: ${item.basePrice}₽`);
    console.log(`    Иконка: ${item.icon}`);
  });
  
  console.log("\n✨ Готово!\n");
}

run();
