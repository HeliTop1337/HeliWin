import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';
import { ToastContainer } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

export default function CaseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user, setUser } = useAuthStore();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [rouletteItems, setRouletteItems] = useState<any[]>([]);
  const [winningIndex, setWinningIndex] = useState<number>(49);
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    if (id) {
      fetchCase();
    }
  }, [id]);

  const fetchCase = async () => {
    try {
      const { data } = await api.get(`/api/cases/${id}`);
      setCaseData(data);
      setItems(data.items || []);
    } catch (error: any) {
      console.error('Failed to fetch case:', error);
      if (error.response?.status === 404) {
        setCaseData(null);
      } else {
        showError('Ошибка загрузки кейса');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCase = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const finalPrice = caseData.price * (1 - (caseData.discount || 0) / 100);
    if (user && user.balance < finalPrice) {
      showError('Недостаточно средств для открытия кейса!');
      return;
    }

    setOpening(true);
    setResult(null);

    try {
      const { data } = await api.post(`/api/cases/${id}/open`);
      
      // Создаем массив для рулетки с РЕАЛЬНЫМ выигранным предметом
      const rouletteArray = [];
      
      // Добавляем 49 случайных предметов в начало
      for (let i = 0; i < 49; i++) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        rouletteArray.push(randomItem);
      }
      
      // ВАЖНО: Добавляем РЕАЛЬНЫЙ выигранный предмет с сервера
      // Создаем объект в том же формате что и items
      const wonItemForRoulette = {
        item: data.item, // Используем item напрямую из ответа сервера
        dropChance: 0
      };
      rouletteArray.push(wonItemForRoulette);
      setWinningIndex(49);
      
      // Добавляем еще 10 предметов после выигранного
      for (let i = 0; i < 10; i++) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        rouletteArray.push(randomItem);
      }
      
      setRouletteItems(rouletteArray);
      
      // Показываем результат после анимации (7 секунд)
      setTimeout(() => {
        setResult(data);
        if (user) {
          setUser({ ...user, balance: data.newBalance });
        }
        showSuccess(`Вы выиграли ${data.item.name}!`);
        setOpening(false);
      }, 7000);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка открытия кейса');
      setOpening(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      COMMON: 'from-gray-500 to-gray-600',
      UNCOMMON: 'from-green-500 to-green-600',
      RARE: 'from-blue-500 to-blue-600',
      EXCEPTIONAL: 'from-purple-500 to-purple-600',
      LEGENDARY: 'from-yellow-500 to-yellow-600',
    };
    return colors[rarity as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getRarityText = (rarity: string) => {
    const texts: Record<string, string> = {
      COMMON: 'Обычный',
      UNCOMMON: 'Необычный',
      RARE: 'Редкий',
      EXCEPTIONAL: 'Исключительный',
      LEGENDARY: 'Легендарный',
    };
    return texts[rarity] || rarity;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl text-muted-foreground">Кейс не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад к кейсам
        </motion.button>

        {/* Case Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
              </svg>
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{caseData.name}</h1>
              <p className="text-muted-foreground mb-4">{caseData.description}</p>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-primary">
                  {caseData.price.toFixed(2)} ₽
                </div>
                {caseData.discount > 0 && (
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{caseData.discount}%
                  </div>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenCase}
              disabled={opening}
              className="btn-primary glow-purple-strong text-xl px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {opening ? 'Открытие...' : 'Открыть кейс'}
            </motion.button>
          </div>
        </motion.div>

        {/* Roulette Animation */}
        {opening && rouletteItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 mb-8 overflow-hidden"
          >
            <div className="relative h-64 overflow-hidden">
              {/* Center indicator */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary z-20 transform -translate-x-1/2" />
              <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-primary rounded-full z-20 transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />
              
              {/* Scrolling items */}
              <motion.div
                className="flex gap-4 absolute left-0"
                initial={{ x: 0 }}
                animate={{
                  x: -(winningIndex * 176 - (typeof window !== 'undefined' ? window.innerWidth / 2 : 960) + 80)
                }}
                transition={{
                  duration: 7,
                  ease: [0.33, 1, 0.68, 1]
                }}
              >
                {rouletteItems.map((caseItem, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-40"
                  >
                    <div className={`w-40 h-40 rounded-xl bg-gradient-to-br ${getRarityColor(caseItem?.item?.rarity || 'COMMON')} flex items-center justify-center shadow-lg p-3`}>
                      {caseItem?.item?.icon ? (
                        <img 
                          src={caseItem.item.icon} 
                          alt={caseItem.item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                      )}
                    </div>
                    <div className="mt-2 text-center px-1">
                      <p className="text-xs font-bold text-white truncate">{caseItem?.item?.name}</p>
                      <p className="text-xs text-muted-foreground">{getRarityText(caseItem?.item?.rarity || 'COMMON')}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="glass rounded-3xl p-8 mb-8 text-center relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(result.item.rarity)}/20`} />
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Вы выиграли!</h2>
                
                <div className={`w-48 h-48 mx-auto rounded-2xl bg-gradient-to-br ${getRarityColor(result.item.rarity)} flex items-center justify-center shadow-2xl mb-6 p-4`}>
                  {result.item.icon ? (
                    <img 
                      src={result.item.icon} 
                      alt={result.item.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  )}
                </div>
                
                <h3 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${getRarityColor(result.item.rarity)} bg-clip-text text-transparent`}>
                  {result.item.name}
                </h3>
                <p className="text-xl text-muted-foreground mb-4">{getRarityText(result.item.rarity)}</p>
                <p className="text-2xl font-bold text-primary">{result.item.basePrice.toFixed(2)} ₽</p>
                
                <div className="flex gap-4 justify-center mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setResult(null)}
                    className="btn-secondary"
                  >
                    Закрыть
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOpenCase}
                    className="btn-primary"
                  >
                    Открыть еще
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Available Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6">Возможные предметы</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((caseItem: any, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="glass rounded-xl p-4 text-center"
              >
                <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${getRarityColor(caseItem.item.rarity)} mb-3 flex items-center justify-center p-2`}>
                  {caseItem.item.icon ? (
                    <img 
                      src={caseItem.item.icon} 
                      alt={caseItem.item.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  )}
                </div>
                <h4 className={`font-bold text-sm mb-1 bg-gradient-to-r ${getRarityColor(caseItem.item.rarity)} bg-clip-text text-transparent`}>
                  {caseItem.item.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-1">{getRarityText(caseItem.item.rarity)}</p>
                <p className="text-xs text-primary font-bold">{caseItem.dropChance.toFixed(2)}%</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
