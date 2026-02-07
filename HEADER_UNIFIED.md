# Унификация хедера

## Что было изменено

### 1. Убран счетчик выигрышей
**Было:**
```
Последние выигрыши                    35
```

**Стало:**
```
Последние выигрыши
```

### 2. Единый визуал хедера
Убраны визуальные разделители между WinHistory и Header:

**WinHistory:**
- Убрана нижняя граница (`border-b`)
- Фон: `bg-gradient-to-b from-black/40 to-transparent`
- Backdrop blur для эффекта стекла

**Header:**
- Изменен фон с `glass` на `bg-gradient-to-b from-black/60 to-black/40`
- Граница: `border-b border-white/5` (очень тонкая)
- Backdrop blur для единого эффекта

### 3. Плавный переход
Теперь WinHistory и Header выглядят как единый блок:
```
┌─────────────────────────────────────┐
│ ● Последние выигрыши                │ ← WinHistory
│ [карточка] [карточка] [карточка]    │
├─────────────────────────────────────┤ ← Почти незаметная граница
│ Logo  Навигация  Баланс  Профиль    │ ← Header
└─────────────────────────────────────┘
```

## Визуальные характеристики

### WinHistory
- Фон: Черный с прозрачностью 40% → прозрачный (градиент)
- Backdrop blur: Да
- Граница снизу: Нет

### Header
- Фон: Черный с прозрачностью 60% → 40% (градиент)
- Backdrop blur: Да
- Граница снизу: Белая 5% прозрачности

### Результат
Оба блока имеют:
- Одинаковый backdrop blur эффект
- Плавный градиент от темного к светлому
- Минимальные границы
- Единый визуальный стиль

## Код изменений

### WinHistory.tsx
```tsx
<div className="w-full bg-gradient-to-b from-black/40 to-transparent backdrop-blur-md overflow-hidden">
  <div className="container mx-auto px-4 py-3">
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
        Последние выигрыши
      </span>
    </div>
    {/* ... карточки ... */}
  </div>
</div>
```

### Header.tsx
```tsx
<header className="sticky top-0 z-40 backdrop-blur-xl bg-gradient-to-b from-black/60 to-black/40 border-b border-white/5">
  <div className="container mx-auto px-4">
    {/* ... навигация ... */}
  </div>
</header>
```

## Преимущества

✅ Единый визуальный стиль
✅ Нет лишних элементов (счетчик убран)
✅ Плавный переход между блоками
✅ Минималистичный дизайн
✅ Backdrop blur создает эффект стекла
✅ Градиенты делают переход естественным

## Тестирование

Проверьте что:
1. Счетчик выигрышей не отображается
2. WinHistory и Header выглядят как единый блок
3. Граница между ними почти незаметна
4. Backdrop blur работает на обоих блоках
5. Градиенты создают плавный переход
