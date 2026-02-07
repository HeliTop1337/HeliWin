import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';
import Link from 'next/link';
import { ToastContainer } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

export default function AdminCases() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
      return;
    }
    fetchCases();
  }, [isAuthenticated, user]);

  const fetchCases = async () => {
    try {
      const { data } = await api.get('/api/cases');
      setCases(data);
    } catch (error) {
      showError('Ошибка загрузки кейсов');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (caseId: string, isActive: boolean) => {
    try {
      await api.patch(`/api/admin/cases/${caseId}`, { isActive: !isActive });
      showSuccess(isActive ? 'Кейс деактивирован' : 'Кейс активирован');
      fetchCases();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка обновления кейса');
    }
  };

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
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition mb-2 inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад к админке
            </Link>
            <h1 className="text-4xl font-bold mb-2">Управление кейсами</h1>
            <p className="text-muted-foreground">Всего кейсов: {cases.length}</p>
          </div>

          {/* Cases List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{c.name}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      c.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {c.isActive ? 'Активен' : 'Неактивен'}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{c.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Цена</div>
                      <div className="text-2xl font-bold text-primary">{c.price.toFixed(2)} ₽</div>
                    </div>
                    {c.discount > 0 && (
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{c.discount}%
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground mb-4">
                    Предметов: {c.items?.length || 0}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleActive(c.id, c.isActive)}
                    className={`w-full px-4 py-2 rounded-xl font-semibold transition ${
                      c.isActive
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    }`}
                  >
                    {c.isActive ? 'Деактивировать' : 'Активировать'}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
