import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * PWA Helper: Probe-and-Register
 * Implementa uma estratégia de registro seguro que evita erros 404 ruidosos
 * e garante o registro apenas em domínios de produção autorizados.
 * 
 * @param {string} swPath - Caminho do script do Service Worker
 * @param {string} scope - Escopo de atuação do SW
 * @param {string[]} allowlist - Domínios permitidos para registro
 */
const probeAndRegisterSW = async (
  swPath = './sw.js',
  scope = './',
  allowlist = ["guiadigital.org", "www.guiadigital.org"]
) => {
  if (!('serviceWorker' in navigator)) return;

  const { hostname } = window.location;
  
  // 1. Filtros de Ambiente (Exclui Localhost e Sandboxes)
  const isExcluded = 
    hostname.includes('usercontent.goog') || 
    hostname.includes('aistudio') ||
    hostname.includes('webcontainer.io') ||
    hostname === 'localhost' || 
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local');

  // 2. Validação contra Allowlist de Produção
  const isAllowed = allowlist.includes(hostname);

  if (isExcluded || !isAllowed) {
    console.info(`[PWA] Registro de Service Worker ignorado no ambiente: ${hostname}`);
    return;
  }

  try {
    // 3. Probe (Sondagem): Verifica existência do arquivo sem disparar o erro nativo do register()
    // Usamos 'no-cache' para garantir que não estamos vendo um 200 falso do próprio SW antigo
    const response = await fetch(swPath, { method: 'HEAD', cache: 'no-store' });
    
    if (response.ok) {
      const registration = await navigator.serviceWorker.register(swPath, { scope });
      console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);
    } else {
      console.info(`[PWA] Arquivo ${swPath} não encontrado (Status: ${response.status}). Modo offline indisponível.`);
    }
  } catch (error) {
    // 4. Tratamento de exceções (ex: erros de rede ou segurança)
    console.debug('[PWA] Falha silenciosa na sondagem do Service Worker:', error.message);
  }
};

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

// Inicialização segura após o carregamento completo da página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    render();
    // Registra o SW apenas se o DOM estiver pronto, garantindo melhor performance
    void probeAndRegisterSW();
  });
} else {
  render();
  void probeAndRegisterSW();
}
