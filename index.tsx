
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("STREET_OS: Booting sequence initiated...");

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('STREET_OS_FATAL: Root element missing in DOM');
    return;
  }

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
        console.log("STREET_OS: Visual interface active.");
      }, 500);
    }
  } catch (err) {
    console.error('STREET_OS_FATAL_INIT:', err);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
