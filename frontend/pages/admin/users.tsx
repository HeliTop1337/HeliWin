import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';
import Link from 'next/link';
import { ToastContainer } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

export default function AdminUsers() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, user, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/admin/users?page=${page}&limit=20`);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (error) {
      showError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !balanceAmount) return;
    
    try {
      await api.post(`/api/admin/users/${selectedUser.id}/balance`, { 
        amount: parseFloat(balanceAmount),
        reason: balanceReason || 'Корректировка администратором'
      });
      showSuccess('Баланс обновлен');
      setShowBalanceModal(false);
      setBalanceAmount('');
      setBalanceReason('');
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка обновления баланса');
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) return;
    
    try {
      await api.post(`/api/admin/users/${selectedUser.id}/ban`, { reason: banReason });
      showSuccess('Пользователь заблокирован');
      setShowBanModal(false);
      setBanReason('');
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка блокировки');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await api.post(`/api/admin/users/${userId}/unban`);
      showSuccess('Пользователь разблокирован');
      fetchUsers();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка разблокировки');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition mb-2 inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад к админке
              </Link>
              <h1 className="text-4xl font-bold mb-2">Управление пользователями</h1>
              <p className="text-muted-foreground">Всего пользователей: {total}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени или email..."
                className="w-full glass px-4 py-3 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Users List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <>
              <div className="glass rounded-3xl p-6">
                <div className="space-y-4">
                  {filteredUsers.map((u, i) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`glass rounded-xl p-4 ${u.isBanned ? 'border-2 border-red-500/50' : ''}`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.username} className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              {u.username}
                              {u.isBanned && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded-full">
                                  Заблокирован
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                            {u.isBanned && u.banReason && (
                              <div className="text-xs text-red-400 mt-1">Причина: {u.banReason}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Баланс</div>
                            <div className="text-lg font-bold text-primary">{u.balance.toFixed(2)} ₽</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Роль</div>
                            <div className={`text-sm font-bold ${
                              u.role === 'SUPER_ADMIN' ? 'text-red-500' :
                              u.role === 'ADMIN' ? 'text-yellow-500' :
                              'text-blue-500'
                            }`}>
                              {u.role}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedUser(u);
                                setShowBalanceModal(true);
                              }}
                              className="px-4 py-2 glass rounded-lg font-medium hover:bg-primary/10 transition text-sm"
                            >
                              💰 Баланс
                            </motion.button>
                            {u.isBanned ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUnbanUser(u.id)}
                                className="px-4 py-2 glass rounded-lg font-medium hover:bg-green-500/10 text-green-500 transition text-sm"
                              >
                                ✓ Разблокировать
                              </motion.button>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowBanModal(true);
                                }}
                                className="px-4 py-2 glass rounded-lg font-medium hover:bg-red-500/10 text-red-500 transition text-sm"
                              >
                                🚫 Бан
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 glass rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Назад
                  </motion.button>
                  <div className="px-4 py-2 glass rounded-lg font-medium">
                    Страница {page} из {totalPages}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 glass rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Вперед →
                  </motion.button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Balance Modal */}
      <AnimatePresence>
        {showBalanceModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass rounded-3xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-6">Изменить баланс</h2>
              <p className="text-muted-foreground mb-4">
                Пользователь: <span className="text-foreground font-bold">{selectedUser.username}</span>
              </p>
              <p className="text-muted-foreground mb-6">
                Текущий баланс: <span className="text-primary font-bold">{selectedUser.balance.toFixed(2)} ₽</span>
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Сумма (+ добавить, - вычесть)</label>
                  <input
                    type="number"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="100 или -50"
                    step="0.01"
                    className="input w-full"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Причина (опционально)</label>
                  <input
                    type="text"
                    value={balanceReason}
                    onChange={(e) => setBalanceReason(e.target.value)}
                    placeholder="Корректировка баланса"
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateBalance}
                  disabled={!balanceAmount}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Применить
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowBalanceModal(false);
                    setBalanceAmount('');
                    setBalanceReason('');
                    setSelectedUser(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Отмена
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ban Modal */}
      <AnimatePresence>
        {showBanModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass rounded-3xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-6 text-red-500">Заблокировать пользователя</h2>
              <p className="text-muted-foreground mb-6">
                Вы уверены, что хотите заблокировать <span className="text-foreground font-bold">{selectedUser.username}</span>?
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Причина блокировки</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Укажите причину блокировки..."
                  className="input w-full min-h-[100px]"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBanUser}
                  disabled={!banReason}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Заблокировать
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowBanModal(false);
                    setBanReason('');
                    setSelectedUser(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Отмена
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
