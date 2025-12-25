
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { UserProfile, Lesson, LessonState, PortfolioItem, AuditResult, Track } from './types';
import { TRACKS, MURAL_ITEMS } from './constants';

// Auxiliares Áudio
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudio(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'trilhas' | 'dossie' | 'mural' | 'manifesto'>('trilhas');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonState, setLessonState] = useState<LessonState>('THEORY');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    const saved = localStorage.getItem('guia_digital_v4');
    if (saved) setUser(JSON.parse(saved));
    
    // Tema inicial baseado no sistema
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setIsDarkMode(false);
    }

    return () => { 
      window.removeEventListener('online', updateStatus); 
      window.removeEventListener('offline', updateStatus); 
    };
  }, []);

  useEffect(() => { 
    if (user) localStorage.setItem('guia_digital_v4', JSON.stringify(user)); 
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user, isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const speak = async (text: string) => {
    if (isOffline) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Diga de forma clara e pausada: ${text}` }] }],
        config: { 
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
        }
      });
      const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await decodeAudio(decodeBase64(base64), ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) { console.error(e); }
  };

  const handleAudit = async (lesson: Lesson, type: 'SUBMISSION', content: any) => {
    if (isOffline) return { score: 0, feedback: "Offline. Reconecte-se para validar seu dossiê.", aprovado: false };
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `[GUI.A_AUDIT_CORE] Audite entrega de ${lesson.category}. 
    PERSONA: Mentor GUI.A do Porto Digital. Foco em mercado real e esforço técnico.
    CONTEÚDO: ${JSON.stringify(content)}.`;
    
    try {
      const res = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: prompt, 
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
              aprovado: { type: Type.BOOLEAN },
              rubrica: {
                type: Type.OBJECT,
                properties: {
                  execucao_pratica: { type: Type.NUMBER },
                  qualidade_tecnica: { type: Type.NUMBER },
                  estrategia_clareza: { type: Type.NUMBER },
                  profissionalismo: { type: Type.NUMBER }
                },
                required: ['execucao_pratica', 'qualidade_tecnica', 'estrategia_clareza', 'profissionalismo']
              },
              mentor: { type: Type.STRING }
            },
            required: ['score', 'feedback', 'aprovado', 'rubrica', 'mentor']
          }
        } 
      });
      return JSON.parse(res.text || '{}');
    } catch (error) { 
      return { score: 0, feedback: "Instabilidade na rede de mentores.", aprovado: false }; 
    }
  };

  if (!user) return <Onboarding onComplete={setUser} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans selection:bg-indigo-500 selection:text-white`}>
      
      {/* Header Adaptativo - Acessibilidade: Touch Target 48px+ */}
      <nav className={`h-24 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-white/90'} backdrop-blur-md sticky top-0 z-50 px-4 flex items-center justify-between`} role="navigation" aria-label="Navegação Principal">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 flex items-center justify-center font-black rounded-xl shadow-lg text-white text-xl">G</div>
          <span className="font-black tracking-tighter text-xl hidden sm:block uppercase">GUI.A <span className="text-indigo-500 italic">DIGITAL</span></span>
        </div>
        
        <div className="flex gap-2 items-center h-full">
          <NavBtn active={activeTab === 'trilhas'} onClick={() => setActiveTab('trilhas')} icon="fa-bolt" label="Trilhas" isDarkMode={isDarkMode} />
          <NavBtn active={activeTab === 'dossie'} onClick={() => setActiveTab('dossie')} icon="fa-briefcase" label="Dossiê" isDarkMode={isDarkMode} />
          <NavBtn active={activeTab === 'mural'} onClick={() => setActiveTab('mural')} icon="fa-bullhorn" label="Mural" isDarkMode={isDarkMode} />
          <NavBtn active={activeTab === 'manifesto'} onClick={() => setActiveTab('manifesto')} icon="fa-fingerprint" label="Manifesto" isDarkMode={isDarkMode} />
        </div>

        <button 
          onClick={toggleTheme}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all focus:ring-4 focus:ring-indigo-500 outline-none ${isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-indigo-600 shadow-sm'}`}
          aria-label={isDarkMode ? "Ativar Modo Dia" : "Ativar Modo Noite"}
        >
          <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
        </button>
      </nav>

      {/* Alerta Offline Resiliente */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-[11px] font-black uppercase tracking-[0.3em] py-3 text-center animate-pulse" role="alert">
          <i className="fa-solid fa-wifi-slash mr-2"></i> Modo Offline Ativado • O corre não para, mas a validação de IA aguarda rede
        </div>
      )}

      <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-12" role="main">
        {activeLesson ? (
          <LessonEngine 
            lesson={activeLesson} 
            state={lessonState} 
            setState={setLessonState} 
            onAudit={handleAudit}
            onSpeak={speak}
            onExit={() => setActiveLesson(null)}
            user={user}
            setUser={setUser}
            isDarkMode={isDarkMode}
            isOffline={isOffline}
          />
        ) : (
          <div className="max-w-6xl mx-auto pb-12">
            {activeTab === 'trilhas' && <TrilhasView user={user} onSelect={(l: Lesson) => { setActiveLesson(l); setLessonState('THEORY'); }} isDarkMode={isDarkMode} />}
            {activeTab === 'dossie' && <DossieView dossier={user.dossier} matrix={user.matrix} isDarkMode={isDarkMode} />}
            {activeTab === 'mural' && <MuralView isDarkMode={isDarkMode} />}
            {activeTab === 'manifesto' && <ManifestoView isDarkMode={isDarkMode} />}
          </div>
        )}
      </main>

      <footer className={`p-6 border-t ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'} text-center text-[10px] font-black tracking-[0.4em] uppercase`}>
        GUI.A DIGITAL v4.1 | Tecnologia Social Porto Digital
      </footer>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label, isDarkMode }: any) => (
  <button 
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`flex flex-col items-center justify-center gap-1 min-w-[54px] min-h-[54px] md:min-w-[80px] rounded-xl transition-all font-black text-[9px] md:text-[10px] uppercase tracking-widest focus:ring-4 focus:ring-indigo-500 outline-none ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg' 
        : (isDarkMode ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-900' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100')
    }`}
  >
    <i className={`fa-solid ${icon} text-lg md:text-xl`} aria-hidden="true"></i>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const MuralView = ({ isDarkMode }: any) => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="space-y-2">
      <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Mural do<br/><span className="text-indigo-500">Corre.</span></h1>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MURAL_ITEMS.map(item => (
        <div key={item.id} className={`p-8 border-2 rounded-3xl transition-all ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-xl ${item.type === 'AVISO' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'}`} aria-hidden="true">
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.date}</span>
          </div>
          <h3 className="text-xl font-black uppercase mb-2 leading-tight">{item.title}</h3>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.content}</p>
        </div>
      ))}
    </div>
  </div>
);

const LessonEngine = ({ lesson, state, setState, onAudit, onSpeak, onExit, user, setUser, isDarkMode, isOffline }: any) => {
  const [loading, setLoading] = useState(false);
  const [written, setWritten] = useState('');
  const [audit, setAudit] = useState<AuditResult | null>(null);

  const finish = async () => {
    if (written.length < 50 || isOffline) return;
    setLoading(true);
    const result = await onAudit(lesson, 'SUBMISSION', { written });
    setAudit(result);
    setLoading(false);
    
    if (result.aprovado) {
      const newItem: PortfolioItem = {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        trackId: lesson.category,
        writtenResponse: written,
        deliveryEvidence: { objetivo: '', metodo: '', entregavel: '', resultado: '', autoavaliacao: '' },
        audit: result,
        date: new Date().toLocaleDateString(),
        versao: 1
      };
      const comp = lesson.competency as keyof typeof user.matrix;
      const newMatrix = { ...user.matrix };
      newMatrix[comp] = Math.min(newMatrix[comp] + 15, 100);
      setUser({ ...user, level: user.level + (result.score > 8 ? 1 : 0), exp: user.exp + (result.score * 100), matrix: newMatrix, dossier: [newItem, ...user.dossier] });
      setState('REVIEW');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <button onClick={onExit} className="flex items-center gap-3 min-h-[48px] px-4 rounded-xl text-slate-500 hover:text-indigo-500 font-black uppercase text-xs tracking-widest transition-all outline-none focus:ring-4 focus:ring-indigo-500/50">
        <i className="fa-solid fa-arrow-left"></i> Sair da Lição
      </button>

      {state === 'THEORY' && (
        <section className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none tracking-tighter">{lesson.title}</h1>
            <button 
              onClick={() => onSpeak(lesson.theoryContent)} 
              className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex-shrink-0 shadow-lg active:scale-90 transition-transform focus:ring-4 focus:ring-indigo-300 outline-none" 
              aria-label="Ouvir conteúdo da lição"
            >
              <i className="fa-solid fa-volume-high text-xl"></i>
            </button>
          </div>
          <div className={`p-8 md:p-12 border-l-[10px] border-indigo-600 rounded-r-3xl text-xl leading-relaxed font-medium shadow-sm ${isDarkMode ? 'bg-slate-900/50 text-slate-300' : 'bg-white text-slate-700 border-slate-100'}`}>
            {lesson.theoryContent}
          </div>
          <button onClick={() => setState('PRACTICE')} className="w-full min-h-[80px] bg-indigo-600 text-white rounded-2xl text-xl font-black uppercase shadow-xl hover:bg-indigo-500 transition-all active:scale-95 focus:ring-4 focus:ring-indigo-400 outline-none">Ir para Prática Técnica</button>
        </section>
      )}

      {state === 'PRACTICE' && (
        <section className="space-y-6">
          <div className={`p-8 border-2 rounded-3xl italic text-xl shadow-inner ${isDarkMode ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900'}`}>
            <p className="leading-relaxed">{lesson.practicePrompt}</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="submission-area" className={`block text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Sua Resolução Técnica</label>
            <textarea 
              id="submission-area"
              value={written}
              onChange={e => setWritten(e.target.value)}
              disabled={isOffline}
              className={`w-full h-80 border-4 rounded-[32px] p-8 text-xl font-mono outline-none transition-all resize-none shadow-inner focus:ring-8 focus:ring-indigo-500/10 ${isDarkMode ? 'bg-slate-950 border-slate-900 text-emerald-400 focus:border-indigo-600' : 'bg-white border-slate-100 text-slate-900 focus:border-indigo-500'}`}
              placeholder={isOffline ? "Aguardando conexão para habilitar escrita..." : "// Escreva aqui seu planejamento..."}
            />
          </div>
          <button 
            disabled={loading || written.length < 50 || isOffline}
            onClick={finish}
            className="w-full min-h-[80px] bg-emerald-600 text-white rounded-2xl text-xl font-black uppercase flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl transition-all active:scale-95 focus:ring-4 focus:ring-emerald-400 outline-none"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
            {loading ? 'Validando...' : 'Enviar para Dossiê'}
          </button>
        </section>
      )}

      {state === 'REVIEW' && (
        <section className="text-center space-y-12 py-10 animate-in zoom-in-95">
          <div className="w-32 h-32 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center text-5xl text-white shadow-2xl animate-bounce" aria-hidden="true">
            <i className="fa-solid fa-stamp"></i>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black uppercase italic leading-none">Vero! Validado.</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">O ativo foi incorporado ao seu dossiê permanente.</p>
          </div>
          <div className={`p-10 border-l-[12px] border-emerald-500 rounded-r-3xl text-left max-w-2xl mx-auto shadow-xl ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800 border border-slate-100'}`}>
            <p className="text-xl font-bold font-mono italic leading-relaxed">"{audit?.feedback}"</p>
          </div>
          <button onClick={onExit} className="w-full max-w-md min-h-[70px] bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase text-xl shadow-xl hover:bg-indigo-500 outline-none focus:ring-4 focus:ring-indigo-400 transition-all">Retornar ao Hub</button>
        </section>
      )}
    </div>
  );
};

const DossieView = ({ dossier, matrix, isDarkMode }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700 pb-20">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-12">
        <header className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Dossiê<br/><span className="text-indigo-500">Técnico.</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Histórico de competências verificadas.</p>
        </header>
        <div className="grid gap-6">
          {dossier.map((item: any, i: number) => (
            <article key={i} className={`p-8 border-2 rounded-[32px] flex flex-col md:flex-row justify-between gap-6 transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/30' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black bg-indigo-600 text-white px-4 py-1.5 rounded-full uppercase tracking-widest">{item.trackId}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.date}</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{item.lessonTitle}</h3>
                <p className={`text-base italic leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-500 font-medium'}`}>"{item.writtenResponse.substring(0, 120)}..."</p>
              </div>
              <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-slate-200 md:pl-10 flex flex-col justify-center pt-6 md:pt-0">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Impact Score</span>
                <span className={`text-5xl font-black tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.audit.score}</span>
              </div>
            </article>
          ))}
          {dossier.length === 0 && (
            <div className="p-24 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[48px] text-center opacity-30 flex flex-col items-center">
              <i className="fa-solid fa-folder-open text-6xl mb-6"></i>
              <p className="font-black uppercase tracking-widest text-xs">Vazio. Inicie o corre técnico.</p>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-8">
        <div className={`p-10 border-2 rounded-[40px] space-y-8 sticky top-28 ${isDarkMode ? 'bg-indigo-600/5 border-indigo-500/20' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Maestria Técnica</h3>
          <div className="space-y-6">
            {Object.entries(matrix).map(([skill, value]: any) => (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-black uppercase text-slate-500">{skill}</span>
                  <span className="text-xs font-black text-indigo-500">{value}%</span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden p-[2px] ${isDarkMode ? 'bg-slate-950' : 'bg-slate-200'}`}>
                  <div style={{ width: `${value}%` }} className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ManifestoView = ({ isDarkMode }: any) => (
  <article className="max-w-4xl mx-auto space-y-16 py-12 animate-in fade-in duration-1000">
    <header className="text-center space-y-4">
      <h1 className={`text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
        MANIFESTO<br/><span className="text-indigo-600 tracking-widest">GUI.A DIGITAL _</span>
      </h1>
    </header>
    
    <div className={`space-y-12 text-2xl md:text-4xl font-black italic leading-[1.3] border-l-[10px] border-indigo-600 pl-8 md:pl-16 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
      <p className="readable-text">Aqui não apenas um site/APP de cursos; é um sistema operacional de mobilidade social.</p>
      
      <p className="text-indigo-500 readable-text">"O Marketing Digital profissional não é sobre posts bonitos. É sobre construir ativos reais, dominar dados e entender a psicologia da conversão."</p>
      
      <p className="readable-text">"Aqui não existe atalho. O progresso é fruto de esforço cognitivo, escrita técnica e entrega prática. Se você não está disposto a pensar, não está pronto para o mercado de trabalho."</p>
      
      <p className="text-indigo-500 readable-text">"Nós somos o código-fonte da nova economia. Do Recife para o mundo, visse?"</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
      <div className={`p-10 border-2 rounded-[40px] text-center space-y-4 shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-black uppercase tracking-[0.4em] text-2xl text-indigo-500">ESFORÇO</h3>
        <p className={`font-bold uppercase text-xs italic ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Sem atalhos cognitivos. Pensar dói, mas constrói.</p>
      </div>
      <div className={`p-10 border-2 rounded-[40px] text-center space-y-4 shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-black uppercase tracking-[0.4em] text-2xl text-indigo-500">DOMÍNIO</h3>
        <p className={`font-bold uppercase text-xs italic ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>A técnica é o seu escudo na economia digital.</p>
      </div>
    </div>
  </article>
);

const TrilhasView = ({ user, onSelect, isDarkMode }: any) => (
  <div className="space-y-16 animate-in fade-in duration-1000">
    <header className="space-y-2">
      <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none">ROTAS DE<br/><span className="text-indigo-500">ALTO IMPACTO.</span></h1>
      <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">Especialize-se para dominar o mercado.</p>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {TRACKS.map(track => (
        <article key={track.id} className={`group p-10 border-2 rounded-[48px] transition-all flex flex-col justify-between min-h-[380px] relative overflow-hidden ${isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 shadow-md hover:border-indigo-400'}`}>
          <div className="absolute top-0 right-0 p-12 text-[140px] opacity-[0.03] font-black italic -z-10 group-hover:scale-110 transition-transform duration-1000" aria-hidden="true">{track.icon}</div>
          <div className="relative z-10">
            <span className="text-7xl block mb-6" role="img" aria-label={track.title}>{track.icon}</span>
            <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter leading-none">{track.title}</h2>
            <p className={`font-medium leading-relaxed max-w-sm text-lg ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>{track.description}</p>
          </div>
          <button 
            onClick={() => onSelect(track.lessons[0])} 
            className="mt-10 w-full min-h-[60px] bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-indigo-500 transition-all active:scale-95 outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Acessar Protocolo
          </button>
        </article>
      ))}
    </div>
  </div>
);

const Onboarding = ({ onComplete, isDarkMode, toggleTheme }: any) => {
  const [nome, setNome] = useState('');
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
      <div className="scanline opacity-10" aria-hidden="true"></div>
      <div className="w-24 h-24 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center text-5xl font-black rotate-6 mb-12 shadow-2xl animate-bounce" aria-hidden="true">G</div>
      <div className="space-y-4 mb-20">
        <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter mb-4 leading-none">GUI.A<br/><span className="text-indigo-600">DIGITAL</span></h1>
        <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[11px]">Social Career Operating System v4.1</p>
      </div>
      <div className="w-full max-w-md space-y-12">
        <div className="space-y-4">
          <label htmlFor="user-name-input" className="block text-[11px] font-black uppercase tracking-[0.4em] text-indigo-500">Identificação de Usuário</label>
          <input 
            id="user-name-input"
            autoFocus
            value={nome}
            onChange={e => setNome(e.target.value)}
            className={`w-full bg-transparent border-b-4 py-4 text-center text-4xl font-black uppercase outline-none transition-all placeholder:opacity-10 ${isDarkMode ? 'border-slate-800 focus:border-indigo-600' : 'border-slate-300 focus:border-indigo-500'}`}
            placeholder="NOME OU VULGO"
            aria-required="true"
          />
        </div>
        <button 
          disabled={!nome}
          onClick={() => onComplete({ name: nome, level: 1, exp: 0, matrix: { Estrategia: 10, Escrita: 10, Analise: 10, Tecnica: 10, Design: 10, Audiovisual: 10 }, dossier: [] })}
          className="w-full min-h-[80px] bg-indigo-600 text-white rounded-[32px] font-black uppercase text-2xl shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-5 tracking-widest outline-none focus:ring-4 focus:ring-indigo-400"
        >
          Iniciar Protocolo
        </button>
      </div>
    </div>
  );
};

export default App;
