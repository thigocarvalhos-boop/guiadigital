
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { UserProfile, Lesson, LessonState, PortfolioItem, AuditResult, Track } from './types';
import { TRACKS, MURAL_ITEMS } from './constants';

// Auxiliares Áudio e Reconhecimento
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
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    const saved = localStorage.getItem('guia_digital_v4');
    if (saved) setUser(JSON.parse(saved));
    
    if (!localStorage.getItem('theme')) {
      setIsDarkMode(!window.matchMedia('(prefers-color-scheme: light)').matches);
    } else {
      setIsDarkMode(localStorage.getItem('theme') === 'dark');
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('guia_digital_v4', JSON.stringify(user));
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [user, isDarkMode]);

  // Fix: Added missing toggleTheme function to handle theme switching
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Reconhecimento de Voz Básico (LBI: Autonomia)
  const toggleVoiceCommands = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Seu navegador não suporta comandos de voz.");
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      if (command.includes('trilhas')) setActiveTab('trilhas');
      if (command.includes('dossiê')) setActiveTab('dossie');
      if (command.includes('mural')) setActiveTab('mural');
      if (command.includes('manifesto')) setActiveTab('manifesto');
      if (command.includes('sair')) setActiveLesson(null);
      setIsVoiceActive(false);
    };
    recognition.onstart = () => setIsVoiceActive(true);
    recognition.onend = () => setIsVoiceActive(false);
    recognition.start();
  };

  const simplifyLanguage = async (text: string) => {
    if (isOffline) return;
    setSimplifiedText("Simplificando conteúdo para melhor compreensão...");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Reescreva o seguinte conteúdo usando a técnica de 'Linguagem Simples' para acessibilidade cognitiva. Use frases curtas, voz ativa e evite jargões complexos: "${text}"`,
      });
      setSimplifiedText(res.text || text);
    } catch (e) {
      setSimplifiedText("Não foi possível simplificar no momento.");
    }
  };

  const speak = async (text: string) => {
    if (isOffline) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Diga de forma pausada, clara e acessível: ${text}` }] }],
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
    } catch (e) { console.error("TTS_ERROR:", e); }
  };

  const handleAudit = async (lesson: Lesson, content: string) => {
    if (isOffline) return { score: 0, feedback: "Offline. Seu progresso foi salvo localmente.", aprovado: false };
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `[GUI.A_AUDIT] Audite entrega técnica: ${lesson.title}. 
    CONTEÚDO DO ALUNO: ${content}.
    REGRAS: Mentor exigente. Foco em inclusão e clareza. Responda em JSON.`;
    
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
              mentor: { type: Type.STRING }
            },
            required: ['score', 'feedback', 'aprovado', 'mentor']
          }
        } 
      });
      return JSON.parse(res.text || '{}');
    } catch (error) { 
      return { score: 0, feedback: "Instabilidade na mentoria IA.", aprovado: false }; 
    }
  };

  if (!user) return <Onboarding onComplete={setUser} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Botão de Atalho de Acessibilidade (Pula para o conteúdo) */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-indigo-600 focus:text-white focus:p-4 focus:rounded-b-xl focus:shadow-2xl">
        Pular para o conteúdo principal
      </a>

      {/* Header Acessível */}
      <nav className={`h-24 border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 backdrop-blur-lg ${isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-white/95'}`} role="navigation" aria-label="Menu Principal">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/20">G</div>
          <span className="font-black text-lg uppercase hidden sm:block">GUI.A <span className="text-indigo-500 italic">DIGITAL</span></span>
        </div>

        <div className="flex gap-1 md:gap-2 h-full items-center">
          <NavBtn active={activeTab === 'trilhas'} onClick={() => setActiveTab('trilhas')} icon="fa-bolt" label="Trilhas" />
          <NavBtn active={activeTab === 'dossie'} onClick={() => setActiveTab('dossie')} icon="fa-briefcase" label="Dossiê" />
          <NavBtn active={activeTab === 'mural'} onClick={() => setActiveTab('mural')} icon="fa-bullhorn" label="Mural" />
          <NavBtn active={activeTab === 'manifesto'} onClick={() => setActiveTab('manifesto')} icon="fa-fingerprint" label="Ética" />
        </div>

        <div className="flex items-center gap-2">
          {/* Controle de Voz */}
          <button 
            onClick={toggleVoiceCommands}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVoiceActive ? 'bg-red-500 text-white animate-pulse' : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')}`}
            aria-label="Ativar Comandos de Voz"
            title="Comandos: Trilhas, Dossiê, Mural, Manifesto"
          >
            <i className={`fa-solid ${isVoiceActive ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
          </button>
          
          <button 
            onClick={toggleTheme}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all focus:ring-4 focus:ring-indigo-500 outline-none ${isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-white text-indigo-600 shadow-md border border-slate-100'}`}
            aria-label={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
          </button>
        </div>
      </nav>

      <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-12 outline-none" role="main" tabIndex={-1}>
        {activeLesson ? (
          // Fix: Passed setSimplifiedText to LessonEngine to allow resetting simplified view
          <LessonEngine 
            lesson={activeLesson} 
            state={lessonState} 
            setState={setLessonState} 
            onAudit={handleAudit}
            onSpeak={speak}
            onSimplify={simplifyLanguage}
            simplifiedText={simplifiedText}
            setSimplifiedText={setSimplifiedText}
            onExit={() => { setActiveLesson(null); setSimplifiedText(null); }}
            user={user}
            setUser={setUser}
            isDarkMode={isDarkMode}
            isOffline={isOffline}
          />
        ) : (
          <div className="max-w-5xl mx-auto pb-16">
            {activeTab === 'trilhas' && <TrilhasView user={user} onSelect={(l: Lesson) => { setActiveLesson(l); setLessonState('THEORY'); }} isDarkMode={isDarkMode} />}
            {activeTab === 'dossie' && <DossieView dossier={user.dossier} matrix={user.matrix} isDarkMode={isDarkMode} />}
            {activeTab === 'mural' && <MuralView isDarkMode={isDarkMode} />}
            {activeTab === 'manifesto' && <ManifestoView isDarkMode={isDarkMode} />}
          </div>
        )}
      </main>

      <footer className={`p-8 border-t text-center text-[10px] font-black tracking-[0.4em] uppercase ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
        GUI.A DIGITAL v4.3 | Acessibilidade Digital LBI & WCAG 2.1
      </footer>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`flex flex-col items-center justify-center min-w-[60px] min-h-[60px] md:min-w-[80px] transition-all rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/50 ${
      active 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
        : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/5'
    }`}
  >
    <i className={`fa-solid ${icon} text-xl md:text-2xl`} aria-hidden="true"></i>
    <span className="text-[9px] font-black uppercase mt-1 hidden sm:block tracking-widest">{label}</span>
  </button>
);

// Fix: Destructured setSimplifiedText prop in LessonEngine
const LessonEngine = ({ lesson, state, setState, onAudit, onSpeak, onSimplify, simplifiedText, setSimplifiedText, onExit, user, setUser, isDarkMode, isOffline }: any) => {
  const [written, setWritten] = useState('');
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<AuditResult | null>(null);

  const finish = async () => {
    if (written.length < 50 || isOffline) return;
    setLoading(true);
    const result = await onAudit(lesson, written);
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
    <article className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-500">
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="min-h-[48px] px-6 rounded-2xl bg-slate-200 dark:bg-slate-800 font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
          <i className="fa-solid fa-arrow-left mr-2"></i> Voltar
        </button>
        <div className="flex gap-2">
          {/* Botões de Acessibilidade Específicos da Lição */}
          <button 
            onClick={() => onSimplify(lesson.theoryContent)}
            className="w-12 h-12 rounded-xl border-2 border-indigo-500/30 text-indigo-500 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all"
            aria-label="Simplificar Linguagem do Texto"
            title="Linguagem Simples"
          >
            <i className="fa-solid fa-brain"></i>
          </button>
          <button 
            onClick={() => onSpeak(simplifiedText || lesson.theoryContent)}
            className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20"
            aria-label="Ouvir conteúdo"
          >
            <i className="fa-solid fa-volume-high"></i>
          </button>
        </div>
      </header>

      {state === 'THEORY' && (
        <section className="space-y-10">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9]">{lesson.title}</h1>
          <div className={`p-8 md:p-12 border-l-[12px] border-indigo-600 rounded-r-[40px] text-xl md:text-3xl leading-relaxed shadow-2xl ${isDarkMode ? 'bg-slate-900/50 text-slate-100' : 'bg-white text-slate-900 shadow-indigo-500/5'}`}>
            <p className="readable-text italic font-medium">
              {simplifiedText || lesson.theoryContent}
            </p>
            {simplifiedText && (
              <button onClick={() => setSimplifiedText(null)} className="mt-8 text-sm font-black uppercase text-indigo-500 border-b-2 border-indigo-500">Ver original</button>
            )}
          </div>
          <button onClick={() => setState('PRACTICE')} className="w-full h-24 bg-indigo-600 text-white rounded-3xl text-2xl font-black uppercase shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all outline-none focus:ring-8 focus:ring-indigo-500/30">Praticar Agora</button>
        </section>
      )}

      {state === 'PRACTICE' && (
        <section className="space-y-8">
          <div className="p-10 border-4 border-dashed border-indigo-500/20 rounded-[48px] bg-indigo-500/5 italic text-2xl">
            "{lesson.practicePrompt}"
          </div>
          <div className="space-y-4">
            <label htmlFor="user-submission" className="block text-xs font-black uppercase tracking-[0.4em] text-slate-500">Sua Resolução Técnica (mín. 50 caracteres)</label>
            <textarea 
              id="user-submission"
              value={written}
              onChange={e => setWritten(e.target.value)}
              className={`w-full h-96 border-4 rounded-[40px] p-10 text-2xl font-mono outline-none transition-all resize-none shadow-inner focus:border-indigo-600 ${isDarkMode ? 'bg-slate-950 border-slate-900 text-emerald-400' : 'bg-white border-slate-200 text-slate-950'}`}
              placeholder="// Descreva seu processo..."
            />
          </div>
          <button 
            disabled={loading || written.length < 50 || isOffline}
            onClick={finish}
            className={`w-full h-24 rounded-3xl text-2xl font-black uppercase flex items-center justify-center gap-4 transition-all shadow-2xl ${written.length >= 50 ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-300 text-slate-500 opacity-50 cursor-not-allowed'}`}
          >
            {loading ? <i className="fa-solid fa-sync animate-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
            {loading ? 'Validando...' : 'Incorporar ao Dossiê'}
          </button>
        </section>
      )}

      {state === 'REVIEW' && (
        <section className="text-center space-y-16 py-12">
          <div className="w-40 h-40 bg-emerald-500 rounded-[50px] mx-auto flex items-center justify-center text-6xl text-white shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)] animate-bounce">
            <i className="fa-solid fa-stamp"></i>
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-black uppercase italic tracking-tighter">PROTOCOLO OK.</h1>
            <div className={`p-12 border-l-[16px] border-emerald-500 rounded-r-[50px] text-left max-w-3xl mx-auto shadow-2xl ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900 border border-slate-100'}`}>
              <p className="text-2xl font-bold font-mono italic leading-relaxed">"{audit?.feedback}"</p>
              <p className="mt-8 text-xs font-black uppercase tracking-widest text-indigo-500">Validador: {audit?.mentor}</p>
            </div>
          </div>
          <button onClick={onExit} className="w-full max-w-md h-20 bg-indigo-600 text-white rounded-[30px] font-black uppercase text-xl shadow-2xl hover:bg-indigo-500 transition-all">Retornar ao Hub</button>
        </section>
      )}
    </article>
  );
};

const ManifestoView = ({ isDarkMode }: any) => (
  <article className="py-12 space-y-24 animate-in fade-in duration-1000">
    <header className="text-center space-y-8">
      <h1 className={`text-6xl md:text-9xl font-black italic uppercase leading-[0.8] tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
        Manifesto<br/><span className="text-indigo-600">GUIA DIGITAL _</span>
      </h1>
      <div className="h-2 w-32 bg-indigo-600 mx-auto rounded-full"></div>
    </header>

    <div className={`space-y-16 text-3xl md:text-5xl font-black italic leading-[1.2] border-l-[16px] border-indigo-600 pl-8 md:pl-20 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      <p className="readable-text">Este não é apenas um app. É uma ponte de <span className="text-indigo-600">acessibilidade econômica</span>.</p>
      
      <p className="text-indigo-600 readable-text">"Dignidade é ter o domínio da técnica. Inclusão é remover a barreira entre o talento e a oportunidade."</p>
      
      <p className="readable-text">"Aqui, o capacitismo morre. Seus ativos técnicos valem mais que sua condição. O mercado precisa de soluções, e nós somos a resposta."</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10">
      <div className={`p-12 border-4 rounded-[60px] space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
        <h3 className="text-indigo-500 font-black uppercase tracking-[0.5em] text-2xl">AUTONOMIA</h3>
        <p className={`font-bold uppercase text-lg italic leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Ferramentas para quem constrói o próprio caminho.</p>
      </div>
      <div className={`p-12 border-4 rounded-[60px] space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
        <h3 className="text-indigo-500 font-black uppercase tracking-[0.5em] text-2xl">EQUIDADE</h3>
        <p className={`font-bold uppercase text-lg italic leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>A tecnologia social como niveladora do jogo.</p>
      </div>
    </div>
  </article>
);

const DossieView = ({ dossier, matrix, isDarkMode }: any) => (
  <div className="space-y-16 animate-in fade-in duration-700">
    <header className="space-y-4">
      <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Dossiê<br/><span className="text-indigo-500">Patrimonial.</span></h1>
      <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-xs">Suas competências como ativos de mercado.</p>
    </header>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        {dossier.map((item: any, i: number) => (
          <article key={i} className={`p-10 border-2 rounded-[50px] flex flex-col md:flex-row justify-between gap-8 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-400 shadow-xl shadow-indigo-500/5'}`}>
            <div className="space-y-6">
              <div className="flex gap-3">
                <span className="text-[10px] font-black bg-indigo-600 text-white px-5 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-500/20">{item.trackId}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest self-center">{item.date}</span>
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight leading-none">{item.lessonTitle}</h3>
              <p className={`text-xl italic leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`}>"{item.writtenResponse.substring(0, 150)}..."</p>
            </div>
            <div className="text-center md:text-right flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-200 md:pl-10 pt-6 md:pt-0">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Impacto</span>
              <span className={`text-7xl font-black tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{item.audit.score}</span>
            </div>
          </article>
        ))}
        {dossier.length === 0 && (
          <div className="p-32 border-8 border-dashed border-slate-200 dark:border-slate-800 rounded-[80px] text-center opacity-30 flex flex-col items-center">
            <i className="fa-solid fa-folder-plus text-8xl mb-8"></i>
            <p className="font-black uppercase tracking-[0.5em] text-sm">Vazio. Inicie o protocolo.</p>
          </div>
        )}
      </div>
      
      <div className={`p-10 border-4 rounded-[60px] space-y-12 sticky top-32 h-fit ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-slate-50 border-slate-200 shadow-xl shadow-indigo-500/5'}`}>
        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-indigo-500">Maestria</h3>
        <div className="space-y-10">
          {Object.entries(matrix).map(([skill, value]: any) => (
            <div key={skill} className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">{skill}</span>
                <span className="text-lg font-black text-indigo-500">{value}%</span>
              </div>
              <div className={`h-4 rounded-full overflow-hidden p-[3px] ${isDarkMode ? 'bg-slate-950 shadow-inner' : 'bg-slate-200'}`}>
                <div style={{ width: `${value}%` }} className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MuralView = ({ isDarkMode }: any) => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <header className="space-y-4 text-center md:text-left">
      <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none">Mural do<br/><span className="text-indigo-600">CORRE _</span></h1>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {MURAL_ITEMS.map(item => (
        <article key={item.id} className={`p-10 border-4 rounded-[50px] transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-600/30' : 'bg-white border-slate-100 shadow-2xl shadow-indigo-500/5 hover:border-indigo-300'}`}>
          <div className="flex justify-between items-start mb-10">
            <div className={`w-16 h-16 flex items-center justify-center rounded-3xl text-3xl shadow-lg ${item.type === 'AVISO' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'}`} aria-hidden="true">
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.date}</span>
          </div>
          <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter leading-tight">{item.title}</h3>
          <p className={`text-xl leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>{item.content}</p>
        </article>
      ))}
    </div>
  </div>
);

const TrilhasView = ({ user, onSelect, isDarkMode }: any) => (
  <div className="space-y-16 animate-in fade-in duration-1000">
    <header className="space-y-4 text-center md:text-left">
      <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8]">Protocolos<br/><span className="text-indigo-600">ATIVOS _</span></h1>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {TRACKS.map(track => (
        <article key={track.id} className={`p-12 border-4 rounded-[60px] transition-all flex flex-col justify-between min-h-[450px] group ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-600/50' : 'bg-white border-slate-200 shadow-2xl shadow-indigo-500/5 hover:border-indigo-500'}`}>
          <div className="space-y-8">
            <span className="text-8xl block group-hover:scale-110 transition-transform duration-500" role="img" aria-label={track.title}>{track.icon}</span>
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{track.title}</h2>
            <p className={`text-xl font-medium leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>{track.description}</p>
          </div>
          <button onClick={() => onSelect(track.lessons[0])} className="mt-12 h-20 bg-indigo-600 text-white font-black uppercase tracking-[0.3em] text-xs rounded-3xl shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all outline-none focus:ring-8 focus:ring-indigo-500/30">Executar Módulo</button>
        </article>
      ))}
    </div>
  </div>
);

const Onboarding = ({ onComplete, isDarkMode, toggleTheme }: any) => {
  const [nome, setNome] = useState('');
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
      <div className="w-28 h-28 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center text-6xl font-black rotate-6 mb-16 shadow-2xl shadow-indigo-600/50 animate-bounce">G</div>
      <div className="space-y-6 mb-24">
        <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter mb-4 leading-none">GUI.A<br/><span className="text-indigo-600">DIGITAL</span></h1>
        <p className="text-slate-500 font-black uppercase tracking-[0.7em] text-xs">Career Operating System v4.3</p>
      </div>
      <div className="w-full max-w-xl space-y-16">
        <div className="space-y-6">
          <label htmlFor="user-name" className="block text-xs font-black uppercase tracking-[0.5em] text-indigo-500">Inicializar Perfil do Jovem</label>
          <input 
            id="user-name"
            autoFocus
            value={nome}
            onChange={e => setNome(e.target.value)}
            className={`w-full bg-transparent border-b-8 py-6 text-center text-5xl md:text-7xl font-black uppercase outline-none transition-all placeholder:opacity-10 ${isDarkMode ? 'border-slate-800 focus:border-indigo-600' : 'border-slate-300 focus:border-indigo-500'}`}
            placeholder="COMO TE CHAMAM?"
            aria-required="true"
          />
        </div>
        <button 
          disabled={!nome}
          onClick={() => onComplete({ name: nome, level: 1, exp: 0, matrix: { Estrategia: 10, Escrita: 10, Analise: 10, Tecnica: 10, Design: 10, Audiovisual: 10 }, dossier: [] })}
          className="w-full h-24 bg-indigo-600 text-white rounded-[40px] font-black uppercase text-2xl shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-5 tracking-[0.3em] outline-none focus:ring-8 focus:ring-indigo-400"
        >
          Acessar Sistema
        </button>
      </div>
    </div>
  );
};

export default App;
