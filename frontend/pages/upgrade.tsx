import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import api from '../lib/api';

type MascotState = 'idle' | 'start' | 'process' | 'win' | 'lose';

export default function Upgrade() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toasts, removeToast, success, error, info } = useToast();
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [availableUpgrades, setAvailableUpgrades] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUpgrades, setLoadingUpgrades] = useState(false);
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [showRoulette, setShowRoulette] = useState(false);
  const [roulettePosition, setRoulettePosition] = useState(0);
  const [searchInventory, setSearchInventory] = useState('');
  const [minPriceInventory, setMinPriceInventory] = useState('');
  const [maxPriceInventory, setMaxPriceInventory] = useState('');
  const [searchUpgrades, setSearchUpgrades] = useState('');
  const [minPriceUpgrades, setMinPriceUpgrades] = useState('');
  const [maxPriceUpgrades, setMaxPriceUpgrades] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPlayedStart, setHasPlayedStart] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchInventory();
  }, [isAuthenticated]);

  // ИНИЦИАЛИЗАЦИЯ видео при монтировании компонента
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = '/mascot_idle_app.webm';
      videoRef.current.loop = true;
      videoRef.current.muted = true;
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log('Autoplay prevented:', err));
    }
  }, []);

  // Логика анимации маскота при выборе предметов
  useEffect(() => {
    // Если оба предмета выбраны И еще не играли start анимацию И не идет апгрейд
    if (selectedItem && selectedTarget && !hasPlayedStart && !upgrading && !result) {
      setMascotState('start');
      setHasPlayedStart(true);
      // start автоматически перейдет в process после окончания (см. useEffect ниже)
    }
    // Если сбросили выбор - сбрасываем флаг и возвращаемся к idle
    if (!selectedItem || !selectedTarget) {
      setHasPlayedStart(false);
      if (!upgrading && !result) {
        setMascotState('idle');
      }
    }
  }, [selectedItem, selectedTarget, hasPlayedStart, upgrading, result]);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoMap: Record<MascotState, string> = {
      idle: '/mascot_idle_app.webm',
      start: '/mascot_start.webm',
      process: '/mascot_process.webm',
      win: '/mascot_win.webm',
      lose: '/mascot_lose.webm',
    };
    
    // Не перезагружаем видео если уже играет idle при первой загрузке
    if (mascotState === 'idle' && videoRef.current.src.includes('mascot_idle_app.webm') && !videoRef.current.paused) {
      return;
    }
    
    videoRef.current.src = videoMap[mascotState];
    videoRef.current.muted = true;
    
    if (mascotState === 'start') {
      // start - играется 1 раз, потом переход к process
      videoRef.current.loop = false;
      videoRef.current.onended = () => {
        setMascotState('process');
      };
    } else if (mascotState === 'win' || mascotState === 'lose') {
      // win/lose - играется 1 раз, потом возврат к idle
      videoRef.current.loop = false;
      videoRef.current.onended = () => {
        setMascotState('idle');
      };
    } else if (mascotState === 'process') {
      // process - ЗАЦИКЛИВАЕТСЯ пока юзер не нажмет кнопку и не придет результат
      videoRef.current.loop = true;
      videoRef.current.onended = null;
    } else {
      // idle - ЗАЦИКЛИВАЕТСЯ постоянно
      videoRef.current.loop = true;
      videoRef.current.onended = null;
    }
    
    videoRef.current.load();
    videoRef.current.play().catch(err => console.log('Autoplay prevented:', err));
  }, [mascotState]);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/api/inventory');
      setInventory(data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUpgrades = async (itemId: string) => {
    setLoadingUpgrades(true);
    try {
      const { data } = await api.get(`/api/upgrades/available/${itemId}`);
      setAvailableUpgrades(data);
    } catch (error) {
      console.error('Failed to fetch upgrades:', error);
      setAvailableUpgrades([]);
    } finally {
      setLoadingUpgrades(false);
    }
  };

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setSelectedTarget(null);
    setResult(null);
    setHasPlayedStart(false); // Сбрасываем флаг при смене предмета
    fetchAvailableUpgrades(item.itemId);
  };

  const handleUpgrade = async () => {
    if (!selectedItem || !selectedTarget) return;
    
    setUpgrading(true);
    setResult(null);
    setShowRoulette(true);
    
    // process уже играет, просто продолжаем его во время рулетки
    // НЕ меняем состояние маскота здесь

    const duration = 3000;
    const startTime = Date.now();
    
    const animateRoulette = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setRoulettePosition(easeOut * 100);
      
      if (progress < 1) {
        requestAnimationFrame(animateRoulette);
      }
    };
    
    animateRoulette();

    try {
      const { data } = await api.post('/api/upgrades', {
        fromItemId: selectedItem.id,
        toItemId: selectedTarget.id,
      });
      
      // После завершения рулетки показываем результат
      setTimeout(() => {
        setResult(data);
        // Переключаем на win или lose анимацию
        setMascotState(data.success ? 'win' : 'lose');
        setShowRoulette(false);
        setRoulettePosition(0);
        
        if (data.success) {
          success(`Успех! Вы получили ${data.newItem?.name || 'предмет'}!`);
        } else {
          error('Неудача! Предмет потерян');
        }
        
        // Через 3 секунды сбрасываем все
        setTimeout(() => {
          fetchInventory();
          setSelectedItem(null);
          setSelectedTarget(null);
          setAvailableUpgrades([]);
          setResult(null);
          setHasPlayedStart(false);
          // Маскот вернется к idle автоматически после окончания win/lose анимации
        }, 3000);
      }, duration);
    } catch (err: any) {
      setTimeout(() => {
        setResult({ 
          success: false, 
          message: err.response?.data?.message || 'Ошибка апгрейда' 
        });
        setMascotState('lose');
        setShowRoulette(false);
        setRoulettePosition(0);
        error(err.response?.data?.message || 'Ошибка апгрейда');
        
        setTimeout(() => {
          fetchInventory();
          setSelectedItem(null);
          setSelectedTarget(null);
          setAvailableUpgrades([]);
          setResult(null);
          setHasPlayedStart(false);
          setUpgrading(false);
        }, 3000);
      }, duration);
    } finally {
      setTimeout(() => {
        setUpgrading(false);
      }, duration);
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

  const filteredInventory = inventory.filter((invItem: any) => {
    const matchesSearch = invItem.item.name.toLowerCase().includes(searchInventory.toLowerCase());
    const matchesMinPrice = !minPriceInventory || invItem.item.basePrice >= parseFloat(minPriceInventory);
    const matchesMaxPrice = !maxPriceInventory || invItem.item.basePrice <= parseFloat(maxPriceInventory);
    return matchesSearch && matchesMinPrice && matchesMaxPrice;
  });

  const filteredUpgrades = availableUpgrades.filter((upgrade: any) => {
    const matchesSearch = upgrade.name.toLowerCase().includes(searchUpgrades.toLowerCase());
    const matchesMinPrice = !minPriceUpgrades || upgrade.basePrice >= parseFloat(minPriceUpgrades);
    const matchesMaxPrice = !maxPriceUpgrades || upgrade.basePrice <= parseFloat(maxPriceUpgrades);
    return matchesSearch && matchesMinPrice && matchesMaxPrice;
  });

  const getChanceText = () => {
    if (!selectedItem) return 'Выберите предметы';
    if (!selectedTarget) return 'Выберите предметы';
    return `${selectedTarget.chance}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #1a1f2e 100%)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #1a1f2e 100%)' }}>
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* ВЕРХНЯЯ ЗОНА - UPGRADE ARENA В ОТДЕЛЬНОМ БЛОКЕ */}
        <div 
          className="relative rounded-3xl overflow-hidden mb-12 mx-auto"
          style={{
            maxWidth: '1400px',
            backgroundImage: 'url(https://stalcase.at/static/images/b-upgrade/bg_placeholder.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '3rem 2rem'
          }}
        >
          <div className="flex items-center justify-center gap-8 relative">
            {/* Левый слот - выбранный предмет */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div 
                className="w-48 h-48 rounded-3xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                  border: '2px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: selectedItem ? '0 0 40px rgba(59, 130, 246, 0.4)' : 'none'
                }}
              >
                {selectedItem ? (
                  <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
                    <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${getRarityColor(selectedItem.item.rarity)} flex items-center justify-center mb-2`}>
                      {selectedItem.item.icon ? (
                        <img src={selectedItem.item.icon} alt={selectedItem.item.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-white text-sm font-semibold truncate max-w-[160px]">{selectedItem.item.name}</div>
                      <div className="text-gray-400 text-xs">{selectedItem.item.basePrice.toFixed(0)}₽</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Центральный круг */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* Указатель сверху */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L2 12h20L12 2z"/>
                </svg>
              </div>

              <div 
                className="w-64 h-64 rounded-full flex items-center justify-center relative"
                style={{
                  background: 'radial-gradient(circle, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 70%)',
                  border: '3px solid rgba(139, 92, 246, 0.5)',
                  boxShadow: '0 0 60px rgba(139, 92, 246, 0.6), inset 0 0 40px rgba(0, 0, 0, 0.5)'
                }}
              >
                <div className="text-center px-6">
                  <div className="text-4xl font-bold text-white mb-2 break-words leading-tight" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}>
                    {getChanceText()}
                  </div>
                  {selectedItem && selectedTarget && (
                    <div className="text-xs text-gray-400">шанс успеха</div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Правый слот - целевой предмет */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div 
                className="w-48 h-48 rounded-3xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                  border: '2px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: selectedTarget ? '0 0 40px rgba(59, 130, 246, 0.4)' : 'none'
                }}
              >
                {selectedTarget ? (
                  <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
                    <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${getRarityColor(selectedTarget.rarity)} flex items-center justify-center mb-2`}>
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-sm font-semibold truncate max-w-[160px]">{selectedTarget.name}</div>
                      <div className="text-gray-400 text-xs">{selectedTarget.basePrice.toFixed(0)}₽</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Маскот справа */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-0 hidden xl:block"
              style={{ right: '-230px', top: '-50px' }}
            >
              <video
                ref={videoRef}
                className="w-[700px] h-auto"
                autoPlay
                loop
                muted
                playsInline
                src="/mascot_idle_app.webm"
              />
            </motion.div>
          </div>

          {/* Множители под кругом */}
          <div className="flex justify-center gap-4 mt-8">
            {['x1.5', 'x2', 'x5', 'x10', 'x20'].map((mult, idx) => (
              <div 
                key={mult}
                className="w-16 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              >
                {mult}
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка апгрейда */}
        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={selectedItem && selectedTarget && !upgrading && !result ? { scale: 1.05 } : {}}
            whileTap={selectedItem && selectedTarget && !upgrading && !result ? { scale: 0.95 } : {}}
            onClick={handleUpgrade}
            disabled={!selectedItem || !selectedTarget || upgrading || !!result}
            className="px-12 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3"
            style={{
              background: selectedItem && selectedTarget && !upgrading && !result
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)'
                : 'rgba(55, 65, 81, 0.5)',
              color: selectedItem && selectedTarget && !upgrading && !result ? 'white' : 'rgba(156, 163, 175, 0.5)',
              boxShadow: selectedItem && selectedTarget && !upgrading && !result ? '0 0 30px rgba(139, 92, 246, 0.5)' : 'none',
              cursor: selectedItem && selectedTarget && !upgrading && !result ? 'pointer' : 'not-allowed'
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {upgrading ? 'Апгрейд...' : 'Создать апгрейд'}
          </motion.button>
        </div>

        {/* Рулетка */}
        <AnimatePresence>
          {showRoulette && selectedTarget && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center mb-8"
            >
              <div className="relative h-16 w-full max-w-2xl rounded-xl overflow-hidden" style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
                <div 
                  className="absolute left-0 top-0 h-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ 
                    width: `${selectedTarget.chance}%`,
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                  }}
                >
                  WIN
                </div>
                <div 
                  className="absolute right-0 top-0 h-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ 
                    width: `${100 - selectedTarget.chance}%`,
                    background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                  }}
                >
                  LOSE
                </div>
                <motion.div
                  className="absolute top-0 w-1 h-full bg-white shadow-lg"
                  style={{ left: `${roulettePosition}%`, boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Результат */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-center mb-8"
            >
              <div 
                className="rounded-2xl p-6 text-center max-w-md"
                style={{
                  background: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `2px solid ${result.success ? '#10b981' : '#ef4444'}`
                }}
              >
                <h3 className="text-3xl font-bold mb-2" style={{ color: result.success ? '#10b981' : '#ef4444' }}>
                  {result.success ? 'Успех!' : 'Неудача'}
                </h3>
                <p className="text-gray-300">{result.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* НИЖНЯЯ ЗОНА - ДВА БЛОКА */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Ваш инвентарь */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
              <h2 className="text-xl font-bold text-white">Ваш инвентарь</h2>
            </div>

            {/* Фильтры */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <input
                type="text"
                placeholder="Поиск..."
                value={searchInventory}
                onChange={(e) => setSearchInventory(e.target.value)}
                className="col-span-2 px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500"
                style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
              />
              <input
                type="number"
                placeholder="От"
                value={minPriceInventory}
                onChange={(e) => setMinPriceInventory(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500"
                style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
              />
              <input
                type="number"
                placeholder="До"
                value={maxPriceInventory}
                onChange={(e) => setMaxPriceInventory(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500"
                style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
              />
            </div>

            {/* Карточки инвентаря */}
            <div className="grid grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredInventory.length === 0 ? (
                <div className="col-span-5 text-center py-12">
                  <p className="text-gray-500">Инвентарь пуст</p>
                </div>
              ) : (
                filteredInventory.map((invItem: any) => (
                  <motion.div
                    key={invItem.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectItem(invItem)}
                    className="relative cursor-pointer rounded-xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                      border: selectedItem?.id === invItem.id ? '2px solid #3b82f6' : '1px solid rgba(139, 92, 246, 0.3)',
                      boxShadow: selectedItem?.id === invItem.id ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
                    }}
                  >
                    {/* Значок выбора */}
                    {selectedItem?.id === invItem.id && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center z-10">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="p-3">
                      <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${getRarityColor(invItem.item.rarity)} flex items-center justify-center mb-2`}>
                        {invItem.item.icon ? (
                          <img src={invItem.item.icon} alt={invItem.item.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                          </svg>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-white text-xs font-semibold truncate mb-1">{invItem.item.name}</div>
                        <div className="text-gray-400 text-xs">{invItem.item.basePrice.toFixed(0)}₽</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Предметы для апгрейда */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
              <h2 className="text-xl font-bold text-white">Предметы</h2>
            </div>

            {!selectedItem ? (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-gray-500 text-center">Выберите предмет<br/>из инвентаря</p>
              </div>
            ) : (
              <>
                {/* Фильтры */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchUpgrades}
                    onChange={(e) => setSearchUpgrades(e.target.value)}
                    className="col-span-2 px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500"
                    style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                  />
                  <input
                    type="number"
                    placeholder="От"
                    value={minPriceUpgrades}
                    onChange={(e) => setMinPriceUpgrades(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500"
                    style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                  />
                  <input
                    type="number"
                    placeholder="До"
                    value={maxPriceUpgrades}
                    onChange={(e) => setMaxPriceUpgrades(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500"
                    style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                  />
                </div>

                {/* Карточки апгрейдов */}
                {loadingUpgrades ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : filteredUpgrades.length === 0 ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <p className="text-gray-500 text-center">Нет доступных<br/>апгрейдов</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredUpgrades.map((upgrade: any) => (
                      <motion.div
                        key={upgrade.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTarget(upgrade)}
                        className="relative cursor-pointer rounded-xl overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                          border: selectedTarget?.id === upgrade.id ? '2px solid #3b82f6' : '1px solid rgba(139, 92, 246, 0.3)',
                          boxShadow: selectedTarget?.id === upgrade.id ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
                        }}
                      >
                        {/* Значок выбора */}
                        {selectedTarget?.id === upgrade.id && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center z-10">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="p-3">
                          <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${getRarityColor(upgrade.rarity)} flex items-center justify-center mb-2`}>
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                            </svg>
                          </div>
                          <div className="text-center">
                            <div className="text-white text-xs font-semibold truncate mb-1">{upgrade.name}</div>
                            <div className="text-gray-400 text-xs mb-1">{upgrade.basePrice.toFixed(0)}₽</div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-blue-400">{upgrade.chance}%</span>
                              <span className="text-green-400">+{upgrade.priceDiff.toFixed(0)}₽</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.8);
        }
      `}</style>
    </div>
  );
}
