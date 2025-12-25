
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { UserProfile, Lesson, LessonState, PortfolioItem, AuditResult, Track, Competency } from './types';
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
  const [activeTab, setActiveTab] = useState<'trilhas' | 'dossie' | 'manifesto' | 'mural'>('trilhas');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonState, setLessonState] = useState<LessonState>('THEORY');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    const saved = localStorage.getItem('guia_digital_v3');
    if (saved) setUser(JSON.parse(saved));
    return () => { window.removeEventListener('online', updateStatus); window.removeEventListener('offline', updateStatus); };
  }, []);

  useEffect(() => { if (user) localStorage.setItem('guia_digital_v3', JSON.stringify(user)); }, [user]);

  const speak = async (text: string) => {
    if (isOffline) return alert("Offline: áudio desabilitado.");
    try {
      setAnnouncement("Iniciando leitura assistiva.");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Diga de forma calma e profissional para um jovem aprendiz: ${text}` }] }],
        config: { 
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
        }
      });
      const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const buffer = await decodeAudio(decodeBase64(base64), ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) { console.error(e); }
  };

  const handleAudit = async (lesson: Lesson, type: 'PRACTICE' | 'SUBMISSION', content: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `[SISTEMA::GUI.A_AUDIT_V3] Audite esta entrega de ${lesson.category}. 
    PERSONA: Mentor GUI.A do Porto Digital. Exigente, focado em mercado real, mas que apoia o corre do jovem.
    CONTEÚDO DA ENTREGA: ${JSON.stringify(content)}.`;
    
    try {
      const res = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: prompt, 
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: 'Score final de 0 a 10' },
              feedback: { type: Type.STRING, description: 'Feedback construtivo e motivador em português' },
              aprovado: { type: Type.BOOLEAN, description: 'Se a entrega atende aos requisitos mínimos' },
              rubrica: {
                type: Type.OBJECT,
                properties: {
                  execucao_pratica: { type: Type.NUMBER, description: 'Nota de 0 a 3' },
                  qualidade_tecnica: { type: Type.NUMBER, description: 'Nota de 0 a 3' },
                  estrategia_clareza: { type: Type.NUMBER, description: 'Nota de 0 a 2' },
                  profissionalismo: { type: Type.NUMBER, description: 'Nota de 0 a 2' }
                },
                required: ['execucao_pratica', 'qualidade_tecnica', 'estrategia_clareza', 'profissionalismo']
              },
              mentor: { type: Type.STRING, description: 'Assinatura do Mentor GUI.A' }
            },
            required: ['score', 'feedback', 'aprovado', 'rubrica', 'mentor']
          }
        } 
      });
      
      const text = res.text;
      return JSON.parse(text || '{}');
    } catch (error) { 
      console.error('STREET_OS_AUDIT_ERROR:', error);
      return { score: 0, feedback: "Falha na conexão com o mentor de IA.", aprovado: false }; 
    }
  };

  if (!user) return <Onboarding onComplete={setUser} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <div className="sr-only" aria-live="polite">{announcement}</div>
      
      {/* Navegação Principal */}
      <nav className="h-24 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between" role="navigation">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 flex items-center justify-center font-black rounded-xl shadow-lg shadow-indigo-500/20 text-xl transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">G</div>
          <div className="hidden md:block">
            <span className="font-black tracking-tighter text-2xl">GUI.A <span className="text-indigo-500 italic">DIGITAL</span></span>
            <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.3em]">Recife Social Tech</p>
          </div>
        </div>
        
        <div className="flex gap-1 md:gap-4 h-full items-center">
          <NavBtn active={activeTab === 'trilhas'} onClick={() => setActiveTab('trilhas')} icon="fa-bolt" label="Trilhas" />
          <NavBtn active={activeTab === 'dossie'} onClick={() => setActiveTab('dossie')} icon="fa-briefcase" label="Dossiê" />
          <NavBtn active={activeTab === 'mural'} onClick={() => setActiveTab('mural')} icon="fa-bullhorn" label="Mural" />
          <NavBtn active={activeTab === 'manifesto'} onClick={() => setActiveTab('manifesto')} icon="fa-fingerprint" label="Missão" />
        </div>

        <div className="flex items-center gap-6 border-l border-slate-800 pl-6 ml-2 h-10">
          <div className="flex flex-col items-center">
             <div className="flex gap-1 mb-1 items-end h-6">
                {Object.entries(user.matrix).map(([key, val]) => (
                  <div key={key} title={`${key}: ${val}%`} className="w-1.5 h-full bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end">
                    <div style={{ height: `${val}%` }} className="w-full bg-indigo-500 transition-all duration-1000"></div>
                  </div>
                ))}
             </div>
             <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">Maestria</span>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-indigo-400 uppercase leading-none mb-1">LVL {user.level}</p>
            <p className="text-sm font-bold truncate max-w-[100px] leading-none">{user.name}</p>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-4 md:p-12 relative">
        <div className="scanline pointer-events-none fixed inset-0 opacity-10"></div>
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
          />
        ) : (
          <div className="max-w-6xl mx-auto pb-20">
            {activeTab === 'trilhas' && <TrilhasView user={user} onSelect={(l: Lesson) => { setActiveLesson(l); setLessonState('THEORY'); }} />}
            {activeTab === 'dossie' && <DossieView dossier={user.dossier} matrix={user.matrix} />}
            {activeTab === 'mural' && <MuralView />}
            {activeTab === 'manifesto' && <ManifestoView />}
          </div>
        )}
      </main>

      <footer className="p-4 bg-slate-950 border-t border-slate-900 text-center text-[9px] text-slate-600 font-bold tracking-[0.4em] uppercase">
        GUI.A DIGITAL V3.5 | Porto Digital Community OS
      </footer>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center gap-1 px-3 md:px-5 py-2 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest focus:ring-2 ring-indigo-500 outline-none h-full group ${active ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <i className={`fa-solid ${icon} text-lg md:text-xl transition-transform group-hover:scale-110`}></i>
    <span className="hidden lg:inline">{label}</span>
    {active && (
      <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-in slide-in-from-left-2 duration-300"></div>
    )}
  </button>
);

const MuralView = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
    <header className="space-y-2">
      <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none font-archivo">
        MURAL DO<br/><span className="text-indigo-500">CORRE.</span>
      </h1>
      <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Visão estratégica e oportunidades da rede.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {MURAL_ITEMS.map((item, idx) => (
        <div 
          key={item.id} 
          className="p-10 bg-slate-900/30 border-2 border-slate-900/50 rounded-4xl hover:border-indigo-500/40 transition-all flex flex-col gap-6 group relative overflow-hidden animate-in fade-in duration-500"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="absolute -right-4 -top-4 opacity-[0.03] text-9xl font-black italic -rotate-12 transition-transform group-hover:rotate-0">{idx + 1}</div>
          <div className="flex justify-between items-center relative z-10">
            <div className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl transition-all ${
              item.type === 'AVISO' ? 'bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/5' : 
              item.type === 'DICA' ? 'bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/5' : 
              'bg-indigo-500/10 text-indigo-500 shadow-lg shadow-indigo-500/5'
            }`}>
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <div className="text-right">
              <span className={`text-[9px] font-black uppercase tracking-widest block mb-1 ${
                item.type === 'AVISO' ? 'text-amber-500' : 
                item.type === 'DICA' ? 'text-emerald-500' : 
                'text-indigo-500'
              }`}>{item.type}</span>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{item.date}</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase mb-3 group-hover:text-white transition-colors leading-none tracking-tight">{item.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.content}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LessonEngine = ({ lesson, state, setState, onAudit, onSpeak, onExit, user, setUser }: any) => {
  const [loading, setLoading] = useState(false);
  const [written, setWritten] = useState('');
  const [audit, setAudit] = useState<AuditResult | null>(null);

  const finish = async () => {
    if (written.length < 50) return;
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

      setUser({
        ...user,
        level: user.level + (result.score > 8 ? 1 : 0),
        exp: user.exp + (result.score * 100),
        matrix: newMatrix,
        dossier: [newItem, ...user.dossier]
      });
      setState('REVIEW');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <header className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-3 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-[0.3em] group transition-all bg-slate-900/50 px-4 py-2 rounded-lg">
          <i className="fa-solid fa-chevron-left group-hover:-translate-x-1 transition-transform"></i> Abortar Protocolo
        </button>
        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20">{lesson.category}</span>
      </header>

      {state === 'THEORY' && (
        <section className="space-y-10">
          <div className="flex items-center justify-between gap-8">
            <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-none tracking-tighter">{lesson.title}</h1>
            <button onClick={() => onSpeak(lesson.theoryContent)} className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 hover:scale-110 active:scale-95 transition-all flex-shrink-0">
              <i className="fa-solid fa-volume-high text-2xl"></i>
            </button>
          </div>
          <div className="p-10 md:p-14 bg-slate-900/40 border-l-[12px] border-indigo-600 rounded-r-[40px] text-xl leading-relaxed text-slate-300 font-medium shadow-2xl backdrop-blur-sm">
            {lesson.theoryContent}
          </div>
          <button onClick={() => setState('PRACTICE')} className="w-full py-10 bg-indigo-600 rounded-[32px] text-2xl font-black uppercase shadow-2xl hover:bg-indigo-500 transition-all active:scale-[0.98] shadow-indigo-600/20 tracking-widest">Acessar Prática Técnica</button>
        </section>
      )}

      {state === 'PRACTICE' && (
        <section className="space-y-8">
          <div className="p-10 bg-indigo-950/20 border-2 border-indigo-500/20 rounded-[32px] italic text-xl text-indigo-100 flex gap-6 shadow-inner">
             <i className="fa-solid fa-terminal text-3xl text-indigo-500 mt-1"></i>
             <p className="leading-relaxed">{lesson.practicePrompt}</p>
          </div>
          <div className="relative">
            <textarea 
              value={written}
              onChange={e => setWritten(e.target.value)}
              className="w-full h-96 bg-slate-950 border-4 border-slate-900 rounded-[32px] p-10 text-xl font-mono text-emerald-400 outline-none focus:border-indigo-600 focus:ring-8 ring-indigo-500/10 transition-all resize-none shadow-2xl placeholder:opacity-20"
              placeholder="// Sua solução estratégica aqui..."
            />
            <div className="absolute bottom-6 right-10 text-[10px] font-black uppercase tracking-widest text-slate-700">
               Caracteres: {written.length} / Mín: 50
            </div>
          </div>
          <button 
            disabled={loading || written.length < 50}
            onClick={finish}
            className="w-full py-10 bg-emerald-600 rounded-[32px] text-2xl font-black uppercase flex items-center justify-center gap-4 disabled:opacity-20 shadow-2xl shadow-emerald-900/20 transition-all hover:bg-emerald-500 active:scale-[0.98]"
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-shield-virus"></i>}
            {loading ? 'Processando Validação...' : 'Sincronizar com Mentor GUI.A'}
          </button>
          {audit && !audit.aprovado && (
            <div className="p-10 bg-red-950/10 border-2 border-red-500/20 rounded-[32px] space-y-4 animate-in shake duration-500">
              <h4 className="text-red-500 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i> Protocolo de Revisão
              </h4>
              <p className="text-red-100 font-bold italic leading-relaxed text-lg">"{audit.feedback}"</p>
            </div>
          )}
        </section>
      )}

      {state === 'REVIEW' && (
        <section className="text-center space-y-12 py-10 animate-in zoom-in-95 duration-700">
          <div className="w-40 h-40 bg-emerald-600 rounded-[40px] mx-auto flex items-center justify-center text-6xl text-white shadow-[0_0_80px_rgba(16,185,129,0.4)] animate-pulse rotate-3 hover:rotate-0 transition-transform">
            <i className="fa-solid fa-stamp"></i>
          </div>
          <div className="space-y-3">
            <h1 className="text-7xl font-black uppercase italic leading-none tracking-tighter">VALIDADO!</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">O ativo técnico foi adicionado ao seu dossiê permanente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-5xl mx-auto">
             <div className="p-10 bg-slate-900/60 rounded-[40px] border-2 border-slate-800 space-y-6 shadow-2xl">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Análise do Mentor</h4>
                <p className="text-2xl font-bold font-mono italic text-slate-200 leading-relaxed">"{audit?.feedback}"</p>
                <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black">G</div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{audit?.mentor}</p>
                </div>
             </div>
             
             <div className="p-10 bg-slate-900/60 rounded-[40px] border-2 border-slate-800 space-y-8 shadow-2xl">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Indicadores de Maestria</h4>
                <div className="space-y-4">
                   <RubricBar label="Execução Prática" value={audit?.rubrica?.execucao_pratica || 0} max={3} />
                   <RubricBar label="Qualidade Técnica" value={audit?.rubrica?.qualidade_tecnica || 0} max={3} />
                   <RubricBar label="Estratégia/Clareza" value={audit?.rubrica?.estrategia_clareza || 0} max={2} />
                   <RubricBar label="Profissionalismo" value={audit?.rubrica?.profissionalismo || 0} max={2} />
                </div>
                <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                   <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Score de Impacto</span>
                   <span className="text-5xl font-black text-emerald-500 tabular-nums">{audit?.score}/10</span>
                </div>
             </div>
          </div>

          <button onClick={onExit} className="w-full max-w-md bg-indigo-600 py-8 rounded-[32px] font-black uppercase text-2xl shadow-2xl hover:bg-indigo-500 transition-all shadow-indigo-500/30 active:scale-95 tracking-widest">Retornar ao Hub</button>
        </section>
      )}
    </div>
  );
};

const RubricBar = ({ label, value, max }: { label: string, value: number, max: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 tracking-widest">
      <span>{label}</span>
      <span className="text-white">{value}/{max}</span>
    </div>
    <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`flex-1 rounded-full transition-all duration-700 ${i < value ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-slate-900 opacity-30'}`}></div>
      ))}
    </div>
  </div>
);

const TrilhasView = ({ user, onSelect }: any) => (
  <div className="space-y-16 animate-in fade-in duration-1000">
    <header className="space-y-2">
      <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none font-archivo">
        ROTAS DE<br/><span className="text-indigo-500">ALTO IMPACTO.</span>
      </h1>
      <p className="text-slate-500 font-bold uppercase tracking-[0.5em] text-[10px]">Inicie um protocolo de especialização técnica.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {TRACKS.map((track, idx) => (
        <div 
          key={track.id} 
          className="group p-10 bg-slate-900/30 border-2 border-slate-900 rounded-[48px] hover:border-indigo-500/50 transition-all flex flex-col justify-between min-h-[380px] relative overflow-hidden animate-in slide-in-from-bottom-4"
          style={{ animationDelay: `${idx * 150}ms` }}
        >
          <div className="absolute top-0 right-0 p-12 text-[180px] text-indigo-500/5 font-black italic -z-10 select-none group-hover:scale-110 group-hover:-rotate-6 transition-all duration-1000 leading-none">{track.icon}</div>
          <div className="relative z-10">
            <span className="text-7xl block mb-8 transition-transform group-hover:scale-110 duration-500 origin-left">{track.icon}</span>
            <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter group-hover:text-white transition-colors">{track.title}</h2>
            <p className="text-slate-500 font-medium leading-relaxed max-w-sm text-lg">{track.description}</p>
          </div>
          <button 
            onClick={() => onSelect(track.lessons[0])}
            className="mt-12 w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] text-xs rounded-3xl shadow-2xl transition-all active:scale-95 shadow-indigo-600/10 group-hover:shadow-indigo-500/30"
          >
            Acessar Protocolo
          </button>
        </div>
      ))}
    </div>
  </div>
);

const DossieView = ({ dossier, matrix }: any) => (
  <div className="space-y-16 animate-in fade-in duration-700">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
       <div className="lg:col-span-2 space-y-16">
          <header className="space-y-2">
            <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none font-archivo">
              DOSSIÊ<br/><span className="text-indigo-500">TÉCNICO.</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.5em] text-[10px]">Histórico permanente de ativos validados.</p>
          </header>
          <div className="grid gap-8">
            {dossier.map((item: any, i: number) => (
              <div key={i} className="p-10 bg-slate-900/40 border-2 border-slate-900 rounded-[40px] flex flex-col md:flex-row justify-between gap-8 hover:border-indigo-500/30 transition-all group animate-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black bg-indigo-600 text-white px-4 py-1.5 rounded-full uppercase tracking-widest">{item.trackId}</span>
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest bg-slate-800/50 px-3 py-1.5 rounded-full">{item.date}</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase group-hover:text-white transition-colors tracking-tight leading-none">{item.lessonTitle}</h3>
                  <p className="text-slate-500 font-medium italic text-lg leading-relaxed max-w-xl">"{item.writtenResponse.substring(0, 150)}..."</p>
                </div>
                <div className="text-center md:text-right border-t md:border-t-0 md:border-l-2 border-slate-900 pt-8 md:pt-0 md:pl-10 flex flex-col justify-center min-w-[140px]">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Impact Score</span>
                  <span className="text-6xl font-black text-white tabular-nums tracking-tighter">{item.audit.score}</span>
                </div>
              </div>
            ))}
            {dossier.length === 0 && (
              <div className="p-32 border-4 border-dashed border-slate-900 rounded-[64px] text-center opacity-30 flex flex-col items-center">
                <i className="fa-solid fa-folder-open text-8xl mb-8 text-slate-800"></i>
                <p className="font-black uppercase tracking-[0.4em] text-xs">Aguardando seu primeiro ativo validado.</p>
              </div>
            )}
          </div>
       </div>

       <div className="space-y-10 lg:pt-32">
          <div className="p-10 bg-indigo-600/5 border-2 border-indigo-500/20 rounded-[48px] space-y-8 backdrop-blur-sm sticky top-36">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter">Matriz de Maestria</h3>
             <div className="space-y-8">
                {Object.entries(matrix).map(([skill, value]: any) => (
                  <div key={skill} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{skill}</span>
                      <span className="text-xs font-black text-indigo-400 tabular-nums">{value}%</span>
                    </div>
                    <div className="h-3 bg-slate-950 rounded-full overflow-hidden p-[2px]">
                       <div style={{ width: `${value}%` }} className="h-full bg-gradient-to-r from-indigo-700 to-indigo-400 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-1000"></div>
                    </div>
                  </div>
                ))}
             </div>
             <div className="pt-8 border-t border-indigo-500/20 text-center">
                <p className="text-[9px] font-bold text-indigo-500/60 uppercase tracking-widest leading-relaxed">Sincronizado com a rede de mentores GUI.A DIGITAL</p>
             </div>
          </div>
       </div>
    </div>
  </div>
);

const ManifestoView = () => (
  <article className="max-w-5xl mx-auto space-y-24 py-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
    <div className="text-center space-y-6">
      <h1 className="text-8xl md:text-[140px] font-black italic tracking-tighter uppercase leading-[0.8] text-white">CORRE<br/>VERO.</h1>
      <p className="text-indigo-500 font-black uppercase tracking-[0.8em] text-[10px]">O Código de Conduta do Jovem Social Tech.</p>
    </div>
    <div className="space-y-16 text-3xl md:text-5xl font-black italic leading-[1.1] text-slate-400 border-l-[16px] border-indigo-600 pl-10 md:pl-20">
      <p className="hover:text-white transition-all cursor-default">"Onde houver escassez, seremos a vanguarda da abundância técnica."</p>
      <p className="hover:text-white transition-all cursor-default">"Nosso portfólio não é papel, é prova de existência econômica."</p>
      <p className="hover:text-white transition-all cursor-default">"A tecnologia serve ao território, ou não serve para nada."</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10">
      {[
        { t: 'AUTONOMIA', d: 'Domínio total das ferramentas de produção.' },
        { t: 'REDE', d: 'Crescimento coletivo e troca de ativos.' },
        { t: 'IMPACTO', d: 'Toda técnica deve gerar valor real no bairro.' }
      ].map(p => (
        <div key={p.t} className="p-12 bg-slate-900/50 border-2 border-slate-900 rounded-[48px] text-center group hover:border-indigo-500/50 transition-all space-y-4">
          <span className="font-black uppercase tracking-[0.3em] text-sm text-indigo-500 block">{p.t}</span>
          <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed">{p.d}</p>
        </div>
      ))}
    </div>
  </article>
);

const Onboarding = ({ onComplete }: any) => {
  const [nome, setNome] = useState('');
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000 relative overflow-hidden">
      <div className="scanline fixed inset-0 opacity-10"></div>
      <div className="w-24 h-24 bg-indigo-600 rounded-[24px] flex items-center justify-center text-5xl font-black rotate-6 mb-16 shadow-[0_0_50px_rgba(79,70,229,0.5)] animate-bounce transition-transform hover:rotate-0 cursor-default">G</div>
      <div className="space-y-4 mb-20">
        <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-none text-white">GUI.A<br/><span className="text-indigo-600">DIGITAL</span></h1>
        <p className="text-slate-600 font-black uppercase tracking-[0.6em] text-[10px]">Social Career Operating System v3.5</p>
      </div>
      <div className="w-full max-w-lg space-y-12 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Identificação de Usuário</label>
          <input 
            autoFocus
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full bg-transparent border-b-[6px] border-slate-900 py-6 text-center text-4xl md:text-5xl font-black uppercase outline-none focus:border-indigo-600 transition-all placeholder:text-slate-900"
            placeholder="NOME OU VULGO"
          />
        </div>
        <button 
          disabled={!nome}
          onClick={() => onComplete({ name: nome, level: 1, exp: 0, matrix: { Estrategia: 10, Escrita: 10, Analise: 10, Tecnica: 10, Design: 10, Audiovisual: 10 }, dossier: [] })}
          className="w-full py-8 bg-indigo-600 rounded-[32px] font-black uppercase text-2xl shadow-2xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-5 shadow-indigo-600/20 tracking-widest"
        >
          Iniciar Protocolo
        </button>
      </div>
    </div>
  );
};

export default App;
