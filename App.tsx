
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { UserProfile, Lesson, LessonState, PortfolioItem, AuditResult, Track } from './types';
import { TRACKS, MURAL_ITEMS, MuralItem } from './constants';

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

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
    setSimplifiedText("Simplificando conteúdo...");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Simplifique para linguagem periférica/acessível: "${text}"`,
      });
      setSimplifiedText(res.text || text);
    } catch (e) { setSimplifiedText("Erro na simplificação."); }
  };

  const speak = async (text: string) => {
    if (isOffline) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
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

  const handleAudit = async (lesson: Lesson, content: string) => {
    if (isOffline) return { score: 0, feedback: "Offline.", aprovado: false };
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const res = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: `Audite: ${lesson.title}. Conteúdo: ${content}`, 
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
    } catch (error) { return { score: 0, feedback: "Erro na auditoria.", aprovado: false }; }
  };

  if (!user) return <Onboarding onComplete={setUser} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-indigo-600 focus:p-4">
        Pular para o conteúdo principal
      </a>

      <nav className={`h-24 border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 backdrop-blur-lg ${isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-white/95'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg">G</div>
          <span className="font-black text-sm uppercase hidden sm:block tracking-widest">GUI.A <span className="text-indigo-500 italic">DIGITAL</span></span>
        </div>

        <div className="flex gap-1 md:gap-2 h-full items-center">
          <NavBtn active={activeTab === 'trilhas'} onClick={() => setActiveTab('trilhas')} icon="fa-bolt" label="Trilhas" />
          <NavBtn active={activeTab === 'dossie'} onClick={() => setActiveTab('dossie')} icon="fa-briefcase" label="Dossiê" />
          <NavBtn active={activeTab === 'mural'} onClick={() => setActiveTab('mural')} icon="fa-bullhorn" label="Mural" />
          <NavBtn active={activeTab === 'manifesto'} onClick={() => setActiveTab('manifesto')} icon="fa-fingerprint" label="Manifesto" />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleVoiceCommands} className={`w-10 h-10 rounded-full flex items-center justify-center ${isVoiceActive ? 'bg-red-500 text-white animate-pulse' : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')}`}>
            <i className={`fa-solid ${isVoiceActive ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
          </button>
          <button onClick={toggleTheme} className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-white text-indigo-600 shadow-sm border'}`}>
            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </nav>

      <main id="main-content" className="flex-1 p-4 md:p-12 focus:outline-none">
        <div className="max-w-5xl mx-auto pb-16">
          {activeLesson ? (
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
            <>
              {activeTab === 'trilhas' && <TrilhasView user={user} onSelect={(l: Lesson) => { setActiveLesson(l); setLessonState('THEORY'); }} isDarkMode={isDarkMode} />}
              {activeTab === 'dossie' && <DossieView dossier={user.dossier} matrix={user.matrix} isDarkMode={isDarkMode} />}
              {activeTab === 'mural' && <MuralView isDarkMode={isDarkMode} />}
              {activeTab === 'manifesto' && <ManifestoView isDarkMode={isDarkMode} />}
            </>
          )}
        </div>
      </main>

      <footer className={`p-8 border-t text-center text-[9px] font-black tracking-[0.4em] uppercase ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
        GUI.A DIGITAL / INSTITUTO GUIA SOCIAL
      </footer>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center min-w-[64px] transition-all rounded-xl ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-500'}`}>
    <i className={`fa-solid ${icon} text-lg md:text-xl`}></i>
    <span className="text-[8px] font-black uppercase mt-1 hidden sm:block">{label}</span>
  </button>
);

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
        lessonId: lesson.id, lessonTitle: lesson.title, trackId: lesson.category,
        writtenResponse: written, deliveryEvidence: { objetivo: '', metodo: '', entregavel: '', resultado: '', autoavaliacao: '' },
        audit: result, date: new Date().toLocaleDateString(), versao: 1
      };
      const comp = lesson.competency as keyof typeof user.matrix;
      const newMatrix = { ...user.matrix };
      newMatrix[comp] = Math.min(newMatrix[comp] + 15, 100);
      setUser({ ...user, level: user.level + 1, exp: user.exp + 100, matrix: newMatrix, dossier: [newItem, ...user.dossier] });
      setState('REVIEW');
    }
  };

  return (
    <article className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <button onClick={onExit} className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-black text-xs uppercase hover:bg-indigo-600 hover:text-white transition-all">Voltar</button>
        <div className="flex gap-2">
          <button onClick={() => onSimplify(lesson.theoryContent)} className="w-10 h-10 rounded-xl border border-indigo-500 text-indigo-500 flex items-center justify-center"><i className="fa-solid fa-brain"></i></button>
          <button onClick={() => onSpeak(simplifiedText || lesson.theoryContent)} className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><i className="fa-solid fa-volume-high"></i></button>
        </div>
      </header>

      {state === 'THEORY' && (
        <section className="space-y-8">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none">{lesson.title}</h1>
          <div className={`p-8 border-l-[8px] border-indigo-600 rounded-r-3xl text-xl md:text-2xl leading-relaxed shadow-xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <p className="readable-text italic">{simplifiedText || lesson.theoryContent}</p>
          </div>
          <button onClick={() => setState('PRACTICE')} className="w-full h-20 bg-indigo-600 text-white rounded-2xl text-xl font-black uppercase shadow-xl hover:bg-indigo-500">Praticar Agora</button>
        </section>
      )}

      {state === 'PRACTICE' && (
        <section className="space-y-6">
          <div className="p-8 border-2 border-dashed border-indigo-500/30 rounded-3xl bg-indigo-500/5 italic text-lg">"{lesson.practicePrompt}"</div>
          <textarea 
            value={written} onChange={e => setWritten(e.target.value)}
            className={`w-full h-80 border-2 rounded-3xl p-8 text-xl font-mono outline-none focus:border-indigo-600 ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white'}`}
            placeholder="Seu processo..."
          />
          <button disabled={loading || written.length < 50} onClick={finish} className="w-full h-20 bg-emerald-600 text-white rounded-2xl text-xl font-black uppercase shadow-xl">
            {loading ? 'Validando...' : 'Entregar Protocolo'}
          </button>
        </section>
      )}

      {state === 'REVIEW' && (
        <section className="text-center py-12 space-y-8">
          <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-4xl text-white shadow-xl animate-bounce">
            <i className="fa-solid fa-check"></i>
          </div>
          <h1 className="text-4xl font-black uppercase italic">Protocolo Aprovado</h1>
          <div className={`p-8 border-l-8 border-emerald-500 rounded-r-3xl text-left max-w-2xl mx-auto ${isDarkMode ? 'bg-slate-900' : 'bg-white border'}`}>
            <p className="text-xl italic font-bold">"{audit?.feedback}"</p>
          </div>
          <button onClick={onExit} className="px-12 h-16 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-xl">Continuar</button>
        </section>
      )}
    </article>
  );
};

const ManifestoView = ({ isDarkMode }: any) => (
  <article className="py-12 space-y-16 animate-in fade-in duration-700">
    <h1 className="text-5xl md:text-8xl font-black italic uppercase leading-none tracking-tighter">Manifesto<br/><span className="text-indigo-600">GUIA DIGITAL _</span></h1>
    <div className={`space-y-8 text-2xl md:text-4xl font-black italic leading-tight border-l-8 border-indigo-600 pl-8 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      <p>Este não é apenas um app. É uma ponte de acessibilidade econômica.</p>
      <p className="text-indigo-600">"Dignidade é ter o domínio da técnica. Inclusão é remover a barreira entre o talento e a oportunidade."</p>
    </div>
  </article>
);

const DossieView = ({ dossier, matrix, isDarkMode }: any) => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Dossiê<br/><span className="text-indigo-500">Patrimonial.</span></h1>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {dossier.length === 0 ? <p className="text-slate-500 italic">Nenhum protocolo entregue ainda.</p> : 
          dossier.map((item: any, i: number) => (
            <article key={i} className={`p-8 border-2 rounded-3xl transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-4">
                  <span className="text-[8px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">{item.trackId}</span>
                  <h3 className="text-2xl font-black uppercase">{item.lessonTitle}</h3>
                  <p className="text-sm italic opacity-70">"{item.writtenResponse.substring(0, 100)}..."</p>
                </div>
                <div className="text-5xl font-black">{item.audit.score}</div>
              </div>
            </article>
          ))
        }
      </div>
      <div className={`p-8 border-4 rounded-3xl h-fit sticky top-32 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="text-xl font-black uppercase text-indigo-500 mb-6 tracking-widest">Maestria Técnica</h3>
        {Object.entries(matrix).map(([skill, value]: any) => (
          <div key={skill} className="mb-4">
            <div className="flex justify-between text-[10px] font-black uppercase mb-1"><span>{skill}</span><span>{value}%</span></div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div style={{ width: `${value}%` }} className="h-full bg-indigo-500"></div></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MuralView = ({ isDarkMode }: any) => {
  const [expandedMEI, setExpandedMEI] = useState(false);
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Mural do<br/><span className="text-indigo-600">CORRE _</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MURAL_ITEMS.map(item => {
          if (item.type === 'MEI') {
            return (
              <article key={item.id} className={`md:col-span-2 p-8 border-4 rounded-3xl transition-all ${isDarkMode ? 'bg-slate-900 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-2xl"><i className={`fa-solid ${item.icon}`}></i></div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.date}</span>
                  </div>
                  <h2 className="text-3xl font-black uppercase italic leading-none">{item.title}</h2>
                  <p className="text-lg opacity-80">{item.content}</p>
                  <button onClick={() => setExpandedMEI(!expandedMEI)} className="text-[10px] font-black uppercase text-emerald-600 border-b-2 border-emerald-600">
                    {expandedMEI ? 'Recolher Protocolo' : 'Abrir Protocolo Completo'}
                  </button>
                  {expandedMEI && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-6 animate-in slide-in-from-top-2">
                      {item.links?.map((link, idx) => (
                        <a key={idx} href={link.url} target="_blank" rel="noopener" className={`p-4 rounded-xl border flex items-center gap-3 transition-all hover:bg-emerald-600 hover:text-white ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white'}`}>
                          <i className={`fa-solid ${link.icon}`}></i>
                          <span className="text-[9px] font-black uppercase tracking-widest">{link.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          }
          const isInstitutional = item.type === 'INSTITUCIONAL';
          return (
            <article key={item.id} className={`p-8 border-2 rounded-3xl flex flex-col justify-between transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl'}`}>
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl text-white ${isInstitutional ? 'bg-indigo-600' : (item.type === 'AVISO' ? 'bg-amber-500' : 'bg-slate-700')}`}><i className={`fa-solid ${item.icon}`}></i></div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.date}</span>
                </div>
                <h3 className="text-2xl font-black uppercase leading-tight">{item.title}</h3>
                <p className="text-lg opacity-80">{item.content}</p>
                {item.links && (
                  <div className="grid grid-cols-1 gap-2 pt-4">
                    {item.links.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all text-indigo-500">
                        <i className={`fa-solid ${link.icon}`}></i>
                        <span className="text-[9px] font-black uppercase tracking-widest">{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

const TrilhasView = ({ user, onSelect, isDarkMode }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700">
    <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Protocolos<br/><span className="text-indigo-600">ATIVOS _</span></h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {TRACKS.map(track => (
        <article key={track.id} className={`p-8 border-4 rounded-3xl flex flex-col justify-between group min-h-[320px] ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-600/50' : 'bg-white shadow-xl'}`}>
          <div className="space-y-4">
            <span className="text-6xl block group-hover:scale-110 transition-transform">{track.icon}</span>
            <h2 className="text-3xl font-black uppercase leading-none">{track.title}</h2>
            <p className="text-lg opacity-70 italic">{track.description}</p>
          </div>
          <button onClick={() => onSelect(track.lessons[0])} className="mt-8 h-16 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-xl hover:bg-indigo-500 transition-all">Executar Módulo</button>
        </article>
      ))}
    </div>
  </div>
);

const Onboarding = ({ onComplete, isDarkMode, toggleTheme }: any) => {
  const [nome, setNome] = useState('');
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
      <div className="w-20 h-20 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-4xl font-black mb-12 animate-bounce">G</div>
      <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-16 leading-none">GUI.A<br/><span className="text-indigo-600">DIGITAL</span></h1>
      <div className="w-full max-w-md space-y-12">
        <input autoFocus value={nome} onChange={e => setNome(e.target.value)} className={`w-full bg-transparent border-b-4 py-4 text-center text-4xl font-black uppercase outline-none ${isDarkMode ? 'border-slate-800 focus:border-indigo-600' : 'border-slate-300 focus:border-indigo-500'}`} placeholder="TEU NOME?" />
        <button disabled={!nome} onClick={() => onComplete({ name: nome, level: 1, exp: 0, matrix: { Estrategia: 10, Escrita: 10, Analise: 10, Tecnica: 10, Design: 10, Audiovisual: 10 }, dossier: [] })} className="w-full h-20 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xl shadow-xl">Acessar Sistema</button>
      </div>
    </div>
  );
};

export default App;
