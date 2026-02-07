import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

enum RoundState {
  CRASH = 'CRASH',
  POST_CRASH_WAIT = 'POST_CRASH_WAIT',
  RESET = 'RESET',
  COUNTDOWN = 'COUNTDOWN',
  RUNNING = 'RUNNING',
}

interface Bet {
  username: string;
  amount: number;
  type: 'balance' | 'item';
  autoCashout: number;
  cashedOut: boolean;
  cashoutMultiplier?: number;
}

export default function CrashPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const { toasts, removeToast, success, error: showError } = useToast();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roundState, setRoundState] = useState<RoundState>(RoundState.COUNTDOWN);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [crashMultiplier, setCrashMultiplier] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState(2.00);
  const [betType, setBetType] = useState<'balance' | 'item'>('balance');
  const [hasBet, setHasBet] = useState(false);
  const [canCashout, setCanCashout] = useState(false);
  
  const [animation, setAnimation] = useState('idle');
  const [backgroundPlaying, setBackgroundPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Connect to WebSocket
  useEffect(() => {
    const newSocket = io('http://localhost:4000/crash', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to Crash server');
    });

    newSocket.on('round_state', (data) => {
      console.log('Round state:', data);
      setRoundState(data.state);
      setHistory(data.history || []);
      setBets(data.bets || []);
      
      if (data.crashMultiplier) {
        setCrashMultiplier(data.crashMultiplier);
      }
      
      if (data.state === RoundState.RUNNING && data.startTime) {
        startTimeRef.current = data.startTime;
      }
      
      if (user && data.bets) {
        const userBet = data.bets.find((b: Bet) => b.username === user.username);
        setHasBet(!!userBet);
        setCanCashout(!!userBet && !userBet.cashedOut && data.state === RoundState.RUNNING);
      }
    });

    newSocket.on('countdown_start', (data) => {
      const duration = data.duration / 1000;
      setCountdown(duration);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 0.1) {
            clearInterval(interval);
            return null;
          }
          return prev - 0.1;
        });
      }, 100);
    });

    newSocket.on('round_start', (data) => {
      startTimeRef.current = data.startTimestamp;
      setCountdown(null);
    });

    newSocket.on('round_crash', (data) => {
      setCrashMultiplier(data.crashMultiplier);
      setCanCashout(false);
    });

    newSocket.on('post_crash_wait', () => {
      console.log('Post crash wait started');
    });

    newSocket.on('round_reset', () => {
      console.log('Round reset started');
    });

    newSocket.on('round_end', (data) => {
      setHistory(data.history || []);
      setHasBet(false);
      setCanCashout(false);
    });

    newSocket.on('bet_placed', (data) => {
      setHasBet(true);
      if (data.newBalance !== undefined && user) {
        useAuthStore.setState({
          user: { ...user, balance: data.newBalance },
        });
      }
      success('Ставка принята!');
    });

    newSocket.on('bet_error', (data) => {
      showError(data.error);
    });

    newSocket.on('cashout_success', (data) => {
      success(`Выведено на ${data.multiplier.toFixed(2)}x! Выигрыш: ${data.profit.toFixed(2)} ₽`);
      setCanCashout(false);
      if (data.newBalance !== undefined && user) {
        useAuthStore.setState({
          user: { ...user, balance: data.newBalance },
        });
      }
    });

    newSocket.on('cashout_error', (data) => {
      showError(data.error);
    });

    newSocket.on('auto_cashout_success', (data) => {
      if (user && data.userId === user.id) {
        success(`Автовывод на ${data.multiplier.toFixed(2)}x! Выигрыш: ${data.profit.toFixed(2)} ₽`);
        setCanCashout(false);
        if (data.newBalance !== undefined) {
          useAuthStore.setState({
            user: { ...user, balance: data.newBalance },
          });
        }
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Animation logic
  useEffect(() => {
    const updateAnimation = () => {
      switch (roundState) {
        case RoundState.COUNTDOWN:
          setAnimation('idle');
          setBackgroundPlaying(false);
          break;
          
        case RoundState.RUNNING:
          setAnimation('run_game');
          setBackgroundPlaying(true);
          setTimeout(() => {
            setAnimation('run');
          }, 1000);
          break;
          
        case RoundState.CRASH:
          setAnimation('death');
          setBackgroundPlaying(false);
          break;
          
        case RoundState.POST_CRASH_WAIT:
          setAnimation('death');
          setBackgroundPlaying(false);
          break;
          
        case RoundState.RESET:
          setAnimation('back_posle_death');
          setBackgroundPlaying(false);
          break;
      }
    };

    updateAnimation();
  }, [roundState]);

  // Play mascot animation
  useEffect(() => {
    if (videoRef.current) {
      let videoFile = '';
      switch (animation) {
        case 'idle':
          videoFile = 'mascot_idle.webm';
          break;
        case 'run_game':
          videoFile = 'run_game.webm';
          break;
        case 'run':
          videoFile = 'run.webm';
          break;
        case 'death':
          videoFile = 'death.webm';
          break;
        case 'back_posle_death':
          videoFile = 'back_posle death.webm';
          break;
      }
      
      const videoSrc = `/${videoFile}`;
      const currentSrc = videoRef.current.src.split('/').pop();
      
      if (currentSrc !== videoFile) {
        videoRef.current.src = videoSrc;
        videoRef.current.load();
        videoRef.current.play().catch(e => console.error('Video play error:', e));
      }
    }
  }, [animation]);

  // Play/stop background
  useEffect(() => {
    if (bgVideoRef.current) {
      if (backgroundPlaying) {
        bgVideoRef.current.play().catch(e => console.error('BG play error:', e));
      } else {
        bgVideoRef.current.pause();
        bgVideoRef.current.currentTime = 0;
      }
    }
  }, [backgroundPlaying]);

  // Multiplier calculation
  useEffect(() => {
    if (roundState === RoundState.RUNNING && startTimeRef.current) {
      const updateMultiplier = () => {
        const elapsed = Date.now() - startTimeRef.current!;
        const mult = Math.pow(Math.E, elapsed / 10000);
        const calculated = Math.min(parseFloat(mult.toFixed(2)), crashMultiplier || 1000);
        setCurrentMultiplier(calculated);
        
        animationFrameRef.current = requestAnimationFrame(updateMultiplier);
      };
      
      updateMultiplier();
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      setCurrentMultiplier(1.00);
    }
  }, [roundState, crashMultiplier]);

  const handlePlaceBet = () => {
    if (!socket || !accessToken) return;
    
    socket.emit('place_bet', {
      token: accessToken,
      amount: betAmount,
      type: betType,
      autoCashout: autoCashout === 0 ? Infinity : autoCashout,
    });
  };

  const handleCashout = () => {
    if (!socket || !accessToken) return;
    
    socket.emit('cashout', { token: accessToken });
  };

  const getMultiplierColor = (mult: number) => {
    if (mult < 2) return 'from-blue-400 to-cyan-400';
    if (mult < 5) return 'from-purple-400 to-pink-400';
    if (mult < 10) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-yellow-400';
  };

  const getHistoryColor = (mult: number) => {
    if (mult < 2) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (mult < 5) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (mult < 10) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-yellow-500';
  };

  const userBets = bets.filter(bet => bet.username === user?.username);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="flex-1 bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Левая панель - Ставки */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass rounded-2xl p-6 space-y-4 border border-primary/20 sticky top-4">
              <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Crash
              </h2>
              
              {/* Баланс и инвентарь */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-xs text-gray-400">Баланс</span>
                  </div>
                  <div className="text-lg font-black text-white">{user?.balance.toFixed(0)}₽</div>
                </div>
                
                <div className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-xs text-gray-400">Инвентарь</span>
                  </div>
                  <div className="text-lg font-black text-white">63₽</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Множитель</label>
                <div className="relative">
                  <input
                    type="number"
                    value={autoCashout}
                    onChange={(e) => setAutoCashout(parseFloat(e.target.value))}
                    className="w-full glass rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1.01"
                    step="0.01"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[1.25, 1.5, 2, Infinity].map((mult, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAutoCashout(mult)}
                      className={`glass hover:bg-secondary rounded-lg py-2 text-sm font-bold transition-all ${
                        autoCashout === mult ? 'bg-purple-500/30 border border-purple-500' : ''
                      }`}
                    >
                      {mult === Infinity ? '∞' : `x${mult}`}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Сумма ставки</label>
                <div className="relative">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                    className="w-full glass rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[25, 100, 250].map(amount => (
                    <motion.button
                      key={amount}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setBetAmount(amount)}
                      className="glass hover:bg-secondary rounded-lg py-2 text-sm font-bold transition-all"
                    >
                      {amount}₽
                    </motion.button>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBetAmount(user?.balance || 0)}
                    className="glass hover:bg-secondary rounded-lg py-2 text-sm font-bold transition-all"
                  >
                    Max
                  </motion.button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {!hasBet && roundState === RoundState.COUNTDOWN ? (
                  <motion.button
                    key="place-bet"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceBet}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl py-4 font-black text-lg shadow-lg shadow-teal-500/50 transition-all"
                  >
                    Игра идёт...
                  </motion.button>
                ) : canCashout ? (
                  <motion.button
                    key="cashout"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, scale: [1, 1.02, 1] }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ scale: { repeat: Infinity, duration: 0.8 } }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCashout}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl py-4 font-black text-lg shadow-lg shadow-yellow-500/50 transition-all"
                  >
                    Забрать {currentMultiplier.toFixed(2)}x
                  </motion.button>
                ) : hasBet && !canCashout ? (
                  <motion.div
                    key="bet-placed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full glass rounded-xl py-4 text-center font-bold text-muted-foreground"
                  >
                    Ставка сделана
                  </motion.div>
                ) : (
                  <motion.button
                    key="waiting"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full glass rounded-xl py-4 text-center font-bold text-muted-foreground cursor-not-allowed"
                    disabled
                  >
                    Ожидание раунда...
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Основное игровое окно - на весь экран */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <div className="space-y-4">
              {/* Игровое поле - оптимизировано для видимости истории */}
              <div className="relative rounded-2xl overflow-hidden border-4 border-primary/30 shadow-2xl shadow-primary/20">
                <div className="relative bg-black" style={{ height: '55vh', minHeight: '400px', maxHeight: '600px' }}>
                  {/* Background Video */}
                  <video
                    ref={bgVideoRef}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    loop
                    muted
                    playsInline
                    autoPlay
                  >
                    <source src="/fone.webm" type="video/webm" />
                  </video>
                  
                  {/* Mascot Video */}
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-contain z-10"
                    loop={animation === 'idle' || animation === 'run'}
                    muted
                    playsInline
                    autoPlay
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 z-20" />
                  
                  {/* Информация слева вверху */}
                  <div className="absolute top-6 left-6 z-30 space-y-4">
                    <AnimatePresence mode="wait">
                      {/* Таймер или статус раунда */}
                      {roundState === RoundState.COUNTDOWN && countdown !== null ? (
                        <motion.div
                          key="countdown-info"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="glass rounded-xl p-4 backdrop-blur-md"
                        >
                          <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">ДО НАЧАЛА</div>
                          <div className="text-5xl font-black text-white">
                            00:{countdown.toFixed(0).padStart(2, '0')}
                          </div>
                        </motion.div>
                      ) : roundState === RoundState.RUNNING ? (
                        <motion.div
                          key="running-info"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="glass rounded-xl p-4 backdrop-blur-md border-2 border-cyan-500/50"
                        >
                          <div className="text-sm text-cyan-400 uppercase tracking-wider mb-1">КОЭФФИЦИЕНТ</div>
                          <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            x{currentMultiplier.toFixed(2)}
                          </div>
                        </motion.div>
                      ) : (roundState === RoundState.CRASH || roundState === RoundState.POST_CRASH_WAIT) && crashMultiplier ? (
                        <motion.div
                          key="crash-info"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="glass rounded-xl p-4 backdrop-blur-md border-2 border-red-500/50"
                        >
                          <div className="text-sm text-red-400 uppercase tracking-wider mb-1">РАУНД ЗАВЕРШЁН</div>
                          <div className="text-5xl font-black text-red-500">
                            x{crashMultiplier.toFixed(2)}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    {/* Банк */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass rounded-xl p-4 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">БАНК</div>
                          <div className="text-xl font-black text-white">{user?.balance.toFixed(0)}₽</div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Количество ставок */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="glass rounded-xl p-4 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">СТАВОК</div>
                          <div className="text-xl font-black text-white">{bets.length}</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* История */}
              <div className="glass rounded-2xl p-4 border border-primary/20">
                <h3 className="text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wider">История раундов</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <AnimatePresence>
                    {history.map((mult, idx) => (
                      <motion.div
                        key={`${mult}-${idx}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={`${getHistoryColor(mult)} rounded-xl px-4 py-2 text-sm font-black text-white whitespace-nowrap shadow-lg`}
                      >
                        {mult.toFixed(2)}x
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Активные ставки пользователя внизу */}
              {userBets.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-4 border border-primary/20"
                >
                  <h3 className="text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wider">Ставок пока нет</h3>
                  <div className="space-y-2">
                    {userBets.map((bet, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`glass rounded-xl p-3 border transition-all ${
                          bet.cashedOut 
                            ? 'border-green-500/50 bg-green-500/10' 
                            : 'border-primary/20'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-primary">{bet.amount}₽</span>
                            <span className="text-sm text-muted-foreground">
                              → {bet.autoCashout === Infinity ? '∞' : `${bet.autoCashout}x`}
                            </span>
                          </div>
                          {bet.cashedOut && bet.cashoutMultiplier && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-green-400 font-black text-lg"
                            >
                              {bet.amount}₽ → {(bet.amount * bet.cashoutMultiplier).toFixed(0)}₽
                            </motion.span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
