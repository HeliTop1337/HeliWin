import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

interface Drop {
  id: string;
  username: string;
  itemName: string;
  itemRarity: string;
  caseName: string;
  timestamp: number;
}

export default function LiveFeed() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000');
    setSocket(newSocket);

    newSocket.on('itemDropped', (drop: Drop) => {
      setDrops((prev) => [drop, ...prev].slice(0, 5));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      Common: 'from-gray-500 to-gray-600',
      Uncommon: 'from-green-500 to-green-600',
      Rare: 'from-blue-500 to-blue-600',
      Exceptional: 'from-purple-500 to-purple-600',
      Legendary: 'from-yellow-500 to-yellow-600',
    };
    return colors[rarity] || 'from-gray-500 to-gray-600';
  };

  const getRarityText = (rarity: string) => {
    const texts: Record<string, string> = {
      Common: 'Обычный',
      Uncommon: 'Необычный',
      Rare: 'Редкий',
      Exceptional: 'Исключительный',
      Legendary: 'Легендарный',
    };
    return texts[rarity] || rarity;
  };

  return (
    <div className="border-y border-border bg-card/50 backdrop-blur-sm py-4 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Последние выигрыши
          </h3>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {drops.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-4"
              >
                Ожидание выигрышей...
              </motion.div>
            ) : (
              drops.map((drop) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, x: -50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.9 }}
                  className="glass rounded-xl p-3 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getRarityColor(drop.itemRarity)} flex items-center justify-center shadow-lg`}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">
                        {drop.username}
                      </span>
                      <span className="text-muted-foreground text-sm">выбил</span>
                      <span className={`font-bold bg-gradient-to-r ${getRarityColor(drop.itemRarity)} bg-clip-text text-transparent truncate`}>
                        {drop.itemName}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>из кейса {drop.caseName}</span>
                      <span>•</span>
                      <span className={`font-semibold bg-gradient-to-r ${getRarityColor(drop.itemRarity)} bg-clip-text text-transparent`}>
                        {getRarityText(drop.itemRarity)}
                      </span>
                    </div>
                  </div>

                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
