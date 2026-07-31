import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app/globals.css';
import { CartToastProvider } from '@/components/CartToast';
import PWAInstaller from '@/components/PWAInstaller';
import ChatWidget from '@/components/ChatWidget';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CartToastProvider>
      <App />
      <PWAInstaller />
      <ChatWidget />
    </CartToastProvider>
  </React.StrictMode>
);
