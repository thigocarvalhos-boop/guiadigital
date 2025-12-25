
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Lesson, AuditResult } from './types.ts';
import { TRACKS } from './constants.tsx';

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'visao' | 'corre' | 'dossie' | 'mural'>('corre');
  const [activeMission, setActiveMission] = useState<Lesson | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('guia_street_os_v1');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('guia_street_os_v1', JSON.stringify(user));
  }, [user]);

  const runAudit = async (lesson: Lesson, delivery: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `[STREET_AUDIT_PROTOCOL::V2]
    SITUAÇÃO: Auditoria técnica para talento de periferia no Porto Digital.
    ATIVO: ${lesson.title}
    COMPETÊNCIA: ${lesson.competency}
    ENTREGA: "${delivery}"
    
    META: Avalie com rigor técnico, mas use um tom de "Mentor de Quebrada" (direto, incentivador, papo reto).
    FORMATO OBRIGATÓRIO (JSON):
    {
      "score": número (0-10),
      "feedback": "Papo reto sobre a entrega, focado em evolução real",
      "mentor": "NODE_RECIFE_STREET",
      "rubrics": {
        "tecnica": número (0-100),
        "estilo": número (0-100),
        "impacto": número (0-100)
      }
    }`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      if (user) {
        const newMatrix = { ...user.matrix };
        newMatrix[lesson.competency] = Math.min(10, (newMatrix[lesson.competency] * 0.88) + (result.score * 0.12));
        setUser({
          ...user,
          exp: user.exp + (result.score * 100),
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
    } catch (e) { return null; }
  };

  if (!user) return <InitStreetSession onComplete={setUser} />;

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden selection:bg-hot-pink/40">
      {/* Sidebar Street Dock */}
      <aside className="w-20 lg:w-64 flex flex-col border-r-4 border-black bg-black/40 z-50">
        <div className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-hot-pink flex items-center justify-center rotate-3 shadow-[4px_4px_0_#00f2ff]">
            <span className="archivo-bold text-black text-2xl">G</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="archivo-bold text-sm tracking-tighter leading-none">GUI.A <br/><span className="text-cyan">Digital</span></h1>
          </div>
        </div>

        <nav className="flex-1 mt-10 px-3 space-y-4">
          {[
            { id: 'visao', label: 'Sua Visão', icon: 'fa-eye' },
            { id: 'corre', label: 'O Corre', icon: 'fa-bolt' },
            { id: 'dossie', label: 'Dossiê', icon: 'fa-folder-open' },
            { id: 'mural', label: 'Mural', icon: 'fa-bullhorn' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 transition-all group border-b-2 ${activeTab === item.id ? 'border-hot-pink bg-hot-pink/10' : 'border-transparent text-slate-500 hover:text-white'}`}
            >
              <i className={`fa-solid ${item.icon} text-xl w-6`}></i>
              <span className="hidden lg:block archivo-bold text-[11px] tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 lg:block hidden">
          <div className="p-4 border-2 border-dashed border-slate-800 rounded-lg">
             <p className="mono text-[9px] text-slate-600 mb-2 uppercase">Conexão Estável</p>
             <div className="flex gap-1">
                {[1,1,1,1,0].map((b,i) => <div key={i} className={`h-3 w-1 ${b ? 'bg-cyan' : 'bg-slate-800'}`}></div>)}
             </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-20 border-b-4 border-black flex items-center justify-between px-8 bg-slate-900/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="mono text-xs text-hot-pink font-bold">SYSTEM_LOG::ACCESS_GRANTED</span>
            <div className="h-4 w-px bg-slate-800"></div>
            <h2 className="archivo-bold text-lg text-white neon-text-cyan">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
               <p className="archivo-bold text-[10px] text-slate-500">Reputação Total</p>
               <p className="text-xl font-black text-white mono">{user.exp.toLocaleString()}<span className="text-hot-pink">XP</span></p>
            </div>
            <div className="w-12 h-12 bg-slate-800 p-1 border-2 border-white/10 overflow-hidden -rotate-3">
               <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`} className="w-full h-full" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'visao' && <VisaoView user={user} />}
            {activeTab === 'corre' && <CorreHub onSelect={setActiveMission} />}
            {activeTab === 'dossie' && <DossieView dossier={user.dossier} />}
            {activeTab === 'mural' && <MuralHub />}
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
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-8">
      <div className="p-10 card-street rounded-none border-l-[8px] border-l-hot-pink">
        <h1 className="archivo-bold text-6xl text-white mb-2">{user.name}</h1>
        <p className="mono text-cyan font-bold tracking-widest text-sm uppercase">Pai d'égua do Porto Digital // Nível 01</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(user.matrix).map(([key, val]) => (
          <div key={key} className="p-8 card-street relative group">
            <div className="absolute top-4 right-4 text-slate-800 group-hover:text-cyan transition-colors">
               <i className="fa-solid fa-bolt-lightning text-3xl"></i>
            </div>
            <p className="archivo-bold text-[10px] text-slate-500 mb-1">{key}</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black text-white mono">{(val * 10).toFixed(0)}</span>
              <span className="text-hot-pink font-bold text-xl">%</span>
            </div>
            <div className="h-3 w-full bg-black/50 border border-white/5">
              <div className="h-full bg-gradient-to-r from-hot-pink to-cyan shadow-[0_0_10px_rgba(0,242,255,0.5)]" style={{ width: `${val * 10}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="space-y-6">
       <div className="card-street p-8 bg-hot-pink text-black">
          <h3 className="archivo-bold text-xl mb-4 leading-none">Status do Sistema</h3>
          <ul className="mono text-xs space-y-3 font-bold">
             <li className="flex justify-between"><span>CPU:</span> <span>HACKING</span></li>
             <li className="flex justify-between"><span>MEM:</span> <span>98%</span></li>
             <li className="flex justify-between"><span>PORTA:</span> <span>RECIFE_PD</span></li>
          </ul>
       </div>
       <div className="card-street p-8">
          <h3 className="archivo-bold text-sm text-slate-500 mb-6">Últimas Atividades</h3>
          <div className="space-y-4">
             {[1,2].map(i => (
               <div key={i} className="flex gap-4 items-start border-l-2 border-slate-800 pl-4">
                  <div className="text-[10px] mono text-slate-600">02:45</div>
                  <div className="text-xs font-bold text-slate-300">Auditoria de Ativo concluída com sucesso.</div>
               </div>
             ))}
          </div>
       </div>
    </div>
  </div>
);

const CorreHub = ({ onSelect }: any) => (
  <div className="space-y-12">
    <div className="relative">
       <div className="absolute -top-4 -left-4 w-20 h-20 bg-cyan/10 blur-3xl rounded-full"></div>
       <h2 className="archivo-bold text-6xl text-white tracking-tighter">O CORRE <span className="text-hot-pink">NÃO PARA</span></h2>
       <p className="mono text-slate-500 text-sm mt-4 font-bold max-w-xl">
          Transforme seu talento em ativos reais auditados. Escolha seu caminho e suba o nível.
       </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {TRACKS.map(track => (
        <div 
          key={track.id} 
          onClick={() => onSelect(track.lessons[0])}
          className="card-street p-10 cursor-pointer group relative overflow-hidden flex flex-col justify-between h-[320px]"
        >
          <div className="absolute top-0 right-0 p-8 text-9xl text-white/[0.03] group-hover:text-hot-pink/5 transition-all">
            {track.icon}
          </div>
          <div className="z-10">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-16 h-16 bg-black flex items-center justify-center text-4xl border-2 border-slate-800 group-hover:border-cyan transition-all">
                  {track.icon}
               </div>
               <div>
                  <p className="mono text-[10px] text-hot-pink font-black uppercase">{track.lessons[0].category}</p>
                  <h3 className="archivo-bold text-2xl text-white group-hover:neon-text-cyan transition-all">{track.title}</h3>
               </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
               "{track.lessons[0].theory}"
            </p>
          </div>
          <button className="btn-brasa py-3 px-8 text-xs self-start group-hover:px-12 transition-all">
             Acessar Laboratório
          </button>
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
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
      <div className="w-full max-w-4xl card-street border-hot-pink/20 rounded-none flex flex-col min-h-[80vh] bg-[#020617] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-hot-pink via-cyan to-hot-pink animate-pulse"></div>
        
        <div className="p-8 border-b-2 border-black flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <span className="archivo-bold text-hot-pink text-xs tracking-widest">LAB::NA_VERA</span>
            <div className="h-4 w-px bg-slate-800"></div>
            <span className="mono text-[10px] text-slate-500 uppercase">{lesson.title}</span>
          </div>
          <button onClick={onClose} className="hover:text-hot-pink transition-colors"><i className="fa-solid fa-xmark text-2xl"></i></button>
        </div>

        <div className="flex-1 p-8 sm:p-12 space-y-12">
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <h1 className="archivo-bold text-6xl text-white leading-none italic">O QUE HÁ<br/><span className="text-cyan">POR TRÁS?</span></h1>
                <p className="text-slate-400 text-xl font-medium leading-relaxed italic border-l-4 border-hot-pink pl-6">
                  "{lesson.theory}"
                </p>
              </div>
              
              <div className="p-10 card-street bg-black/40 border-cyan/20">
                 <h5 className="archivo-bold text-xs text-cyan mb-6">OBJETIVO DO CORRE</h5>
                 <p className="text-2xl font-black text-white leading-tight">
                    {lesson.labPrompt}
                 </p>
              </div>

              <button onClick={() => setStep(2)} className="btn-brasa w-full py-6 text-lg">
                 ESTOU PRONTO
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center">
                <span className="mono text-[10px] text-cyan uppercase font-bold neon-text-cyan">Hackeando Ativo...</span>
                <span className="mono text-[10px] text-slate-600 font-bold">CHARS: {input.length}</span>
              </div>
              <textarea 
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="// Manda sua visão técnica aqui. Seja brabo."
                className="w-full h-[400px] bg-black border-2 border-slate-800 p-8 text-xl mono text-cyan focus:border-hot-pink outline-none transition-all shadow-inner"
              />
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="p-6 border-2 border-slate-800 archivo-bold text-[10px] tracking-widest text-slate-500">Voltar</button>
                <button 
                  disabled={!input || loading} 
                  onClick={handleAudit} 
                  className="flex-1 btn-brasa py-6 relative overflow-hidden"
                >
                  {loading ? 'AUDITANDO A RESPONSA...' : 'SUBMETER PRO PAPO RETO'}
                  {loading && <div className="scanline"></div>}
                </button>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="space-y-12 animate-in zoom-in-95 text-center">
              <div className="space-y-4">
                <p className="archivo-bold text-xs text-slate-500 tracking-widest">Score de Proficiência</p>
                <div className="text-[120px] font-black text-white italic archivo-bold leading-none flex items-center justify-center">
                  {result.score.toFixed(1)}<span className="text-hot-pink text-4xl">/10</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {Object.entries(result.rubrics || {}).map(([key, val]: any) => (
                  <div key={key} className="p-6 card-street border-white/5 text-center">
                    <p className="mono text-[9px] text-slate-500 uppercase mb-2 font-bold">{key}</p>
                    <p className="text-2xl font-black text-white mono">{val}%</p>
                  </div>
                ))}
              </div>

              <div className="p-10 card-street bg-white/5 border-hot-pink/30 text-left relative">
                <div className="absolute top-0 right-0 p-4 mono text-[8px] text-slate-700 italic">NODE_AUDITOR_V2</div>
                <h4 className="archivo-bold text-xs text-hot-pink mb-4">PAPO DO MENTOR:</h4>
                <p className="text-white text-2xl font-bold leading-tight italic">"{result.feedback}"</p>
              </div>

              <button onClick={onClose} className="btn-brasa w-full py-6 text-xl shadow-[0_10px_40px_rgba(255,0,122,0.4)]">
                 Arquivar no Dossiê
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DossieView = ({ dossier }: any) => (
  <div className="space-y-12 animate-in fade-in">
    <h2 className="archivo-bold text-5xl text-white tracking-tighter">DOSSIÊ DE <span className="text-cyan">RESPONSA</span></h2>
    <div className="grid grid-cols-1 gap-6">
       {dossier.map((item: any, i: number) => (
         <div key={i} className="card-street p-8 flex flex-col sm:flex-row justify-between items-center gap-6 group hover:border-hot-pink">
            <div className="flex items-center gap-8">
               <div className="archivo-bold text-7xl text-slate-800 group-hover:text-white transition-colors leading-none italic">{item.audit.score}</div>
               <div>
                  <h4 className="archivo-bold text-xl text-white">{item.lessonTitle}</h4>
                  <div className="flex gap-4 mt-2">
                    <span className="mono text-[10px] text-slate-600 font-bold uppercase">{item.date}</span>
                    <span className="mono text-[10px] text-cyan font-black uppercase tracking-widest">Validado</span>
                  </div>
               </div>
            </div>
            <button className="btn-brasa py-3 px-10 text-[10px]">Ver Detalhes</button>
         </div>
       ))}
       {dossier.length === 0 && (
         <div className="py-32 text-center card-street border-dashed border-slate-800">
            <p className="mono text-slate-700 font-bold">Sem dados no dossiê. Vá fazer o corre.</p>
         </div>
       )}
    </div>
  </div>
);

const MuralHub = () => (
  <div className="space-y-12">
    <h2 className="archivo-bold text-5xl text-white tracking-tighter">MURAL DE <span className="text-brasa">GIGS</span></h2>
    <div className="p-12 card-street bg-gradient-to-br from-brasa/20 to-transparent relative group overflow-hidden">
       <div className="absolute top-0 right-0 p-8 text-9xl text-brasa/5 group-hover:text-brasa/10 transition-all rotate-12">
          <i className="fa-solid fa-briefcase"></i>
       </div>
       <div className="relative z-10 space-y-8 max-w-xl">
          <div className="w-16 h-16 bg-brasa flex items-center justify-center text-white rotate-3 shadow-[4px_4px_0_white]">
             <i className="fa-solid fa-rocket text-2xl"></i>
          </div>
          <h3 className="archivo-bold text-4xl text-white leading-none">O Mercado do Porto tá de Olho.</h3>
          <p className="text-slate-400 text-lg leading-relaxed font-medium italic border-l-4 border-brasa pl-6">
             Seu dossiê auditado é o seu ticket. Empresas filtram talentos diretamente pela matriz de ativos do GUI.A. Mantenha a responsa.
          </p>
          <button className="btn-brasa py-5 px-12 text-[12px]">Explorar Gigs</button>
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
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-hot-pink/5 rounded-full blur-[120px]"></div>
      
      <div className="max-w-2xl w-full space-y-12 relative z-10 text-center">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-white rounded-none rotate-6 mx-auto flex items-center justify-center shadow-[8px_8px_0_#ff007a]">
             <span className="archivo-bold text-black text-6xl">G</span>
          </div>
          <h1 className="archivo-bold text-6xl text-white tracking-tighter italic">GUI.A <span className="text-cyan">STREET</span></h1>
          <p className="mono text-hot-pink font-black uppercase tracking-[0.4em] text-xs">Career Operating System v2.026</p>
        </div>

        <div className="card-street p-12 space-y-12">
          <div className="space-y-4">
             <p className="archivo-bold text-[10px] text-slate-500 tracking-widest">Protocolo de Identidade</p>
             <input 
              autoFocus
              value={name}
