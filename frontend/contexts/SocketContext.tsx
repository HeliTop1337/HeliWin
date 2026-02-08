import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  // Создаем единое подключение для всего приложения
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket: Connected to WebSocket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket: Disconnected from WebSocket');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log('Socket: Closing connection');
      newSocket.close();
    };
  }, []);

  // Отправляем статус авторизации при изменении
  useEffect(() => {
    if (socket && socket.connected) {
      if (isAuthenticated && user) {
        console.log('Socket: Sending user:online for user', user.id);
        socket.emit('user:online', user.id);
      } else {
        console.log('Socket: Sending user:offline');
        socket.emit('user:offline');
      }
    }
  }, [socket, isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
