
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('STREET_OS_FATAL: Root element not found');
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Remove o overlay de carregamento assim que o React assumir
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 400);
      }, 300);
    }
    
    console.log('STREET_OS: System Online');
  } catch (err) {
    console.error('STREET_OS_BOOT_ERROR:', err);
    const loaderText = document.querySelector('#loading-overlay div');
    if (loaderText) {
      loaderText.innerHTML = 'ERRO DE INICIALIZAÇÃO';
      (loaderText as HTMLElement).style.color = '#ff4d00';
    }
  }
};

// Executa a inicialização
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
