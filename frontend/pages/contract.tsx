import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

export default function Contract() {
  const router = useRouter();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

  const MAX_ITEMS = 10;
  const MIN_ITEMS = 3;

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
      showError('Ошибка загрузки инвентаря');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (item: any) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else if (selectedItems.length < MAX_ITEMS) {
      setSelectedItems([...selectedItems, item]);
    } else {
      showError(`Максимум ${MAX_ITEMS} предметов`);
    }
  };

  const handleCreateContract = async () => {
    if (selectedItems.length < MIN_ITEMS) {
      showError(`Добавьте ещё ${MIN_ITEMS - selectedItems.length} предмета`);
      return;
    }

    setCreating(true);
    try {
      const itemIds = selectedItems.map(i => i.id);
      console.log('=== FRONTEND: Creating contract ===');
      console.log('Selected items:', selectedItems);
      console.log('Item IDs to send:', itemIds);
      console.log('Request payload:', { itemIds });
      
      const { data } = await api.post('/api/contract/create', {
        itemIds: itemIds,
      });

      console.log('Contract result:', data);

      setResult(data);
      if (user) {
        setUser({ ...user, balance: data.newBalance });
      }
      showSuccess(`Вы получили ${data.item.name}!`);
      
      // Обновляем инвентарь
      await fetchInventory();
      setSelectedItems([]);
    } catch (error: any) {
      console.error('=== FRONTEND: Contract error ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error message:', error.message);
      showError(error.response?.data?.message || 'Ошибка создания контракта');
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveAll = () => {
    setSelectedItems([]);
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      STALKER: 'from-blue-500 to-blue-600',
      VETERAN: 'from-purple-500 to-purple-600',
      MASTER: 'from-orange-500 to-orange-600',
      LEGENDARY: 'from-yellow-500 to-yellow-600',
    };
    return colors[rarity] || 'from-gray-500 to-gray-600';
  };

  const getRarityText = (rarity: string) => {
    const texts: Record<string, string> = {
      STALKER: 'Сталкерское',
      VETERAN: 'Ветеранское',
      MASTER: 'Мастерское',
      LEGENDARY: 'Легендарное',
    };
    return texts[rarity] || rarity;
  };

  const totalValue = selectedItems.reduce((sum, item) => sum + item.item.basePrice, 0);
  const minValue = totalValue * 0.8;
  const maxValue = totalValue * 1.2;

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
    <div className="py-8 min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Контракт</h1>
          <p className="text-muted-foreground">
            Добавьте от {MIN_ITEMS} до {MAX_ITEMS} предметов. В результате вы получите предмет стоимостью от {minValue.toFixed(0)}₽ до {maxValue.toFixed(0)}₽
          </p>
        </motion.div>

        {/* Selected Items Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedItems.length} предметов. {totalValue.toFixed(0)}₽
              </h2>
              <p className="text-sm text-muted-foreground">
                Добавьте ещё {Math.max(0, MIN_ITEMS - selectedItems.length)} предмета
              </p>
            </div>
            <div className="flex gap-3">
              {selectedItems.length >= MIN_ITEMS && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateContract}
                  disabled={creating}
                  className="btn-primary px-6 py-3 disabled:opacity-50"
                >
                  {creating ? 'Создание...' : 'Создать контракт'}
                </motion.button>
              )}
              {selectedItems.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRemoveAll}
                  className="glass px-6 py-3 rounded-xl font-semibold hover:bg-destructive/10 text-destructive"
                >
                  Удалить всё
                </motion.button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
            {Array.from({ length: MAX_ITEMS }).map((_, index) => {
              const item = selectedItems[index];
              return (
                <motion.div
                  key={index}
                  className={`aspect-square rounded-xl border-2 ${
                    item
                      ? `bg-gradient-to-br ${getRarityColor(item.item.rarity)} border-transparent`
                      : 'border-dashed border-muted-foreground/30 bg-muted/20'
                  } flex items-center justify-center p-2 relative`}
                >
                  {item ? (
                    <>
                      {item.item.icon ? (
                        <img
                          src={item.item.icon}
                          alt={item.item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                      )}
                      <button
                        onClick={() => toggleItem(item)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center text-xs font-bold hover:scale-110 transition"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <svg className="w-8 h-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </motion.div>
              );
            })}
          </div>

          {selectedItems.length >= MIN_ITEMS && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <p className="text-lg">
                В результате вы получите предмет стоимостью от{' '}
                <span className="text-primary font-bold">{minValue.toFixed(0)}₽</span> до{' '}
                <span className="text-primary font-bold">{maxValue.toFixed(0)}₽</span>
              </p>
            </motion.div>
          )}
        </motion.div>

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
                <h2 className="text-3xl font-bold mb-4">Вы получили!</h2>
                
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
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setResult(null)}
                  className="btn-primary mt-6"
                >
                  Закрыть
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inventory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6">Ваш инвентарь</h2>
          
          {inventory.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-24 h-24 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-xl text-muted-foreground">Ваш инвентарь пуст</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {inventory.map((invItem: any) => {
                const isSelected = selectedItems.find(i => i.id === invItem.id);
                return (
                  <motion.div
                    key={invItem.id}
                    whileHover={{ y: -5 }}
                    onClick={() => toggleItem(invItem)}
                    className={`glass rounded-lg p-2 cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary shadow-lg shadow-primary/50' : ''
                    }`}
                  >
                    <div className={`w-full aspect-square rounded-md bg-gradient-to-br ${getRarityColor(invItem.item.rarity)} mb-2 flex items-center justify-center p-1.5`}>
                      {invItem.item.icon ? (
                        <img 
                          src={invItem.item.icon} 
                          alt={invItem.item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                      )}
                    </div>
                    <h4 className={`font-bold text-xs mb-0.5 bg-gradient-to-r ${getRarityColor(invItem.item.rarity)} bg-clip-text text-transparent truncate`}>
                      {invItem.item.name}
                    </h4>
                    <p className="text-[10px] text-primary font-bold">{invItem.item.basePrice.toFixed(0)} ₽</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
