
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Lesson } from './types.ts';
import { TRACKS } from './constants.tsx';

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'visao' | 'corre' | 'dossie' | 'manifesto'>('corre');
  const [activeMission, setActiveMission] = useState<Lesson | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('guia_street_os_v1');
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {
      console.warn("Falha ao carregar perfil salvo");
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('guia_street_os_v1', JSON.stringify(user));
    }
  }, [user]);

  const runAudit = async (lesson: Lesson, delivery: string) => {
    if (!process.env.API_KEY) {
      console.error("API_KEY não configurada");
      return { score: 0, feedback: "ERRO: Terminal sem conexão com o Cérebro de IA." };
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `[SYSTEM::AUDITOR_CORE_V2]
    CONTEXTO: Simulação de Carreira Real para jovens talentos de periferia.
    REQUISITO: Rigor técnico extremo. Não aceite respostas genéricas.
    ATIVO ANALISADO: ${lesson.title} (${lesson.category})
    ENTREGA DO TALENTO: "${delivery}"
    
    SAÍDA OBRIGATÓRIA EM JSON:
    {
      "score": número (0-10),
      "feedback": "O papo reto técnico...",
      "mentor": "NODE_AUDITOR_RECIFE",
      "rubrics": {
        "technical": 0-100,
        "creativity": 0-100,
        "impact": 0-100
      }
    }`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 2000 }
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      if (user && result.score >= 5) {
        const newMatrix = { ...user.matrix };
        const comp = lesson.competency;
        newMatrix[comp] = Math.min(10, (newMatrix[comp] * 0.9) + (result.score * 0.1));
        
        setUser({
          ...user,
          exp: user.exp + (result.score * 120),
          matrix: newMatrix,
          dossier: [{ 
            lessonId: lesson.id, 
            lessonTitle: lesson.title, 
            assetUrl: delivery, 
            audit: result, 
            date: new Date().toLocaleDateString('pt-BR') 
          }, ...user.dossier]
        });
      }
      return result;
    } catch (e) { 
      console.error("Erro na Auditoria:", e);
      return { score: 0, feedback: "Falha crítica na conexão de auditoria." }; 
    }
  };

  if (!user) return <InitStreetSession onComplete={setUser} />;

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden selection:bg-[#ff007a]/40">
      <aside className="w-20 lg:w-64 flex flex-col border-r-4 border-black bg-black/40 z-50">
        <div className="p-6 flex flex-col items-center lg:items-start gap-4">
          <div className="w-12 h-12 bg-[#ff007a] flex items-center justify-center rotate-3 shadow-[4px_4px_0_#00f2ff] mb-4">
            <span className="archivo-bold text-black text-2xl" style={{fontFamily: 'Archivo Black'}}>G</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="archivo-bold text-sm tracking-tighter leading-none" style={{fontFamily: 'Archivo Black'}}>GUI.A <br/><span className="text-[#00f2ff]">STREET OS</span></h1>
          </div>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-3">
          {[
            { id: 'visao', label: 'Sua Visão', icon: 'fa-eye' },
            { id: 'corre', label: 'O Corre', icon: 'fa-bolt' },
            { id: 'dossie', label: 'Dossiê', icon: 'fa-shield-halved' },
            { id: 'manifesto', label: 'Manifesto', icon: 'fa-fingerprint' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 transition-all group border-b-2 ${activeTab === item.id ? 'border-[#ff007a] bg-[#ff007a]/10 shadow-[inset_4px_0_0_#ff007a]' : 'border-transparent text-slate-500 hover:text-white'}`}
            >
              <i className={`fa-solid ${item.icon} text-xl w-6`}></i>
              <span className="hidden lg:block archivo-bold text-[10px] tracking-widest" style={{fontFamily: 'Archivo Black'}}>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 border-b-4 border-black flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur-md z-40">
          <h2 className="archivo-bold text-xl text-white italic" style={{fontFamily: 'Archivo Black'}}>{activeTab.toUpperCase()}</h2>
          <div className="w-10 h-10 bg-slate-900 border border-white/10 p-1 -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
             <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`} className="w-full h-full" alt="Avatar" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-5xl mx-auto space-y-12">
            {activeTab === 'visao' && <VisaoView user={user} />}
            {activeTab === 'corre' && <CorreHub onSelect={setActiveMission} />}
            {activeTab === 'dossie' && <DossieView dossier={user.dossier} />}
            {activeTab === 'manifesto' && <ManifestoView />}
          </div>
        </div>
      </main>

      {activeMission && (
        <MissionEnvironment 
          lesson={activeMission} 
          onClose={() => setActiveMission(null)} 
          onAudit={runAudit} 
        />
      )}
    </div>
  );
};

const VisaoView = ({ user }: { user: UserProfile }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="p-12 bg-gradient-to-r from-[#ff007a]/10 to-transparent border-2 border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-black">STREET</div>
      <h1 className="text-7xl font-black text-white mb-2 leading-none" style={{fontFamily: 'Archivo Black'}}>{user.name}</h1>
      <p className="font-mono text-[#00f2ff] font-bold text-sm tracking-widest uppercase">Operador de Ativos // Nível {user.level}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(user.matrix).map(([key, val]) => (
        <div key={key} className="p-8 bg-slate-900/40 border border-white/5 group hover:border-[#ff007a]/30 transition-colors">
          <p className="text-[10px] text-slate-500 mb-1 tracking-widest uppercase">{key}</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-black text-white">{(val * 10).toFixed(0)}</span>
            <span className="text-[#ff007a] font-bold text-xl">%</span>
          </div>
          <div className="h-2 w-full bg-black/80">
            <div className="h-full bg-gradient-to-r from-[#ff007a] to-[#00f2ff] transition-all duration-1000" style={{ width: `${val * 10}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CorreHub = ({ onSelect }: any) => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <h2 className="text-7xl font-black text-white tracking-tighter leading-none" style={{fontFamily: 'Archivo Black'}}>O CORRE<br/><span className="text-[#ff007a] italic">VIRA ATIVO.</span></h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {TRACKS.map(track => (
        <div 
          key={track.id} 
          onClick={() => onSelect(track.lessons[0])}
          className="p-10 cursor-pointer bg-slate-900/20 border-2 border-white/5 hover:border-[#00f2ff] transition-all flex flex-col justify-between group h-[360px]"
        >
          <div>
            <div className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all">{track.icon}</div>
            <h3 className="text-3xl font-black text-white mb-2" style={{fontFamily: 'Archivo Black'}}>{track.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed italic">"{track.lessons[0].theory.substring(0, 100)}..."</p>
          </div>
          <button className="bg-[#ff4d00] group-hover:bg-[#ff007a] text-white py-4 px-10 text-[11px] font-bold tracking-widest transition-colors uppercase">INICIAR OPERAÇÃO</button>
        </div>
      ))}
    </div>
  </div>
);

const MissionEnvironment = ({ lesson, onClose, onAudit }: any) => {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAudit = async () => {
    setLoading(true);
    const res = await onAudit(lesson, input);
    setResult(res);
    setLoading(false);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-[#020617] border-2 border-[#ff007a]/20 flex flex-col min-h-[80vh] shadow-[0_0_50px_rgba(255,0,122,0.1)]">
        <div className="p-8 border-b-4 border-black flex justify-between items-center bg-black/40">
          <span className="font-bold text-[#ff007a] text-sm tracking-widest uppercase">TERMINAL::STREET_LAB</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-3xl"></i></button>
        </div>

        <div className="flex-1 p-8 md:p-16 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <h1 className="text-7xl font-black text-white italic uppercase leading-none" style={{fontFamily: 'Archivo Black'}}>MISSÃO DE<br/><span className="text-[#00f2ff]">VALIDAÇÃO</span></h1>
              <div className="p-10 bg-black/60 border border-[#00f2ff]/10">
                 <p className="text-3xl font-black text-white leading-tight">{lesson.labPrompt}</p>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-[#ff4d00] py-8 text-xl font-bold hover:scale-[1.02] transition-transform">INICIAR ENTREGA TÉCNICA</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 flex flex-col h-full animate-in slide-in-from-right-8 duration-500">
              <textarea 
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="// Digite ou cole sua solução técnica aqui..."
                className="flex-1 w-full min-h-[300px] bg-black border-4 border-slate-900 p-8 text-xl text-[#00f2ff] font-mono outline-none focus:border-[#ff007a] placeholder:opacity-20"
              />
              <button disabled={!input || loading} onClick={handleAudit} className="w-full bg-[#ff4d00] py-8 text-xl font-bold disabled:opacity-50">
                {loading ? 'AUDITANDO RIGOR TÉCNICO...' : 'SUBMETER PARA AUDITORIA'}
              </button>
            </div>
          )}

          {step === 3 && result && (
            <div className="text-center space-y-10 animate-in zoom-in-95 duration-500">
              <div className="text-[120px] font-black italic text-white leading-none" style={{fontFamily: 'Archivo Black'}}>
                {result.score}<span className="text-[#ff007a] text-5xl">/10</span>
              </div>
              <div className="p-10 bg-white/5 border border-[#ff007a]/30 text-left">
                <p className="text-[#00f2ff] font-mono text-xs mb-4 uppercase tracking-widest">Feedback do Auditor:</p>
                <p className="text-white text-2xl font-bold italic font-mono leading-relaxed">"{result.feedback}"</p>
              </div>
              <button onClick={onClose} className="w-full bg-[#ff4d00] py-8 text-2xl font-bold hover:bg-[#ff007a] transition-colors">ARQUIVAR NO DOSSIÊ</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DossieView = ({ dossier }: any) => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <h2 className="text-7xl font-black text-white tracking-tighter italic" style={{fontFamily: 'Archivo Black'}}>DOSSIÊ DE<br/><span className="text-[#00f2ff]">RESPONSA</span></h2>
    <div className="grid grid-cols-1 gap-6">
       {dossier.map((item: any, i: number) => (
         <div key={i} className="p-8 bg-slate-900/20 border border-white/5 flex justify-between items-center hover:bg-slate-900/40 transition-colors">
            <div>
               <h4 className="text-2xl font-black text-white uppercase" style={{fontFamily: 'Archivo Black'}}>{item.lessonTitle}</h4>
               <p className="text-xs text-slate-500 font-mono mt-2 uppercase tracking-widest">REALIZADO EM: {item.date} | SCORE FINAL: {item.audit.score}</p>
            </div>
            <div className="text-3xl font-black text-[#ff007a] italic">{item.audit.score}</div>
         </div>
       ))}
       {dossier.length === 0 && (
         <div className="border-4 border-dashed border-slate-900 py-32 text-center">
            <p className="text-slate-700 font-bold uppercase tracking-[1em]">Dossiê Vazio</p>
         </div>
       )}
    </div>
  </div>
);

const ManifestoView = () => (
  <div className="max-w-3xl mx-auto space-y-12 text-slate-200 animate-in fade-in slide-in-from-bottom-8 duration-1000">
    <h2 className="text-7xl font-black text-white italic text-center" style={{fontFamily: 'Archivo Black'}}>MANIFESTO</h2>
    <div className="p-12 bg-black/40 border-l-8 border-[#ff007a] space-y-10">
       <div className="space-y-2">
         <h4 className="text-[#00f2ff] font-bold text-xs tracking-widest">CLÁUSULA 01</h4>
         <p className="text-2xl font-bold italic leading-tight">NÃO É UM CURSO. É um sistema de hackeamento de carreira para quem não herdou herança.</p>
       </div>
       <div className="space-y-2">
         <h4 className="text-[#00f2ff] font-bold text-xs tracking-widest">CLÁUSULA 02</h4>
         <p className="text-2xl font-bold italic leading-tight">RIGOR É RESPEITO. O mercado real não perdoa amadorismo. Se errou, volta e faz de novo até ficar sênior.</p>
       </div>
       <div className="space-y-2">
         <h4 className="text-[#00f2ff] font-bold text-xs tracking-widest">CLÁUSULA 03</h4>
         <p className="text-2xl font-bold italic leading-tight">A PERIFERIA É O CENTRO. Nossa vivência é o ativo mais caro da nova economia criativa.</p>
       </div>
    </div>
  </div>
);

const InitStreetSession = ({ onComplete }: any) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => {
      onComplete({
        name, level: 1, exp: 0, 
        matrix: { Estrategia: 0, Escrita: 0, Analise: 0, Tecnica: 0 },
        dossier: []
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
      <div className="w-24 h-24 bg-white rotate-6 mb-8 flex items-center justify-center shadow-[10px_10px_0_#ff007a] animate-bounce">
         <span className="text-black text-6xl font-black">G</span>
      </div>
      <h1 className="text-8xl font-black text-white leading-none mb-12" style={{fontFamily: 'Archivo Black'}}>GUI.A<br/><span className="text-[#00f2ff]">STREET</span></h1>
      <div className="w-full max-w-md space-y-8">
        <input 
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="COMO TE CHAMAM NO CORRE?"
          className="w-full bg-transparent border-b-8 border-slate-900 py-6 text-center text-4xl font-black text-white outline-none focus:border-[#ff007a] uppercase italic placeholder:text-slate-900"
        />
        <button 
          disabled={!name || loading}
          onClick={handleStart}
          className="w-full bg-[#ff4d00] py-8 text-xl font-bold shadow-[0_10px_30px_rgba(255,77,0,0.3)] hover:bg-[#ff007a] transition-all disabled:opacity-20"
        >
          {loading ? 'AUTENTICANDO NÓ...' : 'SUBIR PRO SISTEMA'}
        </button>
      </div>
    </div>
  );
};

export default App;
