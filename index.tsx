
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registro do Service Worker para funcionalidade Offline/PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Guia Digital: S.O. Ativo (SW registrado):', registration.scope);
    }).catch(error => {
      console.log('Guia Digital: Falha na ativação do S.O. (SW erro):', error);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
