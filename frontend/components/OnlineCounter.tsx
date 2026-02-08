import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';

export default function OnlineCounter() {
  const [onlineCount, setOnlineCount] = useState(0);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleOnlineCount = (data: { count: number }) => {
      console.log('OnlineCounter: Received online count', data.count);
      setOnlineCount(data.count);
    };

    socket.on('online:count', handleOnlineCount);

    return () => {
      socket.off('online:count', handleOnlineCount);
    };
  }, [socket]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
      <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
      <span className="text-sm font-semibold text-white/90">
        {onlineCount} <span className="text-white/60">Онлайн</span>
      </span>
    </div>
  );
}
