# Отладка отображения картинок в WinHistory

## Что было исправлено

### 1. Убран глоу (свечение) у карточек
- Удалена функция `getRarityGlow`
- Убраны классы `shadow-lg`, `shadow-xl`, `shadow-2xl`
- Карточки теперь без внешнего свечения

### 2. Исправлен путь к картинкам
**Было:**
```tsx
src={`http://localhost:4000${win.itemIcon}`}
```

**Стало:**
```tsx
src={win.itemIcon}
```

Путь уже приходит полным из API, не нужно добавлять префикс.

### 3. Добавлено логирование
В консоли браузера теперь видно:
```
WinHistory: Received drop { ... }
WinHistory: Item icon path: /uploads/items/xxx.webp
```

## Как проверить

### 1. Откройте консоль браузера (F12)
Перейдите на вкладку Console

### 2. Откройте кейс
После открытия кейса в консоли должно появиться:
```
WinHistory: Received drop {
  id: "...",
  username: "admin",
  itemName: "ОЦ-14 «Гроза»",
  itemRarity: "VETERAN",
  itemPrice: 144.43,
  itemIcon: "/uploads/items/xxx.webp",  <-- Проверьте этот путь
  caseName: "...",
  timestamp: ...,
  multiplier: ...
}
WinHistory: Item icon path: /uploads/items/xxx.webp
```

### 3. Проверьте путь к картинке
Если путь выглядит как `/uploads/items/xxx.webp`, то:
- Откройте в браузере: `http://localhost:4000/uploads/items/xxx.webp`
- Картинка должна загрузиться

Если путь выглядит как `http://localhost:4000/uploads/items/xxx.webp`, то картинка уже с полным URL.

### 4. Проверьте Network
1. Откройте DevTools → Network
2. Откройте кейс
3. Подождите 3 секунды
4. Найдите запросы к `/uploads/items/`
5. Проверьте статус ответа (должен быть 200)

## Возможные проблемы

### Картинка не загружается (404)
**Причина:** Файл не существует на сервере

**Решение:**
```bash
# Проверьте наличие файлов
dir uploads\items

# Должны быть файлы .webp
```

### Картинка не загружается (CORS)
**Причина:** CORS блокирует загрузку

**Решение:** Проверьте `backend/main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:4001', 'http://localhost:3000'],
  credentials: true,
});
```

### Путь неправильный
**Причина:** В базе данных неправильный путь

**Решение:** Проверьте базу данных:
```sql
SELECT name, icon FROM Item LIMIT 5;
```

Путь должен быть:
- ✅ `/uploads/items/xxx.webp`
- ✅ `http://localhost:4000/uploads/items/xxx.webp`
- ❌ `uploads/items/xxx.webp` (без слеша в начале)
- ❌ `/items/xxx.webp` (без uploads)

## Структура путей

### В базе данных (Item.icon):
```
/uploads/items/412fb8dd89c66ddf2af9457a49855197.webp
```

### На сервере (файловая система):
```
uploads/items/412fb8dd89c66ddf2af9457a49855197.webp
```

### В браузере (URL):
```
http://localhost:4000/uploads/items/412fb8dd89c66ddf2af9457a49855197.webp
```

### В React компоненте:
```tsx
<img src="/uploads/items/412fb8dd89c66ddf2af9457a49855197.webp" />
// или
<img src="http://localhost:4000/uploads/items/412fb8dd89c66ddf2af9457a49855197.webp" />
```

## Fallback иконка

Если картинка не загружается, показывается SVG иконка:
```
┌─────┐
│ ▪ ▪ │
│ ▪ ▪ │
└─────┘
```

## Тестирование

### Тест 1: Проверка одной картинки
```bash
# Откройте в браузере
http://localhost:4000/uploads/items/412fb8dd89c66ddf2af9457a49855197.webp
```

### Тест 2: Проверка всех картинок
```bash
# Получите список всех предметов
curl http://localhost:4000/api/items

# Проверьте поле "icon" у каждого предмета
```

### Тест 3: Проверка WebSocket
```javascript
// В консоли браузера
const socket = io('http://localhost:4000');
socket.on('itemDropped', (data) => {
  console.log('Icon path:', data.itemIcon);
});
```

## Визуальный результат

После исправлений карточки должны выглядеть так:
- ✅ Фон соответствует редкости (серый, зеленый, синий, голубой, фиолетовый, желто-оранжевый)
- ✅ Картинка предмета отображается в центре
- ✅ Название предмета внизу
- ✅ Метка множителя (x19.1) для дорогих предметов
- ✅ Без внешнего глоу/свечения
- ✅ Легкое внутреннее свечение для редких предметов (VETERAN, EXCEPTIONAL, LEGENDARY)
