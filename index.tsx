
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

/**
 * Registro Blindado de Service Worker
 * 1. Evita ambientes de sandbox (usercontent.goog)
 * 2. Verifica existência do arquivo via HEAD request antes de registrar
 * 3. Falha silenciosa com log informativo
 */
const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isSandbox = hostname.includes('usercontent.goog') || hostname.includes('webcontainer.io');
  
  // Registramos apenas em domínios oficiais ou localhost para desenvolvimento
  if (isSandbox) {
    console.info('[PWA] Ambiente de sandbox detectado. Registro de SW ignorado.');
    return;
  }

  const swPath = './sw.js';

  try {
    // Prova de existência: evita o erro 404 no console do register()
    const response = await fetch(swPath, { method: 'HEAD' });
    
    if (response.ok) {
      const registration = await navigator.serviceWorker.register(swPath, {
        scope: './',
      });
      console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);
    } else {
      console.info('[PWA] sw.js não encontrado no servidor. Modo offline desabilitado.');
    }
  } catch (error) {
    // Erros de rede ou segurança (CORS) caem aqui
    console.debug('[PWA] Registro de SW não disponível neste contexto:', error.message);
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
