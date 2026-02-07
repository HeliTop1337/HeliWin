import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchStats();
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/users/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarUrl.trim()) {
      showError('Введите URL аватарки');
      return;
    }

    try {
      const { data } = await api.post('/api/users/avatar', { avatarUrl });
      setUser(data);
      setShowAvatarModal(false);
      setAvatarUrl('');
      showSuccess('Аватарка успешно обновлена!');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка обновления аватарки');
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const { data } = await api.post('/api/users/avatar/delete');
      setUser(data);
      showSuccess('Аватарка удалена');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка удаления аватарки');
    }
  };

  if (!user) return null;

  return (
    <div className="py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <div className="glass rounded-3xl p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex items-center gap-6">
              <div className="relative group">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-24 h-24 rounded-2xl object-cover shadow-2xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-black text-white shadow-2xl">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                <div className="flex items-center gap-4">
                  <div className="glass px-4 py-2 rounded-xl">
                    <span className="text-sm text-muted-foreground">Роль: </span>
                    <span className="font-semibold text-primary">{user.role}</span>
                  </div>
                  <div className="glass px-4 py-2 rounded-xl">
                    <span className="text-sm text-muted-foreground">Баланс: </span>
                    <span className="font-bold text-2xl text-primary">{user.balance.toFixed(2)} ₽</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Открыто кейсов',
                  value: stats?.totalDrops || 0,
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  label: 'Потрачено',
                  value: `${stats?.totalSpent?.toFixed(2) || '0.00'} ₽`,
                  color: 'from-red-500 to-pink-500'
                },
                {
                  label: 'Выиграно',
                  value: `${stats?.totalWon?.toFixed(2) || '0.00'} ₽`,
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  label: 'Предметов',
                  value: stats?.inventoryCount || 0,
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-3xl p-8 mt-6"
          >
            <h2 className="text-2xl font-bold mb-6">Последняя активность</h2>
            
            <div className="space-y-4">
              {stats?.recentDrops?.length > 0 ? (
                stats.recentDrops.map((drop: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold">{drop.item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {drop.case.name} • {new Date(drop.createdAt).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {drop.item.basePrice.toFixed(2)} ₽
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Нет активности
                </div>
              )}
            </div>
          </motion.div>

          {/* Avatar Modal */}
          <AnimatePresence>
            {showAvatarModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowAvatarModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="glass rounded-3xl p-8 max-w-md w-full"
                >
                  <h2 className="text-2xl font-bold mb-6">Изменить аватарку</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">URL изображения</label>
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition"
                      />
                    </div>

                    {avatarUrl && (
                      <div className="flex justify-center">
                        <img
                          src={avatarUrl}
                          alt="Preview"
                          className="w-32 h-32 rounded-2xl object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUpdateAvatar}
                        className="flex-1 btn-primary"
                      >
                        Сохранить
                      </motion.button>
                      {user.avatar && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleDeleteAvatar}
                          className="px-4 py-3 glass rounded-xl font-semibold hover:bg-red-500/10 transition"
                        >
                          Удалить
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAvatarModal(false)}
                        className="px-4 py-3 glass rounded-xl font-semibold hover:bg-secondary transition"
                      >
                        Отмена
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
