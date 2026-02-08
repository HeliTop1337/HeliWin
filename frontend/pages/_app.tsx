import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WinHistory from '../components/WinHistory';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect } from 'react';
import { SocketProvider } from '../contexts/SocketContext';

export default function App({ Component, pageProps }: AppProps) {
  const { accessToken, setAccessToken } = useAuthStore();

  // Всегда используем темную тему
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
  }, []);

  // Initialize auth token in axios on mount
  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
  }, [accessToken, setAccessToken]);

  return (
    <>
      <Head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </Head>
      <SocketProvider>
        <div className="min-h-screen flex flex-col">
          <WinHistory />
          <Header />
          <Component {...pageProps} />
          <Footer />
        </div>
      </SocketProvider>
    </>
  );
}
