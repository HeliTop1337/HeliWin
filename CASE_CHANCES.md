# Шансы выпадения предметов из кейсов

## Легендарный кейс

| Редкость | Шанс | Описание |
|----------|------|----------|
| LEGENDARY | **1%** | Легендарные предметы |
| MASTER | 15% | Мастерские предметы |
| VETERAN | 30% | Ветеранские предметы |
| STALKER | 54% | Сталкерские предметы |

**Итого: 100%**

## Мастерский/Премиум кейс

| Редкость | Множитель | Описание |
|----------|-----------|----------|
| MASTER | x3 | Утроенный шанс |
| VETERAN | x2 | Удвоенный шанс |
| STALKER | x1 | Базовый шанс |

## Ветеранский кейс

| Редкость | Множитель | Описание |
|----------|-----------|----------|
| VETERAN | x2.5 | Увеличенный шанс |
| STALKER | x1.5 | Повышенный шанс |

## Стартовый/Сталкерский кейс

| Редкость | Множитель | Описание |
|----------|-----------|----------|
| STALKER | x1.5 | Повышенный шанс |

## Логика работы

### Легендарный кейс
Для легендарного кейса используются **фиксированные шансы**:
```typescript
if (caseName.includes('Легендарный')) {
  if (ci.item.rarity === 'LEGENDARY') {
    adjustedChance = 1; // 1%
  } else if (ci.item.rarity === 'MASTER') {
    adjustedChance = 15; // 15%
  } else if (ci.item.rarity === 'VETERAN') {
    adjustedChance = 30; // 30%
  } else if (ci.item.rarity === 'STALKER') {
    adjustedChance = 54; // 54%
  }
}
```

### Остальные кейсы
Для остальных кейсов используются **множители** на базовый шанс из базы данных:
```typescript
adjustedChance = ci.dropChance * multiplier;
```

## Примеры

### Легендарный кейс
Если открыть 100 легендарных кейсов:
- ~1 легендарный предмет
- ~15 мастерских предметов
- ~30 ветеранских предметов
- ~54 сталкерских предмета

### Расчет вероятности
```
Вероятность = (adjustedChance / totalChance) * 100%

Для легендарного предмета:
totalChance = 1 + 15 + 30 + 54 = 100
Вероятность = (1 / 100) * 100% = 1%
```

## Код

### selectRandomItem (cases.service.ts)
```typescript
private selectRandomItem(caseItems: any[], caseName: string) {
  const adjustedItems = caseItems.map(ci => {
    let adjustedChance = ci.dropChance;
    
    if (caseName.includes('Легендарный')) {
      // Фиксированные шансы для легендарного кейса
      if (ci.item.rarity === 'LEGENDARY') adjustedChance = 1;
      else if (ci.item.rarity === 'MASTER') adjustedChance = 15;
      else if (ci.item.rarity === 'VETERAN') adjustedChance = 30;
      else if (ci.item.rarity === 'STALKER') adjustedChance = 54;
    }
    // ... остальные кейсы
    
    return { ...ci, adjustedChance };
  });

  const totalChance = adjustedItems.reduce((sum, ci) => sum + ci.adjustedChance, 0);
  let random = Math.random() * totalChance;

  for (const caseItem of adjustedItems) {
    random -= caseItem.adjustedChance;
    if (random <= 0) {
      return caseItem;
    }
  }

  return adjustedItems[0];
}
```

## Тестирование

### Проверка шансов
Откройте 100 легендарных кейсов и посчитайте:
```sql
SELECT 
  i.rarity,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ItemDrop WHERE caseId = 'legendary_case_id'), 2) as percentage
FROM ItemDrop id
JOIN Item i ON id.itemId = i.id
WHERE id.caseId = 'legendary_case_id'
GROUP BY i.rarity
ORDER BY count DESC;
```

Ожидаемый результат:
```
STALKER:    ~54%
VETERAN:    ~30%
MASTER:     ~15%
LEGENDARY:  ~1%
```

## Важно

- Шанс 1% означает, что в среднем из 100 открытий выпадет 1 легендарный предмет
- Это **не гарантия** - может выпасть 0 или 2+ из 100
- Каждое открытие независимо от предыдущих
- Используется стандартный `Math.random()` для генерации случайных чисел

## История изменений

### v2.0 (текущая версия)
- Легендарный кейс: LEGENDARY = 1% (фиксированный)
- Добавлены фиксированные шансы для всех редкостей в легендарном кейсе

### v1.0 (старая версия)
- Легендарный кейс: LEGENDARY = 8% (множитель x8)
- Использовались только множители
