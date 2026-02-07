import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

interface WinItem {
  id: string;
  userId?: string;
  username: string;
  itemName: string;
  itemRarity: string;
  itemPrice: number;
  itemIcon: string;
  caseName: string;
  timestamp: number;
  multiplier?: number;
}

export default function WinHistory() {
  const [wins, setWins] = useState<WinItem[]>([]);
  const [lastLegendary, setLastLegendary] = useState<WinItem | null>(null); // Последний легендарный
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('WinHistory: Connected to WebSocket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WinHistory: Disconnected from WebSocket');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WinHistory: Connection error', error);
      setIsConnected(false);
    });

    // Получаем историю последних выигрышей при подключении
    newSocket.on('recentWins', (recentWins: any[]) => {
      console.log('WinHistory: Received recent wins history', recentWins.length);
      
      const winItems: WinItem[] = recentWins.map((drop: any) => ({
        id: drop.id || `${Date.now()}-${Math.random()}`,
        userId: drop.userId,
        username: drop.username,
        itemName: drop.itemName,
        itemRarity: drop.itemRarity,
        itemPrice: drop.itemPrice || 0,
        itemIcon: drop.itemIcon || '',
        caseName: drop.caseName,
        timestamp: drop.timestamp || Date.now(),
        multiplier: drop.multiplier,
      }));

      // Находим последний легендарный
      const legendary = winItems.find(w => w.itemRarity === 'LEGENDARY');
      if (legendary) {
        setLastLegendary(legendary);
      }
      
      // Остальные в список (последние 10)
      setWins(winItems.slice(0, 10));
    });

    newSocket.on('itemDropped', (drop: any) => {
      console.log('WinHistory: Received drop', drop);
      console.log('WinHistory: Item icon path:', drop.itemIcon);
      console.log('WinHistory: Drop userId:', drop.userId, 'Current user:', user?.id);
      
      const winItem: WinItem = {
        id: drop.id || `${Date.now()}-${Math.random()}`,
        userId: drop.userId,
        username: drop.username,
        itemName: drop.itemName,
        itemRarity: drop.itemRarity,
        itemPrice: drop.itemPrice || 0,
        itemIcon: drop.itemIcon || '',
        caseName: drop.caseName,
        timestamp: drop.timestamp || Date.now(),
        multiplier: drop.multiplier,
      };

      // Определяем задержку: для открывшего +5 сек (итого 8), для остальных 3 сек
      const isCurrentUser = user && drop.userId === user.id;
      const delay = isCurrentUser ? 8000 : 3000;
      
      console.log(`WinHistory: Delay for ${isCurrentUser ? 'current user' : 'other users'}: ${delay}ms`);

      setTimeout(() => {
        setWins((prev) => {
          // Проверяем, нет ли уже такого ID в списке (защита от дубликатов)
          const exists = prev.some(w => w.id === winItem.id);
          if (exists) {
            console.log('WinHistory: Duplicate detected, skipping', winItem.id);
            return prev;
          }
          
          // Добавляем в начало списка (новые слева)
          const newWins = [winItem, ...prev].slice(0, 10); // Оставляем последние 10
          return newWins;
        });
        
        // Если это легендарный предмет - обновляем карточку
        if (winItem.itemRarity === 'LEGENDARY') {
          console.log('WinHistory: New legendary item!', winItem.itemName);
          setLastLegendary(winItem);
        }
      }, delay);
    });

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Автоматическая прокрутка при добавлении новых элементов
  useEffect(() => {
    if (scrollRef.current && wins.length > 0) {
      scrollRef.current.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  }, [wins]);

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      STALKER: 'from-blue-500 via-blue-600 to-blue-700',
      VETERAN: 'from-purple-500 via-purple-600 to-purple-700',
      MASTER: 'from-orange-500 via-orange-600 to-orange-700',
      LEGENDARY: 'from-yellow-500 via-yellow-600 to-orange-600',
    };
    return colors[rarity] || 'from-gray-600 via-gray-700 to-gray-800';
  };

  const getRarityBorderColor = (rarity: string) => {
    const borders: Record<string, string> = {
      STALKER: 'border-blue-400/60',
      VETERAN: 'border-purple-400/70',
      MASTER: 'border-orange-400/70',
      LEGENDARY: 'border-yellow-400/80',
    };
    return borders[rarity] || 'border-gray-400/40';
  };

  const getItemLabel = (item: WinItem) => {
    if (item.itemPrice >= 1000) {
      return { text: 'x' + (item.multiplier?.toFixed(1) || '0'), color: 'text-yellow-400', show: true };
    }
    if (item.itemPrice >= 500) {
      return { text: 'x' + (item.multiplier?.toFixed(1) || '0'), color: 'text-orange-400', show: true };
    }
    if (item.multiplier && item.multiplier >= 10) {
      return { text: 'x' + item.multiplier.toFixed(1), color: 'text-purple-400', show: true };
    }
    return { text: '', color: '', show: false };
  };

  return (
    <div className="w-full bg-gradient-to-b from-black/40 to-transparent backdrop-blur-md overflow-hidden">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
            Последние выигрыши
          </span>
        </div>

        <div className="flex gap-3">
          {/* Компактная карточка - Последний легендарный */}
          {lastLegendary ? (
            <motion.div
              key={lastLegendary.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0 w-64 h-24 rounded-2xl overflow-hidden relative group cursor-pointer"
            >
              {/* Темно-фиолетовый градиент фона */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-950 to-black z-0" />
              
              {/* Золотистое радиальное свечение в центре (статичное) */}
              <div className="absolute inset-0 z-0" 
                   style={{ 
                     background: 'radial-gradient(circle at center, rgba(202, 138, 4, 0.25) 0%, transparent 60%)'
                   }} 
              />

              {/* Левая сторона - текст */}
              <div className="absolute left-4 top-3 z-10 flex flex-col gap-1">
                {/* "Топовый окуп!" */}
                <span className="text-xs font-bold text-white drop-shadow-lg">
                  Топовый окуп!
                </span>
                
                {/* Множитель */}
                {lastLegendary.multiplier && (
                  <span className="text-3xl font-black text-white drop-shadow-lg leading-none">
                    x{lastLegendary.multiplier.toFixed(1)}
                  </span>
                )}
                
                {/* Название предмета */}
                <span className="text-[10px] font-medium text-white/90 drop-shadow max-w-[140px] truncate">
                  {lastLegendary.itemName}
                </span>
              </div>

              {/* Правая сторона - картинка предмета */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
                {lastLegendary.itemIcon ? (
                  <img 
                    src={lastLegendary.itemIcon}
                    alt={lastLegendary.itemName}
                    className="w-16 h-16 object-contain drop-shadow-2xl transition-transform duration-300 ease-out group-hover:scale-105"
                    style={{
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
                      transform: 'rotate(-5deg)'
                    }}
                  />
                ) : (
                  <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )}
              </div>

              {/* Тень под предметом */}
              <div className="absolute right-6 bottom-6 w-16 h-2 bg-black/40 blur-md rounded-full" />
            </motion.div>
          ) : (
            <div className="flex-shrink-0 w-64 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-white/40 text-xs">Ожидание легендарного дропа...</span>
            </div>
          )}

          {/* Список последних выигрышей */}
          <div 
            ref={scrollRef}
            className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <AnimatePresence mode="popLayout">
              {wins.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-white/40 py-4"
                >
                  {isConnected ? 'Ожидание выигрышей...' : 'Подключение...'}
                </motion.div>
              ) : (
                wins.map((win, index) => {
                  const label = getItemLabel(win);
                  return (
                    <motion.div
                      key={win.id}
                      initial={{ opacity: 0, scale: 0.9, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: 20 }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1],
                        delay: index * 0.05,
                      }}
                      className="relative flex-shrink-0 group cursor-pointer"
                    >
                      {/* Карточка предмета */}
                      <div className={`
                        relative w-24 h-28 rounded-lg overflow-hidden
                        bg-gradient-to-b ${getRarityColor(win.itemRarity)}
                        border-2 ${getRarityBorderColor(win.itemRarity)}
                        transition-all duration-300
                      `}>
                        {/* Метка множителя */}
                        {label.show && (
                          <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="absolute top-1 left-1 z-10"
                          >
                            <div className="bg-black/90 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/30 shadow-lg">
                              <span className={`text-xs font-black ${label.color} drop-shadow-lg`}>
                                {label.text}
                              </span>
                            </div>
                          </motion.div>
                        )}

                        {/* Иконка предмета */}
                        <div className="absolute inset-0 flex items-center justify-center p-3">
                          {win.itemIcon ? (
                            <img 
                              src={win.itemIcon}
                              alt={win.itemName}
                              className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 ease-out group-hover:-translate-y-2"
                              style={{
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                              }}
                              onError={(e) => {
                                const target = e.currentTarget;
                                console.error('Failed to load image:', win.itemIcon);
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <svg className="w-12 h-12 text-white/80 drop-shadow-lg transition-transform duration-500 ease-out group-hover:-translate-y-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                          )}
                        </div>

                        {/* Эффект свечения для редких предметов */}
                        {(win.itemRarity === 'LEGENDARY' || win.itemRarity === 'MASTER' || win.itemRarity === 'VETERAN') && (
                          <motion.div 
                            className="absolute inset-0 pointer-events-none"
                            animate={{ opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-t ${getRarityColor(win.itemRarity)} blur-md opacity-50`} />
                          </motion.div>
                        )}

                        {/* Название предмета внизу */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-2 pt-8">
                          <div className="text-[10px] font-bold text-white text-center leading-tight line-clamp-2 drop-shadow-lg">
                            {win.itemName}
                          </div>
                        </div>
                      </div>

                      {/* Tooltip при наведении */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className={`bg-gradient-to-b ${getRarityColor(win.itemRarity)} backdrop-blur-sm border-2 ${getRarityBorderColor(win.itemRarity)} rounded-lg p-3 shadow-2xl whitespace-nowrap`}>
                          <div className="text-xs font-bold text-white mb-1 drop-shadow-lg">{win.itemName}</div>
                          <div className="text-[10px] text-white/80 mb-1">
                            <span className="opacity-60">Игрок:</span> {win.username}
                          </div>
                          <div className="text-[10px] text-white/80 mb-2">
                            <span className="opacity-60">Кейс:</span> {win.caseName}
                          </div>
                          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/20">
                            <div className="text-xs font-bold text-green-400 drop-shadow-lg">
                              {win.itemPrice.toFixed(2)} ₽
                            </div>
                            {win.multiplier && (
                              <div className="text-xs font-black text-yellow-400 drop-shadow-lg">
                                x{win.multiplier.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
