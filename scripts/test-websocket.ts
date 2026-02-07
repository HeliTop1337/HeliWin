import { PrismaClient } from '@prisma/client';
import { io } from 'socket.io-client';

const prisma = new PrismaClient();

async function testWebSocket() {
  console.log('Подключение к WebSocket...');
  
  const socket = io('http://localhost:4000', {
    reconnection: true,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✅ Подключено к WebSocket');
  });

  socket.on('disconnect', () => {
    console.log('❌ Отключено от WebSocket');
  });

  socket.on('itemDropped', (data) => {
    console.log('📦 Получен дроп:', data);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Ошибка подключения:', error.message);
  });

  // Получаем тестовые данные
  const users = await prisma.user.findMany({ take: 3 });
  const items = await prisma.item.findMany({ 
    where: { isActive: true },
    orderBy: { basePrice: 'desc' },
    take: 10,
  });
  const cases = await prisma.case.findMany({ 
    where: { isActive: true },
    take: 3,
  });

  if (users.length === 0 || items.length === 0 || cases.length === 0) {
    console.error('❌ Недостаточно данных в базе для теста');
    await prisma.$disconnect();
    socket.close();
    return;
  }

  console.log('\n🎲 Генерация тестовых выигрышей...\n');

  // Генерируем 10 тестовых выигрышей с интервалом
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const user = users[Math.floor(Math.random() * users.length)];
    const item = items[Math.floor(Math.random() * items.length)];
    const caseData = cases[Math.floor(Math.random() * cases.length)];
    const multiplier = item.basePrice / caseData.price;

    const dropData = {
      id: `test-${Date.now()}-${i}`,
      username: user.username,
      itemName: item.name,
      itemRarity: item.rarity,
      itemPrice: item.basePrice,
      itemIcon: item.icon,
      caseName: caseData.name,
      timestamp: Date.now(),
      multiplier: multiplier > 0 ? multiplier : undefined,
    };

    console.log(`${i + 1}. ${user.username} выбил ${item.name} (${item.basePrice}₽) из ${caseData.name}`);
    
    socket.emit('itemDropped', dropData);
  }

  console.log('\n✅ Тест завершен');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  await prisma.$disconnect();
  socket.close();
  process.exit(0);
}

testWebSocket().catch((error) => {
  console.error('❌ Ошибка:', error);
  process.exit(1);
});
