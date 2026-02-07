import Link from 'next/link';
import { useAuthStore } from '../store/useAuthStore';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import OnlineCounter from './OnlineCounter';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getAvatarUrl = (filename: string | null | undefined) => {
    if (!filename) return null;
    return `http://localhost:4000/uploads/avatars/${filename}`;
  };

  const avatarUrl = getAvatarUrl(user?.avatar);
  const isVideoAvatar = user?.avatar?.endsWith('.mp4');

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-gradient-to-b from-black/60 to-black/40 border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="HeliWin" className="h-10 w-auto" />
            <div className="text-2xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              HeliWin
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={router.pathname === '/'}>
              Кейсы
            </NavLink>
            <NavLink href="/crash" active={router.pathname === '/crash'}>
              Crash
            </NavLink>
            <NavLink href="/contract" active={router.pathname === '/contract'}>
              Контракт
            </NavLink>
            <NavLink href="/battles" active={router.pathname === '/battles'}>
              Батлы
            </NavLink>
            <NavLink href="/upgrade" active={router.pathname === '/upgrade'}>
              Апгрейд
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink href="/inventory" active={router.pathname === '/inventory'}>
                  Инвентарь
                </NavLink>
                <NavLink href="/promo" active={router.pathname === '/promo'}>
                  Промокоды
                </NavLink>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <NavLink href="/admin" active={router.pathname.startsWith('/admin')}>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Админка
                    </span>
                  </NavLink>
                )}
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <OnlineCounter />
            
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <div className="glass px-4 py-2 rounded-lg">
                    <div className="text-xs text-muted-foreground">Баланс</div>
                    <div className="font-bold text-primary">{user?.balance.toFixed(2)} ₽</div>
                  </div>
                  
                  <Link href="/profile">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="glass px-4 py-2 rounded-lg font-medium hover:bg-primary/10 transition flex items-center gap-2"
                    >
                      {avatarUrl && (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/30">
                          {isVideoAvatar ? (
                            <video
                              src={avatarUrl}
                              autoPlay
                              loop
                              muted
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={avatarUrl}
                              alt={user?.username}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )}
                      {user?.username}
                    </motion.button>
                  </Link>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg font-medium text-destructive hover:bg-destructive/10 transition"
                  >
                    Выход
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg font-medium hover:bg-secondary transition"
                  >
                    Вход
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                  >
                    Регистрация
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <motion.div
        className={`relative px-4 py-2 rounded-lg font-medium transition-colors ${
          active
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
      >
        {children}
      </motion.div>
    </Link>
  );
}
