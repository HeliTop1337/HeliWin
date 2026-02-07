import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetBalances() {
  console.log('Resetting all user balances...\n');

  // Получаем всех пользователей
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      balance: true,
    },
  });

  console.log(`Found ${users.length} users\n`);

  if (users.length === 0) {
    console.log('❌ No users found!');
    return;
  }

  // Показываем всех пользователей
  console.log('=== Current users ===');
  users.forEach(u => {
    console.log(`${u.username} (${u.email}) - Role: ${u.role}, Balance: ${u.balance}₽`);
  });
  console.log('');

  // Находим админа (или первого пользователя)
  let admin = users.find(u => u.role === 'ADMIN');
  
  if (!admin) {
    console.log('⚠️  No ADMIN role found, using first user as admin');
    admin = users[0];
    
    // Устанавливаем роль ADMIN первому пользователю
    await prisma.user.update({
      where: { id: admin.id },
      data: { role: 'ADMIN' },
    });
    console.log(`✓ Set ${admin.username} as ADMIN\n`);
  }

  console.log(`Admin: ${admin.username} (${admin.email})`);
  console.log(`Current balance: ${admin.balance}₽\n`);

  // Обнуляем баланс всех пользователей
  await prisma.user.updateMany({
    data: {
      balance: 0,
    },
  });

  console.log('✓ All balances set to 0₽');

  // Устанавливаем 10,000₽ админу
  await prisma.user.update({
    where: { id: admin.id },
    data: { balance: 10000 },
  });

  console.log(`✓ Admin balance set to 10,000₽\n`);

  // Показываем результат
  const updatedUsers = await prisma.user.findMany({
    select: {
      username: true,
      role: true,
      balance: true,
    },
    orderBy: { balance: 'desc' },
  });

  console.log('=== Final balances ===');
  updatedUsers.forEach(u => {
    const roleLabel = u.role === 'ADMIN' ? '👑' : '👤';
    console.log(`${roleLabel} ${u.username.padEnd(20)} ${u.balance.toFixed(2).padStart(10)}₽`);
  });
}

resetBalances()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
