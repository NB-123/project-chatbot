import '../styles/globals.css';
import type { AppProps } from 'next/app';
import MainLayout from '../../components/MainLayout';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
