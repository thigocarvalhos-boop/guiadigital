import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * MODO DE ENGENHARIA CRÍTICA: SERVICE WORKER ELIMINADO
 * Para assegurar que não haja requisições HEAD 404 para sw.js no console,
 * todo o código de registro e verificação foi removido do bundle.
 */

const renderApp = () => {
  const container = document.getElementById('root');
  if (!container) return;
  
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Inicialização imediata sem efeitos colaterais de rede
window.addEventListener('load', renderApp);
