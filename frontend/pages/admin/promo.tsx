import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';
import Link from 'next/link';
import { ToastContainer } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

export default function AdminPromo() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();
  const [formData, setFormData] = useState({
    code: '',
    type: 'BALANCE',
    value: 0,
    maxUses: null as number | null,
    expiresAt: '',
    caseId: '',
    itemId: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      const [promoRes, casesRes, itemsRes] = await Promise.all([
        api.get('/api/admin/promo-codes'),
        api.get('/api/admin/cases'),
        api.get('/api/admin/items'),
      ]);
      setPromoCodes(promoRes.data);
      setCases(casesRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить промокод?')) return;
    try {
      await api.delete(`/api/admin/promo-codes/${id}`);
      showSuccess('Промокод удален');
      fetchData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка удаления');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Промокод скопирован в буфер обмена');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        maxUses: formData.maxUses || undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      };

      if (formData.type === 'BALANCE' || formData.type === 'DISCOUNT') {
        payload.value = formData.value;
      }

      if (formData.type === 'CASE_DROP') {
        payload.caseId = formData.caseId;
        payload.value = formData.value;
      }

      if (formData.type === 'ITEM') {
        payload.itemId = formData.itemId;
      }

      await api.post('/api/admin/promo-codes', payload);
      showSuccess('Промокод создан');
      setShowCreateModal(false);
      setFormData({
        code: '',
        type: 'BALANCE',
        value: 0,
        maxUses: null,
        expiresAt: '',
        caseId: '',
        itemId: '',
      });
      fetchData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка создания промокода');
    }
  };

  const getTypeText = (type: string) => {
    const types: Record<string, string> = {
      BALANCE: 'Баланс',
      DISCOUNT: 'Скидка',
      CASE_DROP: 'Бонус дропа',
      ITEM: 'Предмет',
    };
    return types[type] || type;
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition mb-2 inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад к админке
              </Link>
              <h1 className="text-4xl font-bold mb-2">Промокоды</h1>
              <p className="text-muted-foreground">Всего промокодов: {promoCodes.length}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              + Создать промокод
            </motion.button>
          </div>

          {/* Promo Codes Grid */}
          <div className="grid gap-4">
            {promoCodes.map((promo: any, i) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-mono font-bold text-primary">{promo.code}</div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(promo.code)}
                          className="p-2 glass rounded-lg hover:bg-primary/10 transition"
                          title="Копировать промокод"
                        >
                          📋
                        </motion.button>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        promo.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {promo.isActive ? '✓ Активен' : '✗ Неактивен'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500">
                        {getTypeText(promo.type)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Значение</div>
                        <div className="font-bold">
                          {promo.type === 'BALANCE' && `${promo.value} ₽`}
                          {promo.type === 'DISCOUNT' && `${promo.value}%`}
                          {promo.type === 'CASE_DROP' && `+${promo.value}%`}
                          {promo.type === 'ITEM' && promo.items?.[0]?.item?.name}
                        </div>
                      </div>
                      
                      {promo.type === 'CASE_DROP' && promo.case && (
                        <div>
                          <div className="text-muted-foreground mb-1">Кейс</div>
                          <div className="font-bold">{promo.case.name}</div>
                        </div>
                      )}
                      
                      <div>
                        <div className="text-muted-foreground mb-1">Использовано</div>
                        <div className="font-bold">{promo.usedCount} / {promo.maxUses || '∞'}</div>
                      </div>
                      
                      <div>
                        <div className="text-muted-foreground mb-1">Истекает</div>
                        <div className="font-bold">
                          {promo.expiresAt 
                            ? new Date(promo.expiresAt).toLocaleDateString('ru-RU', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric' 
                              })
                            : 'Никогда'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(promo.id)}
                      className="px-4 py-2 glass rounded-lg font-medium hover:bg-red-500/10 text-red-500 transition text-sm whitespace-nowrap"
                    >
                      🗑️ Удалить
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {promoCodes.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🎫</div>
                <div className="text-xl font-bold mb-2">Промокодов пока нет</div>
                <div className="text-muted-foreground">Создайте первый промокод для пользователей</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div 
              className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl"
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-background to-blue-900/30 rounded-3xl blur-xl" />
                <div className="relative glass rounded-3xl border-2 border-white/10 shadow-2xl max-h-[95vh] overflow-y-auto promo-modal-scroll">
                  
                  {/* Content */}
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                          Создать промокод
                        </h2>
                        <p className="text-muted-foreground">Настройте параметры нового промокода</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowCreateModal(false)}
                        className="w-12 h-12 rounded-xl glass hover:bg-red-500/20 flex items-center justify-center transition-all group"
                      >
                        <svg className="w-6 h-6 group-hover:text-red-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>
                    
                    <form onSubmit={handleCreate} className="space-y-6">
                      {/* Код промокода */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                        <div className="relative glass rounded-2xl p-6 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all">
                          <label className="block text-sm font-bold mb-3 text-purple-400 flex items-center gap-2">
                            <span className="text-2xl">📝</span>
                            Код промокода
                          </label>
                          <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-6 py-4 font-mono text-3xl text-center tracking-widest focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all placeholder:text-white/20"
                            placeholder="PROMO2026"
                            required
                            autoFocus
                          />
                          <p className="text-xs text-muted-foreground mt-2 text-center">Автоматически преобразуется в верхний регистр</p>
                        </div>
                      </motion.div>

                      {/* Тип промокода */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label className="block text-sm font-bold mb-4 flex items-center gap-2">
                          <span className="text-2xl">🎯</span>
                          Тип промокода
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { 
                              value: 'BALANCE', 
                              label: 'Баланс', 
                              icon: '💰',
                              desc: 'Пополнение баланса', 
                              gradient: 'from-green-500 via-emerald-500 to-teal-500',
                              shadow: 'shadow-green-500/50'
                            },
                            { 
                              value: 'DISCOUNT', 
                              label: 'Скидка', 
                              icon: '🏷️',
                              desc: 'Скидка на кейсы', 
                              gradient: 'from-orange-500 via-red-500 to-pink-500',
                              shadow: 'shadow-orange-500/50'
                            },
                            { 
                              value: 'CASE_DROP', 
                              label: 'Бонус дропа', 
                              icon: '🎲',
                              desc: 'Увеличение шанса', 
                              gradient: 'from-blue-500 via-cyan-500 to-teal-500',
                              shadow: 'shadow-blue-500/50'
                            },
                            { 
                              value: 'ITEM', 
                              label: 'Предмет', 
                              icon: '🎁',
                              desc: 'Конкретный предмет', 
                              gradient: 'from-purple-500 via-pink-500 to-rose-500',
                              shadow: 'shadow-purple-500/50'
                            },
                          ].map((type) => (
                            <motion.button
                              key={type.value}
                              type="button"
                              whileHover={{ scale: 1.03, y: -4 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setFormData({ ...formData, type: type.value, value: 0, caseId: '', itemId: '' })}
                              className={`relative p-6 rounded-2xl text-left transition-all overflow-hidden ${
                                formData.type === type.value
                                  ? `border-2 border-white/50 shadow-2xl ${type.shadow}`
                                  : 'glass border-2 border-white/10 hover:border-white/30'
                              }`}
                            >
                              {/* Background gradient */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} ${
                                formData.type === type.value ? 'opacity-20' : 'opacity-0'
                              } transition-opacity`} />
                              
                              {/* Animated border */}
                              {formData.type === type.value && (
                                <motion.div
                                  layoutId="activeTypeBorder"
                                  className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-30 blur-xl`}
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                              )}
                              
                              <div className="relative flex items-start gap-3">
                                <span className="text-4xl">{type.icon}</span>
                                <div className="flex-1">
                                  <div className="text-xl font-bold mb-1">{type.label}</div>
                                  <div className="text-sm text-muted-foreground">{type.desc}</div>
                                </div>
                                {formData.type === type.value && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
                                  >
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </motion.div>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>

                      {/* Динамические поля */}
                      <AnimatePresence mode="wait">
                        {(formData.type === 'BALANCE' || formData.type === 'DISCOUNT' || formData.type === 'CASE_DROP') && (
                          <motion.div
                            key="value-field"
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="relative group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                            <div className="relative glass rounded-2xl p-6 border-2 border-blue-500/30 hover:border-blue-500/50 transition-all">
                              <label className="block text-sm font-bold mb-3 text-blue-400 flex items-center gap-2">
                                {formData.type === 'BALANCE' && <><span className="text-2xl">💵</span> Сумма пополнения (₽)</>}
                                {formData.type === 'DISCOUNT' && <><span className="text-2xl">📉</span> Процент скидки (%)</>}
                                {formData.type === 'CASE_DROP' && <><span className="text-2xl">📈</span> Бонус к шансу (%)</>}
                              </label>
                              <input
                                type="number"
                                value={formData.value || ''}
                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-6 py-4 text-3xl text-center font-bold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                min="0"
                                step={formData.type === 'BALANCE' ? '1' : '0.01'}
                                placeholder={formData.type === 'BALANCE' ? '100' : '10'}
                                required
                              />
                            </div>
                          </motion.div>
                        )}

                        {formData.type === 'CASE_DROP' && (
                          <motion.div
                            key="case-field"
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            transition={{ type: "spring", damping: 20, delay: 0.1 }}
                            className="glass rounded-2xl p-6 border-2 border-cyan-500/30 hover:border-cyan-500/50 transition-all"
                          >
                            <label className="block text-sm font-bold mb-3 text-cyan-400 flex items-center gap-2">
                              <span className="text-2xl">🎲</span> Кейс для бонуса
                            </label>
                            <select
                              value={formData.caseId}
                              onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                              className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
                              required
                            >
                              <option value="">Выберите кейс</option>
                              {cases.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name} — {c.price} ₽</option>
                              ))}
                            </select>
                          </motion.div>
                        )}

                        {formData.type === 'ITEM' && (
                          <motion.div
                            key="item-field"
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="glass rounded-2xl p-6 border-2 border-pink-500/30 hover:border-pink-500/50 transition-all"
                          >
                            <label className="block text-sm font-bold mb-3 text-pink-400 flex items-center gap-2">
                              <span className="text-2xl">🎁</span> Предмет для выдачи
                            </label>
                            <select
                              value={formData.itemId}
                              onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                              className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                              required
                            >
                              <option value="">Выберите предмет</option>
                              {items.map((item: any) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} — {item.basePrice} ₽
                                </option>
                              ))}
                            </select>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Дополнительные настройки */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="glass rounded-2xl p-6 border-2 border-white/10 hover:border-yellow-500/30 transition-all">
                          <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                            <span className="text-2xl">🔢</span> Макс. использований
                          </label>
                          <input
                            type="number"
                            value={formData.maxUses || ''}
                            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 transition-all"
                            min="1"
                            placeholder="∞ Без ограничений"
                          />
                        </div>

                        <div className="glass rounded-2xl p-6 border-2 border-white/10 hover:border-orange-500/30 transition-all">
                          <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                            <span className="text-2xl">⏰</span> Дата истечения
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.expiresAt}
                            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                            className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                          />
                        </div>
                      </motion.div>

                      {/* Кнопки */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex gap-4 pt-6"
                      >
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 relative overflow-hidden rounded-2xl py-5 text-lg font-bold group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600" />
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                          <span className="relative flex items-center justify-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Создать промокод
                          </span>
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowCreateModal(false);
                            setFormData({
                              code: '',
                              type: 'BALANCE',
                              value: 0,
                              maxUses: null,
                              expiresAt: '',
                              caseId: '',
                              itemId: '',
                            });
                          }}
                          className="px-8 glass rounded-2xl py-5 text-lg font-bold hover:bg-red-500/20 hover:border-red-500/50 border-2 border-white/10 transition-all"
                        >
                          Отмена
                        </motion.button>
                      </motion.div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
