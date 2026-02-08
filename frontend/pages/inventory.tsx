import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Inventory() {
  const router = useRouter();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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

  const handleSell = async (itemId: string, price: number) => {
    try {
      const { data } = await api.post(`/api/inventory/${itemId}/sell`);
      if (user) {
        setUser({ ...user, balance: data.newBalance });
      }
      setSelectedItems(selectedItems.filter(id => id !== itemId));
      fetchInventory();
    } catch (error) {
      console.error('Failed to sell item:', error);
    }
  };

  const handleSellSelected = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      let totalEarned = 0;
      for (const itemId of selectedItems) {
        const item = inventory.find((i: any) => i.id === itemId);
        if (item) {
          const { data } = await api.post(`/api/inventory/${itemId}/sell`);
          totalEarned += item.item.basePrice;
        }
      }
      
      // Update balance
      if (user) {
        setUser({ ...user, balance: user.balance + totalEarned });
      }
      
      setSelectedItems([]);
      await fetchInventory();
    } catch (error) {
      console.error('Failed to sell items:', error);
    }
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventory.map((item: any) => item.id));
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      STALKER: 'from-blue-500 to-blue-600',
      VETERAN: 'from-purple-500 to-purple-600',
      MASTER: 'from-orange-500 to-orange-600',
      LEGENDARY: 'from-yellow-500 to-yellow-600',
    };
    return colors[rarity as keyof typeof colors] || 'from-gray-500 to-gray-600';
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

  const filteredInventory = filter === 'ALL' 
    ? inventory 
    : inventory.filter((item: any) => item.item.rarity === filter);

  const searchedInventory = searchQuery
    ? filteredInventory.filter((item: any) => 
        item.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredInventory;

  const sortedInventory = [...searchedInventory].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price-high':
        return b.item.basePrice - a.item.basePrice;
      case 'price-low':
        return a.item.basePrice - b.item.basePrice;
      case 'name':
        return a.item.name.localeCompare(b.item.name);
      case 'rarity':
        const rarityOrder = { Legendary: 5, Exceptional: 4, Rare: 3, Uncommon: 2, Common: 1 };
        return (rarityOrder[b.item.rarity as keyof typeof rarityOrder] || 0) - 
               (rarityOrder[a.item.rarity as keyof typeof rarityOrder] || 0);
      default:
        return 0;
    }
  });

  const totalValue = inventory.reduce((sum: number, item: any) => sum + item.item.basePrice, 0);
  const selectedValue = selectedItems.reduce((sum, id) => {
    const item = inventory.find((i: any) => i.id === id);
    return sum + (item ? item.item.basePrice : 0);
  }, 0);

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
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Инвентарь
              </h1>
              <p className="text-muted-foreground">
                У вас {inventory.length} {inventory.length === 1 ? 'предмет' : 'предметов'}
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="glass px-6 py-4 rounded-2xl"
              >
                <div className="text-sm text-muted-foreground mb-1">Общая стоимость</div>
                <div className="text-2xl font-bold text-primary">
                  {totalValue.toFixed(2)} ₽
                </div>
              </motion.div>

              {selectedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="glass px-6 py-4 rounded-2xl border-2 border-primary"
                >
                  <div className="text-sm text-muted-foreground mb-1">Выбрано ({selectedItems.length})</div>
                  <div className="text-2xl font-bold text-green-500">
                    {selectedValue.toFixed(2)} ₽
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск предметов..."
                  className="w-full glass px-4 py-3 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/50 backdrop-blur-xl border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.5rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              style={{
                colorScheme: 'dark'
              }}
            >
              <option value="recent" className="bg-[#1a1a1f] text-white">Недавние</option>
              <option value="price-high" className="bg-[#1a1a1f] text-white">Цена: по убыванию</option>
              <option value="price-low" className="bg-[#1a1a1f] text-white">Цена: по возрастанию</option>
              <option value="name" className="bg-[#1a1a1f] text-white">По названию</option>
              <option value="rarity" className="bg-[#1a1a1f] text-white">По редкости</option>
            </select>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap mb-4">
            {['ALL', 'STALKER', 'VETERAN', 'MASTER', 'LEGENDARY'].map((rarity) => (
              <motion.button
                key={rarity}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(rarity)}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  filter === rarity
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'glass hover:bg-primary/10'
                }`}
              >
                {rarity === 'ALL' ? 'Все' : getRarityText(rarity)}
              </motion.button>
            ))}
          </div>

          {/* Bulk Actions */}
          {sortedInventory.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={selectAll}
                className="glass px-4 py-2 rounded-xl font-medium hover:bg-primary/10 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {selectedItems.length === sortedInventory.length ? 'Снять выделение' : 'Выбрать все'}
              </motion.button>

              {selectedItems.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSellSelected}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Продать выбранное ({selectedItems.length})
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Inventory Grid */}
        {sortedInventory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">
              {searchQuery ? (
                <svg className="w-24 h-24 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ) : (
                <svg className="w-24 h-24 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
            </div>
            <p className="text-xl text-muted-foreground">
              {searchQuery 
                ? `Ничего не найдено по запросу "${searchQuery}"`
                : filter === 'ALL' 
                  ? 'Ваш инвентарь пуст' 
                  : `Нет предметов редкости "${getRarityText(filter)}"`
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <AnimatePresence mode="popLayout">
              {sortedInventory.map((invItem: any, index) => {
                const isSelected = selectedItems.includes(invItem.id);
                return (
                  <motion.div
                    key={invItem.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ y: -8 }}
                    onClick={() => toggleSelectItem(invItem.id)}
                    className={`glass rounded-2xl p-4 group cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary shadow-lg shadow-primary/50' : ''
                    }`}
                  >
                    {/* Selection indicator */}
                    <div className="flex justify-start items-start mb-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        isSelected 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Item icon */}
                    <div className={`aspect-square rounded-xl bg-gradient-to-br ${getRarityColor(invItem.item.rarity)} mb-3 flex items-center justify-center relative overflow-hidden p-4`}>
                      {invItem.item.icon ? (
                        <img 
                          src={invItem.item.icon} 
                          alt={invItem.item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg className="w-full h-full text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                      )}
                    </div>

                    {/* Item info */}
                    <h3 className={`text-sm font-bold mb-1 bg-gradient-to-r ${getRarityColor(invItem.item.rarity)} bg-clip-text text-transparent truncate`}>
                      {invItem.item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 truncate">{invItem.item.category}</p>

                    {/* Price and sell button */}
                    <div className="space-y-2">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Цена</div>
                        <div className="text-lg font-bold text-primary">
                          {invItem.item.basePrice.toFixed(0)} ₽
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSell(invItem.id, invItem.item.basePrice);
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
                      >
                        Продать
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
