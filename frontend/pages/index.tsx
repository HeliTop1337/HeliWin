import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import api from '../lib/api';
import CaseCard from '../components/CaseCard';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qualityFilter, setQualityFilter] = useState('ALL');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data } = await api.get('/api/cases');
      setCases(data);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (quality: string) => {
    const colors: Record<string, string> = {
      STALKER: 'from-blue-500 to-blue-600',
      VETERAN: 'from-purple-500 to-purple-600',
      MASTER: 'from-orange-500 to-orange-600',
      LEGENDARY: 'from-yellow-500 to-yellow-600',
    };
    return colors[quality] || 'from-gray-500 to-gray-600';
  };

  const getQualityText = (quality: string) => {
    const texts: Record<string, string> = {
      STALKER: 'Сталкерское',
      VETERAN: 'Ветеранское',
      MASTER: 'Мастерское',
      LEGENDARY: 'Легендарное',
    };
    return texts[quality] || quality;
  };

  const filteredCases = qualityFilter === 'ALL' 
    ? cases 
    : cases.filter((caseItem: any) => 
        caseItem.items?.some((item: any) => item.item.rarity === qualityFilter)
      );

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <motion.h1
              className="text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent gradient-animate"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                ease: "linear"
              }}
            >
              Добро пожаловать в HeliWin
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl text-muted-foreground mb-8"
            >
              Открывай кейсы, выигрывай легендарные предметы из вселенной Stalcraft
            </motion.p>
            
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/register')}
                  className="btn-primary text-lg px-8 py-4 glow-purple"
                >
                  Начать играть
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Войти
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
          >
            {[
              { label: 'Активных игроков', value: '10,000+' },
              { label: 'Открыто кейсов', value: '500K+' },
              { label: 'Выдано призов', value: '₽2M+' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Cases Section */}
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-6">Доступные кейсы</h2>
            
            {/* Quality Filters */}
            <div className="flex gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQualityFilter('ALL')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  qualityFilter === 'ALL'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                    : 'glass hover:bg-primary/10'
                }`}
              >
                Все качества
              </motion.button>
              
              {['LEGENDARY', 'MASTER', 'VETERAN', 'STALKER'].map((quality) => (
                <motion.button
                  key={quality}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQualityFilter(quality)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    qualityFilter === quality
                      ? `bg-gradient-to-r ${getQualityColor(quality)} text-white shadow-lg`
                      : 'glass hover:bg-primary/10'
                  }`}
                >
                  {getQualityText(quality)}
                </motion.button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl text-muted-foreground">
                Нет кейсов с предметами качества "{getQualityText(qualityFilter)}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCases.map((caseItem: any, index) => (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CaseCard caseData={caseItem} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Почему HeliWin?</h2>
          <p className="text-xl text-muted-foreground">Лучшая платформа для открытия кейсов</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Честная игра',
              description: 'Прозрачная система шансов и проверяемые результаты'
            },
            {
              title: 'Мгновенный вывод',
              description: 'Выводите выигрыш без задержек'
            },
            {
              title: 'Бонусы',
              description: 'Промокоды и акции для всех игроков'
            },
            {
              title: 'Безопасность',
              description: 'Защита данных и честные условия'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
