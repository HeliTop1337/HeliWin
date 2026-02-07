# Задержка отображения выигрышей

## Логика работы

### Для открывающего кейс
- **Задержка: 8 секунд** (3 сек базовая + 5 сек дополнительная)
- Пользователь видит анимацию открытия кейса
- Только после завершения анимации выигрыш появляется в ленте

### Для всех остальных пользователей
- **Задержка: 3 секунды** (базовая)
- Видят выигрыш раньше, чем открывший
- Не спойлерит анимацию для открывающего

## Как это работает

### 1. Сервер отправляет userId
```typescript
const winData = {
  id: `${Date.now()}-${userId}`,
  userId, // ID пользователя, открывшего кейс
  username,
  itemName: item.name,
  // ...
};

this.server.emit('itemDropped', winData);
```

### 2. Клиент проверяет userId
```typescript
newSocket.on('itemDropped', (drop: any) => {
  // Проверяем, это текущий пользователь или нет
  const isCurrentUser = user && drop.userId === user.id;
  
  // Разная задержка
  const delay = isCurrentUser ? 8000 : 3000;
  
  setTimeout(() => {
    setWins((prev) => [winItem, ...prev]);
  }, delay);
});
```

## Временная шкала

### Пользователь A открывает кейс

```
t=0s   : Клик "Открыть кейс"
         ↓
t=0s   : Анимация рулетки начинается
         ↓
t=7s   : Анимация завершается, показывается результат
         ↓
t=8s   : Выигрыш появляется в ленте у пользователя A
```

### Пользователь B (наблюдатель)

```
t=0s   : Пользователь A открывает кейс
         ↓
t=0s   : WebSocket отправляет событие всем
         ↓
t=3s   : Выигрыш появляется в ленте у пользователя B
```

## Преимущества

✅ **Не спойлерит анимацию** - открывающий видит результат сначала в анимации
✅ **Быстрое обновление для других** - наблюдатели видят выигрыши быстрее
✅ **Плавный UX** - задержка синхронизирована с анимацией
✅ **Реалистичность** - лента обновляется в реальном времени для всех

## Код

### Backend (websocket.gateway.ts)
```typescript
broadcastCaseOpened(userId: string, username: string, item: any, caseName: string, casePrice?: number) {
  const winData = {
    id: `${Date.now()}-${userId}`,
    userId, // Передаем ID открывшего
    username,
    itemName: item.name,
    itemRarity: item.rarity,
    itemPrice: item.basePrice,
    itemIcon: item.icon,
    caseName,
    timestamp: Date.now(),
    multiplier: multiplier > 0 ? multiplier : undefined,
  };
  
  this.server.emit('itemDropped', winData);
}
```

### Frontend (WinHistory.tsx)
```typescript
const { user } = useAuthStore();

newSocket.on('itemDropped', (drop: any) => {
  const winItem: WinItem = {
    id: drop.id,
    userId: drop.userId,
    username: drop.username,
    // ...
  };

  // Определяем задержку
  const isCurrentUser = user && drop.userId === user.id;
  const delay = isCurrentUser ? 8000 : 3000;
  
  console.log(`Delay: ${delay}ms for ${isCurrentUser ? 'current user' : 'other users'}`);

  setTimeout(() => {
    setWins((prev) => [winItem, ...prev].slice(0, 35));
  }, delay);
});
```

## Интерфейс WinItem
```typescript
interface WinItem {
  id: string;
  userId?: string;      // ID пользователя, открывшего кейс
  username: string;
  itemName: string;
  itemRarity: string;
  itemPrice: number;
  itemIcon: string;
  caseName: string;
  timestamp: number;
  multiplier?: number;
}
```

## Логирование

В консоли браузера можно увидеть:
```
WinHistory: Received drop { userId: "123", username: "admin", ... }
WinHistory: Drop userId: 123 Current user: 123
WinHistory: Delay for current user: 8000ms
```

или

```
WinHistory: Received drop { userId: "123", username: "admin", ... }
WinHistory: Drop userId: 123 Current user: 456
WinHistory: Delay for other users: 3000ms
```

## Тестирование

### Тест 1: Открытие кейса
1. Откройте кейс
2. Смотрите анимацию (7 секунд)
3. Через 8 секунд выигрыш появится в ленте

### Тест 2: Наблюдение за другими
1. Откройте сайт в двух вкладках с разными пользователями
2. В первой вкладке откройте кейс
3. Во второй вкладке выигрыш появится через 3 секунды
4. В первой вкладке выигрыш появится через 8 секунд

### Тест 3: Проверка логов
Откройте консоль (F12) и проверьте:
```javascript
// Для открывшего
WinHistory: Delay for current user: 8000ms

// Для наблюдателя
WinHistory: Delay for other users: 3000ms
```

## Возможные улучшения

- [ ] Синхронизация с точной длительностью анимации
- [ ] Визуальный индикатор "Ваш выигрыш скоро появится"
- [ ] Настраиваемая задержка в конфиге
- [ ] Анимация появления с эффектом "новый выигрыш"

## Структура задержек

| Пользователь | Задержка | Причина |
|--------------|----------|---------|
| Открывающий кейс | 8 секунд | Не спойлерит анимацию (7 сек) + 1 сек буфер |
| Наблюдатели | 3 секунды | Быстрое обновление ленты |
| История при загрузке | 0 секунд | Мгновенное отображение |

## Визуальная схема

```
Пользователь A (открывает)
├─ t=0s: Клик "Открыть"
├─ t=0-7s: Анимация рулетки
├─ t=7s: Показ результата
└─ t=8s: Появление в ленте ✓

Пользователь B (наблюдает)
├─ t=0s: Получает WebSocket событие
└─ t=3s: Появление в ленте ✓

Пользователь C (наблюдает)
├─ t=0s: Получает WebSocket событие
└─ t=3s: Появление в ленте ✓
```
