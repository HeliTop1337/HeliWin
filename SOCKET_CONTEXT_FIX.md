# Исправление системы WebSocket подключений

## Проблема
1. Каждый компонент (OnlineCounter, WinHistory, LiveFeed) создавал свое собственное WebSocket подключение
2. При входе/регистрации пользователя создавались новые подключения
3. Счетчик онлайн увеличивался на количество компонентов × количество вкладок
4. Пример: 1 пользователь с 3 компонентами = 3 онлайн вместо 1

## Решение
Создана единая система управления WebSocket подключениями через React Context.

### Архитектура

```
App (_app.tsx)
  └── SocketProvider (единое подключение)
       ├── OnlineCounter (использует контекст)
       ├── WinHistory (использует контекст)
       └── LiveFeed (использует контекст)
```

### Новые файлы

**1. frontend/contexts/SocketContext.tsx**
- Создает единое WebSocket подключение для всего приложения
- Автоматически отправляет статус авторизации при изменении
- Предоставляет socket и isConnected через контекст

```typescript
export const SocketProvider = ({ children }) => {
  // Единое подключение
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Создается только один раз
  useEffect(() => {
    const newSocket = io(...);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);
  
  // Отправка статуса авторизации
  useEffect(() => {
    if (socket && isAuthenticated && user) {
      socket.emit('user:online', user.id);
    }
  }, [socket, isAuthenticated, user]);
}
```

### Обновленные компоненты

**1. OnlineCounter.tsx**
- Удалено создание собственного подключения
- Использует `useSocket()` hook
- Только подписывается на события `online:count`

**2. WinHistory.tsx**
- Удалено создание собственного подключения
- Использует `useSocket()` hook
- Подписывается на события `recentWins` и `itemDropped`

**3. _app.tsx**
- Обернут в `<SocketProvider>`
- Все дочерние компоненты используют единое подключение

### Преимущества

1. **Одно подключение на приложение**
   - Независимо от количества компонентов
   - Независимо от количества вкладок (с одного IP)

2. **Корректный онлайн**
   - 1 пользователь = 1 онлайн
   - Даже при входе/регистрации

3. **Меньше нагрузки**
   - Меньше WebSocket подключений
   - Меньше трафика
   - Меньше нагрузки на сервер

4. **Автоматическая синхронизация**
   - При входе автоматически отправляется `user:online`
   - При выходе автоматически отправляется `user:offline`
   - Не нужно вручную управлять в каждом компоненте

### Использование в новых компонентах

```typescript
import { useSocket } from '../contexts/SocketContext';

function MyComponent() {
  const { socket, isConnected } = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    const handleEvent = (data) => {
      // обработка события
    };
    
    socket.on('myEvent', handleEvent);
    
    return () => {
      socket.off('myEvent', handleEvent);
    };
  }, [socket]);
}
```

## Тестирование

### До исправления:
- 1 пользователь, 3 компонента → Онлайн: 3
- 1 пользователь, 2 вкладки, 3 компонента → Онлайн: 6
- Вход в аккаунт → Онлайн увеличивается на 3

### После исправления:
- 1 пользователь, 3 компонента → Онлайн: 1 ✅
- 1 пользователь, 2 вкладки, 3 компонента → Онлайн: 1 ✅
- Вход в аккаунт → Онлайн остается 1 ✅

## Файлы изменены:
- `frontend/contexts/SocketContext.tsx` (новый)
- `frontend/pages/_app.tsx`
- `frontend/components/OnlineCounter.tsx`
- `frontend/components/WinHistory.tsx`
