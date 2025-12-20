
import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { MODULES as INITIAL_MODULES, OPPORTUNITIES } from './constants.tsx';
import { Module, Lesson, Opportunity, ChatMessage, LeaderboardEntry } from './types.ts';
import { GoogleGenAI } from "@google/genai";
import { initDB, addToSyncQueue, getSyncQueue, clearSyncItem } from './db.ts';

const getAI = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : null;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'Marcos Silva', xp: 15400, impact: 'R$ 4.2k', avatar: 'MS' },
  { id: '2', name: 'Ana Souza', xp: 12100, impact: 'R$ 3.8k', avatar: 'AS' },
  { id: '3', name: 'Você', xp: 0, impact: 'R$ 0', avatar: 'JD', isUser: true },
  { id: '4', name: 'Carla Dias', xp: 9800, impact: 'R$ 2.1k', avatar: 'CD' },
];

const triggerVibration = (type: 'light' | 'success' | 'warning') => {
  if (!window.navigator.vibrate) return;
  const patterns = { light: 10, success: [10, 30, 10], warning: 100 };
  window.navigator.vibrate(patterns[type] as any);
};

const playSuccessSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {}
};

// --- Componente Toast ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500 text-slate-950',
    error: 'bg-rose-500 text-white',
    info: 'bg-cyan-500 text-slate-950'
  };

  return (
    <div className={`fixed top-8 left-6 right-6 z-[30000] p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in ${styles[type]}`}>
      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center shrink-0">
        <i className={`fa-solid ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-info-circle'} text-sm`}></i>
      </div>
      <p className="text-[11px] font-black uppercase tracking-wider leading-tight">{message}</p>
      <button onClick={onClose} className="ml-auto opacity-50"><i className="fa-solid fa-xmark"></i></button>
    </div>
  );
};

const StatusSistema = memo(({ isOnline, streetMode, syncing }: { isOnline: boolean, streetMode: boolean, syncing: boolean }) => (
  <div className={`px-4 py-2 flex justify-between items-center text-[9px] font-black tracking-widest uppercase border-b transition-all ${streetMode ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-black border-white/5 text-cyan-500/50'}`}>
    <div className="flex gap-4">
      <span className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-cyan-500 shadow-[0_0_8px_#22d3ee]' : 'bg-orange-500 animate-pulse'}`}></div> 
        {isOnline ? (syncing ? 'SINCRONIZANDO...' : 'SISTEMA ONLINE') : 'MODO OFFLINE'}
      </span>
    </div>
    <div className="flex gap-4">
      <span className="text-cyan-600">S.O. GUIA V11.7</span>
    </div>
  </div>
));

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'jobs' | 'ranking' | 'profile'>('learn');
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [streetMode, setStreetMode] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  const [totalXP, setTotalXP] = useState(0);
  const [socialImpact, setSocialImpact] = useState({ digitized: 0, communityRevenue: 0 });
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    const isFirst = !localStorage.getItem('guia_visited_v11_6');
    if (isFirst) {
      setFirstVisit(true);
      localStorage.setItem('guia_visited_v11_6', 'true');
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });
    
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const saved = localStorage.getItem('guia_digital_v11_6_state');
    if (saved) { 
      const d = JSON.parse(saved); 
      setTotalXP(d.totalXP || 0); 
      setSocialImpact(d.socialImpact || { digitized: 0, communityRevenue: 0 }); 
      setLessonProgress(d.lessonProgress || {}); 
    }
    setLoading(false);
  }, []);

  useEffect(() => { 
    if (!loading) localStorage.setItem('guia_digital_v11_6_state', JSON.stringify({ totalXP, socialImpact, lessonProgress })); 
  }, [totalXP, socialImpact, lessonProgress, loading]);

  const handleProofVerification = async (base64: string, coords: {lat: number, lng: number}) => {
    setShowCamera(false);
    if (!isOnline) {
      await addToSyncQueue({ image: base64, coords, timestamp: Date.now() });
      showToast("Salvo Offline. Sincronização pendente.", "info");
      return;
    }
    setLoading(true);
    try {
      const ai = getAI();
      if (!ai) throw new Error("API Key ausente");
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: [
          { text: "Responda VALIDADO se for fachada comercial real ou NEGADO caso contrário." }, 
          { inlineData: { mimeType: 'image/jpeg', data: base64 } }
        ] 
      });
      if (response.text?.includes('VALIDADO')) { 
        setTotalXP(p => p + 500); 
        setSocialImpact(p => ({ ...p, digitized: p.digitized + 1, communityRevenue: p.communityRevenue + 250 })); 
        playSuccessSound(); triggerVibration('success');
        showToast("Impacto Validado! +500 XP", "success");
      } else {
        showToast("Não validado. Foque na fachada comercial.", "error");
      }
    } catch (e: any) {
      await addToSyncQueue({ image: base64, coords, timestamp: Date.now() });
      showToast("Erro na IA. Dados salvos para re-análise.", "error");
    } finally { setLoading(false); }
  };

  if (firstVisit) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-8 z-[20000]">
        <div className="w-24 h-24 bg-cyan-600 rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.3)]">
          <i className="fa-solid fa-bolt-lightning text-4xl text-slate-950"></i>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Bem-vindo ao <br/><span className="text-cyan-600">Guia Digital</span></h2>
          <p className="text-slate-400 font-semibold text-sm leading-relaxed">S.O. de Mobilidade Social do Instituto Guia.</p>
        </div>
        <button onClick={() => setFirstVisit(false)} className="w-full py-5 bg-cyan-600 text-slate-950 font-black uppercase tracking-widest rounded-2xl shadow-xl">Acessar Painel</button>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto min-h-screen relative pb-28 transition-all duration-700 ${streetMode ? 'bg-white text-black' : 'bg-slate-950 text-slate-100'}`}>
      <StatusSistema isOnline={isOnline} streetMode={streetMode} syncing={syncing} />
      
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {showInstallPrompt && (
        <div className="px-6 py-4 bg-cyan-600 text-slate-950 flex justify-between items-center animate-in sticky top-[41px] z-[200] shadow-xl">
           <p className="text-[10px] font-black uppercase tracking-widest">Instalar no Celular</p>
           <button onClick={handleInstallClick} className="px-4 py-1.5 bg-slate-950 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Baixar</button>
        </div>
      )}

      <header className={`px-6 pt-8 pb-6 sticky top-0 z-[100] backdrop-blur-2xl border-b transition-all ${streetMode ? 'bg-white/95 border-slate-300' : 'bg-slate-950/95 border-white/5'}`}>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Guia <span className="text-cyan-600">Digital</span></h1>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">INSTITUTO GUIA SOCIAL</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setStreetMode(!streetMode)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${streetMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'}`}><i className={`fa-solid ${streetMode ? 'fa-sun' : 'fa-moon'}`}></i></button>
            <div className="text-right">
              <span className={`text-2xl font-black block leading-none ${streetMode ? 'text-black' : 'text-white'}`}>{totalXP}</span>
              <p className="text-[8px] font-black uppercase text-cyan-600 tracking-widest">XP</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 mt-6 space-y-10 pb-16">
        {activeTab === 'learn' && (
          <div className="space-y-10 animate-in">
            {!selectedModule ? (
              <>
                <div className="p-8 bg-gradient-to-br from-cyan-600 to-black rounded-[32px] shadow-xl relative overflow-hidden active:scale-95 transition-all cursor-pointer" onClick={() => setShowCamera(true)}>
                   <h3 className="text-white font-black italic uppercase text-xl mb-3 tracking-tighter leading-none">Mapear <br/>O Bairro</h3>
                   <div className="flex items-center gap-4 text-white font-black uppercase text-[10px] tracking-[0.3em] opacity-80">
                      <span className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><i className="fa-solid fa-camera"></i></span>
                      Scanner de Impacto
                   </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xl font-black italic uppercase tracking-tighter">Minhas <span className="text-cyan-600">Trilhas</span></h2>
                  {modules.map(mod => (
                    <div key={mod.id} onClick={() => mod.status !== 'locked' && setSelectedModule(mod)} className={`p-6 rounded-[24px] border transition-all active:scale-95 ${mod.status === 'locked' ? 'opacity-30 grayscale' : (streetMode ? 'bg-slate-100 border-slate-300' : 'bg-white/5 border-white/10')}`}>
                      <div className="flex justify-between items-center mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${streetMode ? 'bg-slate-200 text-black' : 'bg-cyan-600/10 text-cyan-600'}`}><i className={`fa-solid ${mod.icon}`}></i></div>
                        <span className="text-[8px] font-black uppercase text-cyan-600 tracking-widest">{mod.xpValue} XP</span>
                      </div>
                      <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none">{mod.title}</h3>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-8 animate-in pb-16">
                 <button onClick={() => setSelectedModule(null)} className="text-[10px] font-black uppercase flex items-center gap-3 text-slate-500"><i className="fa-solid fa-arrow-left"></i> Voltar</button>
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">{selectedModule.title}</h2>
                 {selectedModule.lessons.map((lesson, idx) => (
                   <div key={lesson.id} className="p-6 rounded-3xl border border-white/5 bg-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-cyan-600">Lição {idx+1}</h4>
                        {lessonProgress[lesson.id] && <i className="fa-solid fa-circle-check text-green-500"></i>}
                      </div>
                      <p className="text-[13px] font-bold mb-4">{lesson.title}</p>
                      <button onClick={() => { 
                        if (lessonProgress[lesson.id]) return;
                        setLessonProgress(p => ({ ...p, [lesson.id]: true })); 
                        setTotalXP(prev => prev + lesson.xpValue); 
                        triggerVibration('light');
                        showToast(`+${lesson.xpValue} XP Conquistado!`, "success");
                      }} className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${lessonProgress[lesson.id] ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/10'}`}>
                        {lessonProgress[lesson.id] ? 'Concluída' : 'Marcar Concluída'}
                      </button>
                   </div>
                 ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-10 animate-in">
             <h2 className="text-2xl font-black italic uppercase tracking-tighter">Oportunidades</h2>
             {OPPORTUNITIES.map(opp => (
               <div key={opp.id} className="p-8 rounded-[32px] border bg-white/5 border-white/10">
                  <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">{opp.businessName}</p>
                  <h4 className="text-xl font-black italic uppercase tracking-tighter leading-tight mt-2">{opp.title}</h4>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-green-500 font-black text-lg">{opp.reward}</span>
                    <button onClick={() => showToast("Candidatura Enviada!", "success")} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">Candidatar</button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'ranking' && (
           <div className="space-y-10 animate-in">
             <h2 className="text-2xl font-black italic uppercase tracking-tighter">Ranking</h2>
             <div className="space-y-3">
                {LEADERBOARD.map((entry, idx) => (
                  <div key={entry.id} className={`p-5 rounded-3xl flex items-center justify-between border ${entry.isUser ? 'bg-cyan-600/10 border-cyan-600' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-slate-500 italic">#{idx+1}</span>
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white">{entry.avatar}</div>
                      <div>
                        <p className="text-[12px] font-black uppercase">{entry.isUser ? 'Você' : entry.name}</p>
                        <p className="text-[9px] font-bold text-cyan-600">{entry.isUser ? totalXP : entry.xp} XP</p>
                      </div>
                    </div>
                    <p className="text-green-500 font-black text-sm">{entry.isUser ? `R$ ${socialImpact.communityRevenue}` : entry.impact}</p>
                  </div>
                ))}
             </div>
           </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-10 animate-in">
             <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-slate-900 rounded-[32px] mx-auto flex items-center justify-center border-4 border-cyan-600 shadow-2xl relative">
                   <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-slate-950 font-black text-[10px]">JD</div>
                   <i className="fa-solid fa-user text-4xl text-white opacity-20"></i>
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">João Digital</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                   <p className="text-2xl font-black text-white">{socialImpact.digitized}</p>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Digitalizações</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                   <p className="text-2xl font-black text-green-500">R$ {socialImpact.communityRevenue}</p>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Renda Gerada</p>
                </div>
             </div>
             <button onClick={() => setShowCertificate(true)} className="w-full py-5 bg-white text-slate-950 font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl">Meu Impacto</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 p-6 z-[500]">
        <div className={`max-w-md mx-auto h-20 rounded-[32px] flex justify-around items-center px-4 glass-panel ${streetMode ? 'bg-white shadow-xl' : ''}`}>
          {[
            { id: 'learn', icon: 'fa-book-sparkles', label: 'Trilhas' },
            { id: 'jobs', icon: 'fa-wallet', label: 'Jobs' },
            { id: 'ranking', icon: 'fa-ranking-star', label: 'Social' },
            { id: 'profile', icon: 'fa-user-ninja', label: 'Perfil' }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1.5 ${activeTab === item.id ? 'text-cyan-600' : 'text-slate-500'}`}>
              <i className={`fa-solid ${item.icon} text-lg`}></i>
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {showCamera && <div className="fixed inset-0 z-[12000] bg-black"><CameraVerification onVerify={handleProofVerification} onCancel={() => setShowCamera(false)} streetMode={streetMode} showToast={showToast} /></div>}
      {showCertificate && <ImpactResume socialImpact={socialImpact} totalXP={totalXP} onClose={() => setShowCertificate(false)} />}
      
      {loading && !showCamera && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[10000] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-600">Sincronizando Impacto</p>
          </div>
        </div>
      )}
    </div>
  );
};

const CameraVerification = ({ onVerify, onCancel, streetMode, showToast }: { onVerify: (base64: string, coords: {lat: number, lng: number}) => void, onCancel: () => void, streetMode: boolean, showToast: (m: string, t: any) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
        navigator.geolocation.getCurrentPosition(
          (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => showToast("Sinal GPS Requerido.", "error"), { enableHighAccuracy: true }
        );
      } catch (err) { onCancel(); }
    }
    setup();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const capture = useCallback(() => {
    if (!coords || isProcessing) return;
    setIsProcessing(true);
    triggerVibration('light');

    const canvas = document.createElement('canvas');
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
      onVerify(base64, coords);
    }
  }, [coords, isProcessing, onVerify]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-10">
        <h3 className="text-cyan-500 font-black italic uppercase text-base tracking-tighter">Auditoria Ativa</h3>
        <button onClick={onCancel} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"><i className="fa-solid fa-xmark"></i></button>
      </div>
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      
      {/* Moldura de Foco */}
      <div className="absolute inset-0 border-[2px] border-cyan-500/20 m-12 rounded-3xl pointer-events-none">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-500 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-500 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-500 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-500 rounded-br-lg"></div>
      </div>

      <button 
        onClick={capture} 
        disabled={isProcessing || !coords}
        className={`absolute bottom-16 w-20 h-20 rounded-full border-4 border-cyan-600 p-1 flex items-center justify-center active:scale-90 transition-all ${isProcessing ? 'opacity-50 animate-pulse' : ''}`}
      >
        <div className="w-full h-full bg-cyan-600 rounded-full flex items-center justify-center">
          {isProcessing ? (
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <i className="fa-solid fa-expand text-2xl text-slate-950"></i>
          )}
        </div>
      </button>

      {!coords && !isProcessing && (
        <div className="absolute bottom-40 bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
          Aguardando GPS...
        </div>
      )}
    </div>
  );
};

const ImpactResume = ({ socialImpact, totalXP, onClose }: { socialImpact: any, totalXP: number, onClose: () => void }) => (
  <div className="fixed inset-0 z-[11000] bg-black/98 flex items-center justify-center p-6 animate-in">
    <div className="w-full max-w-xs bg-white text-slate-950 p-8 rounded-sm border-[12px] border-slate-900">
      <div className="space-y-8 text-center">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter border-b-4 border-slate-900 pb-4">Impacto Social</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-left">
            <span className="text-[8px] font-black uppercase text-slate-400">Total XP</span>
            <p className="text-xl font-black">{totalXP}</p>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-black uppercase text-slate-400">R$ Gerado</span>
            <p className="text-xl font-black text-green-600">R$ {socialImpact.communityRevenue}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">Fechar</button>
      </div>
    </div>
  </div>
);

export default App;
