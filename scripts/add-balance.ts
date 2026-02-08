import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addBalance(username: string, amount: number) {
  try {
    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.error(`❌ Пользователь "${username}" не найден`);
      return;
    }

    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + amount;

    // Обновить баланс
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: balanceAfter },
    });

    // Создать транзакцию
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'ADMIN_CREDIT',
        amount,
        balanceBefore,
        balanceAfter,
        description: `Пополнение баланса администратором`,
      },
    });

    console.log(`✅ Успешно добавлено ${amount} руб. пользователю ${username}`);
    console.log(`   Баланс до: ${balanceBefore} руб.`);
    console.log(`   Баланс после: ${balanceAfter} руб.`);
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Получить аргументы из командной строки
const username = process.argv[2];
const amount = parseFloat(process.argv[3]);

if (!username || isNaN(amount)) {
  console.error('Использование: ts-node scripts/add-balance.ts <username> <amount>');
  console.error('Пример: ts-node scripts/add-balance.ts Zovc1k 10000');
  process.exit(1);
}

addBalance(username, amount);
