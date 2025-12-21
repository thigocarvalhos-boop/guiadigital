
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const render = () => {
  const container = document.getElementById('root');
  if (!container) return;
  
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Registro de Service Worker seguro para Produção e Sandbox
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Verifica se o Service Worker existe no mesmo origin antes de tentar registrar
      const swPath = './sw.js';
      const registration = await navigator.serviceWorker.register(swPath);
      console.log('SW registered successfully:', registration.scope);
    } catch (error) {
      console.warn('Service Worker registration skipped or failed:', error.message);
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    render();
    registerServiceWorker();
  });
} else {
  render();
  registerServiceWorker();
}
