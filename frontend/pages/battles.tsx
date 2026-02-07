import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Battles() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBattles();
    const interval = setInterval(fetchBattles, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBattles = async () => {
    try {
      const { data } = await api.get('/api/battles');
      setBattles(data);
    } catch (error) {
      console.error('Failed to fetch battles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBattle = async (battleId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      await api.post(`/api/battles/${battleId}/join`);
      fetchBattles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Не удалось присоединиться к батлу');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      waiting: 'from-yellow-500 to-orange-500',
      active: 'from-green-500 to-emerald-500',
      finished: 'from-gray-500 to-gray-600',
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      waiting: 'Ожидание',
      active: 'Активен',
      finished: 'Завершен',
    };
    return texts[status] || status;
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
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-5xl font-bold">Батлы кейсов</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Соревнуйся с другими игроками за лучший дроп!
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="btn-primary glow-purple"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Создать батл
              </span>
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Активных батлов', value: battles.filter((b: any) => b.status === 'waiting').length },
              { label: 'Всего игроков', value: battles.reduce((sum: number, b: any) => sum + b.players.length, 0) },
              { label: 'Завершено сегодня', value: battles.filter((b: any) => b.status === 'finished').length }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Battles Grid */}
        {battles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-muted-foreground mb-6">Нет активных батлов</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Создать первый батл
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {battles.map((battle: any, index) => (
                <motion.div
                  key={battle.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="glass rounded-3xl p-6 relative overflow-hidden"
                >
                  {/* Background gradient */}
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${getStatusColor(battle.status)}/10 rounded-full blur-3xl`} />
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{battle.case?.name || 'Кейс'}</h3>
                          <p className="text-sm text-muted-foreground">ID: {battle.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-xl bg-gradient-to-r ${getStatusColor(battle.status)} text-white text-sm font-bold shadow-lg`}>
                        {getStatusText(battle.status)}
                      </div>
                    </div>

                    {/* Players */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Игроки</span>
                        <span className="text-sm font-bold">
                          {battle.players.length}/{battle.maxPlayers}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: battle.maxPlayers }).map((_, i) => {
                          const player = battle.players[i];
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className={`glass rounded-xl p-3 ${
                                player ? 'border border-primary/50' : 'border border-dashed border-border'
                              }`}
                            >
                              {player ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                    {player.user.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold truncate">{player.user.username}</div>
                                    {player.totalValue > 0 && (
                                      <div className="text-xs text-primary">{player.totalValue.toFixed(2)} ₽</div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-muted-foreground text-sm">
                                  Ожидание...
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Button */}
                    {battle.status === 'waiting' && battle.players.length < battle.maxPlayers && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleJoinBattle(battle.id)}
                        className="w-full btn-primary glow-purple"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Присоединиться - {battle.case?.price.toFixed(2)} ₽
                        </span>
                      </motion.button>
                    )}

                    {battle.status === 'finished' && battle.winner && (
                      <div className="glass rounded-xl p-4 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Победитель</div>
                        <div className="text-xl font-bold text-primary flex items-center justify-center gap-2">
                          {battle.winner.user.username}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
