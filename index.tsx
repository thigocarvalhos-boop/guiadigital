
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("GUI.A_DIGITAL: Iniciando sequência de boot...");

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Fade out do loader
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 400);
        console.log("GUI.A_DIGITAL: Interface ativa.");
      }, 800);
    }
  } catch (err) {
    console.error('GUI.A_DIGITAL_FATAL_INIT:', err);
  }
} else {
  console.error('GUI.A_DIGITAL: Elemento #root não encontrado no DOM.');
}
