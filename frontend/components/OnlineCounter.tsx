import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

export default function OnlineCounter() {
  const [onlineCount, setOnlineCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('OnlineCounter: Connected to WebSocket');
      
      // Если пользователь авторизован, отправляем его ID
      if (isAuthenticated && user) {
        newSocket.emit('user:online', user.id);
      }
    });

    newSocket.on('online:count', (data: { count: number }) => {
      console.log('OnlineCounter: Received online count', data.count);
      setOnlineCount(data.count);
    });

    newSocket.on('disconnect', () => {
      console.log('OnlineCounter: Disconnected from WebSocket');
    });

    return () => {
      if (isAuthenticated && user) {
        newSocket.emit('user:offline');
      }
      newSocket.close();
    };
  }, [isAuthenticated, user]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-sm font-semibold text-white/90">
        {onlineCount} <span className="text-white/60">Онлайн</span>
      </span>
    </div>
  );
}
