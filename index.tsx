
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Registro do Service Worker otimizado
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.error('SW Error:', err));
  });
}

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

// Garante que o DOM está pronto antes de renderizar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', render);
} else {
  render();
}
