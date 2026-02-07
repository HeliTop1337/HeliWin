import { PrismaClient } from '@prisma/client';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

async function cleanupUnusedImages() {
  console.log('🧹 Очистка неиспользуемых изображений...\n');

  // Получаем все используемые пути к изображениям
  const [cases, items] = await Promise.all([
    prisma.case.findMany({ select: { icon: true } }),
    prisma.item.findMany({ select: { icon: true } }),
  ]);

  const usedImages = new Set<string>();
  
  cases.forEach(c => {
    if (c.icon && c.icon.startsWith('/uploads/')) {
      usedImages.add(c.icon);
    }
  });
  
  items.forEach(i => {
    if (i.icon && i.icon.startsWith('/uploads/')) {
      usedImages.add(i.icon);
    }
  });

  console.log(`📊 Используется изображений: ${usedImages.size}\n`);

  // Проверяем файлы в папках
  const folders = ['uploads/cases', 'uploads/items', 'uploads/avatars'];
  let deletedCount = 0;
  let totalSize = 0;

  for (const folder of folders) {
    try {
      const files = await readdir(folder);
      console.log(`\n📁 Проверка папки: ${folder}`);
      console.log(`   Файлов найдено: ${files.length}`);

      for (const file of files) {
        if (file === '.gitignore') continue;

        const filePath = `/${folder}/${file}`;
        
        if (!usedImages.has(filePath)) {
          const fullPath = join(process.cwd(), folder, file);
          try {
            await unlink(fullPath);
            deletedCount++;
            console.log(`   ❌ Удален: ${file}`);
          } catch (error) {
            console.error(`   ⚠️  Ошибка удаления ${file}:`, error);
          }
        } else {
          console.log(`   ✓ Используется: ${file}`);
        }
      }
    } catch (error) {
      console.error(`⚠️  Ошибка чтения папки ${folder}:`, error);
    }
  }

  console.log(`\n✅ Очистка завершена!`);
  console.log(`   Удалено файлов: ${deletedCount}`);
}

cleanupUnusedImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
