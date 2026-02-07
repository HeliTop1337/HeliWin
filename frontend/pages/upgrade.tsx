import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';

export default function Upgrade() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [availableUpgrades, setAvailableUpgrades] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUpgrades, setLoadingUpgrades] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchInventory();
  }, [isAuthenticated]);

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
    fetchAvailableUpgrades(item.itemId);
  };

  const handleUpgrade = async () => {
    if (!selectedItem || !selectedTarget) return;
    
    setUpgrading(true);
    setResult(null);

    try {
      const { data } = await api.post('/api/upgrades', {
        fromItemId: selectedItem.id,
        toItemId: selectedTarget.id,
      });
      setResult(data);
      
      setTimeout(() => {
        fetchInventory();
        setSelectedItem(null);
        setSelectedTarget(null);
        setAvailableUpgrades([]);
        setResult(null);
      }, 3000);
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: error.response?.data?.message || 'Ошибка апгрейда' 
      });
    } finally {
      setUpgrading(false);
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

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Апгрейд предметов</h1>
          <p className="text-xl text-muted-foreground">
            Улучши свои предметы с шансом на успех!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Inventory Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Выберите предмет</h2>
            
            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Ваш инвентарь пуст</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {inventory.map((invItem: any) => (
                  <motion.div
                    key={invItem.id}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectItem(invItem)}
                    className={`glass rounded-xl p-4 cursor-pointer transition ${
                      selectedItem?.id === invItem.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getRarityColor(invItem.item.rarity)} flex items-center justify-center shadow-lg p-1`}>
                        {invItem.item.icon ? (
                          <img 
                            src={invItem.item.icon} 
                            alt={invItem.item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-sm truncate bg-gradient-to-r ${getRarityColor(invItem.item.rarity)} bg-clip-text text-transparent`}>
                          {invItem.item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{invItem.item.basePrice.toFixed(2)} ₽</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Available Upgrades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Доступные апгрейды</h2>
            
            {!selectedItem ? (
              <div className="flex items-center justify-center h-[600px]">
                <p className="text-muted-foreground">Выберите предмет</p>
              </div>
            ) : loadingUpgrades ? (
              <div className="flex items-center justify-center h-[600px]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                />
              </div>
            ) : availableUpgrades.length === 0 ? (
              <div className="flex items-center justify-center h-[600px]">
                <p className="text-muted-foreground">Нет доступных апгрейдов</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {availableUpgrades.map((upgrade: any) => (
                  <motion.div
                    key={upgrade.id}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTarget(upgrade)}
                    className={`glass rounded-xl p-4 cursor-pointer transition ${
                      selectedTarget?.id === upgrade.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getRarityColor(upgrade.rarity)} flex items-center justify-center shadow-lg`}>
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-sm truncate bg-gradient-to-r ${getRarityColor(upgrade.rarity)} bg-clip-text text-transparent`}>
                          {upgrade.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{upgrade.basePrice.toFixed(2)} ₽</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Шанс</div>
                        <div className="text-sm font-bold text-primary">{upgrade.chance}%</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      +{upgrade.priceDiff.toFixed(2)} ₽
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Upgrade Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Апгрейд</h2>
            
            {!selectedItem || !selectedTarget ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {!selectedItem ? 'Выберите предмет' : 'Выберите целевой предмет'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* From Item */}
                <div className="glass rounded-2xl p-4">
                  <div className="text-sm text-muted-foreground mb-2">Текущий предмет</div>
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getRarityColor(selectedItem.item.rarity)} flex items-center justify-center shadow-lg p-2`}>
                      {selectedItem.item.icon ? (
                        <img 
                          src={selectedItem.item.icon} 
                          alt={selectedItem.item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold bg-gradient-to-r ${getRarityColor(selectedItem.item.rarity)} bg-clip-text text-transparent`}>
                        {selectedItem.item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedItem.item.basePrice.toFixed(2)} ₽</p>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </div>

                {/* To Item */}
                <div className="glass rounded-2xl p-4">
                  <div className="text-sm text-muted-foreground mb-2">Целевой предмет</div>
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getRarityColor(selectedTarget.rarity)} flex items-center justify-center shadow-lg`}>
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold bg-gradient-to-r ${getRarityColor(selectedTarget.rarity)} bg-clip-text text-transparent`}>
                        {selectedTarget.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedTarget.basePrice.toFixed(2)} ₽</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-sm text-muted-foreground">Шанс успеха</div>
                    <div className="text-2xl font-bold text-primary">{selectedTarget.chance}%</div>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-sm text-muted-foreground">Разница</div>
                    <div className="text-2xl font-bold text-green-500">+{selectedTarget.priceDiff.toFixed(2)} ₽</div>
                  </div>
                </div>

                {/* Result Display */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`rounded-2xl p-6 text-center ${
                        result.success 
                          ? 'bg-green-500/10 border-2 border-green-500' 
                          : 'bg-red-500/10 border-2 border-red-500'
                      }`}
                    >
                      <h3 className={`text-2xl font-bold mb-2 ${
                        result.success ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {result.success ? 'Успех!' : 'Неудача'}
                      </h3>
                      <p className="text-muted-foreground">{result.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upgrade Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  disabled={upgrading || !!result}
                  className="w-full btn-primary glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {upgrading ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Апгрейд...
                    </div>
                  ) : (
                    'Улучшить предмет'
                  )}
                </motion.button>

                {/* Info */}
                <div className="glass rounded-xl p-4">
                  <div className="text-sm text-muted-foreground">
                    <strong>Внимание:</strong> При неудачном апгрейде предмет будет утерян. Шанс зависит от разницы в цене.
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
