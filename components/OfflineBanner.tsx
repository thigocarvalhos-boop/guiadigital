
import React, { useState, useEffect } from 'react';

const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-auto z-[9999] animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 px-6 py-4 bg-amber-600 text-white rounded-2xl shadow-2xl font-black uppercase text-[11px] md:text-xs tracking-widest">
        <i className="fa-solid fa-wifi-slash text-lg"></i>
        <span>MODO OFFLINE — A auditoria de IA não está disponível</span>
      </div>
    </div>
  );
};

export default OfflineBanner;
