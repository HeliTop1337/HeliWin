import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const theme = useThemeStore((state) => state.theme);
  const { accessToken, setAccessToken } = useAuthStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Initialize auth token in axios on mount
  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}
