
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Lesson, AuditResult } from './types.ts';
import { TRACKS } from './constants.tsx';

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'visao' | 'corre' | 'dossie' | 'manifesto'>('corre');
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
    const prompt = `[SYSTEM::AUDITOR_CORE_V2]
    CONTEXTO: Simulação de Carreira Real para jovens talentos de periferia.
    REQUISITO: Rigor técnico extremo. Não aceite respostas genéricas ou amadoras.
    ATIVO ANALISADO: ${lesson.title} (${lesson.category})
    ENTREGA DO TALENTO: "${delivery}"
    
    DIRETRIZ DE FEEDBACK:
    - Se a entrega for fraca: Rejeite e aponte a falha técnica com precisão.
    - Se for boa: Valide e mostre como chegar no nível "Sênior".
    - Linguagem: "Mentor de Quebrada" (Direto, calejado, técnico mas acessível).
    
    SAÍDA OBRIGATÓRIA EM JSON:
    {
      "score": número (0-10),
      "feedback": "O papo reto sobre o ativo...",
      "mentor": "NODE_AUDITOR_RECIFE",
      "rubrics": {
        "technical": número (0-100),
        "creativity": número (0-100),
        "impact": número (0-100)
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
      if (user && result.score >= 5) {
        const newMatrix = { ...user.matrix };
        newMatrix[lesson.competency] = Math.min(10, (newMatrix[lesson.competency] * 0.9) + (result.score * 0.1));
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
    } catch (e) { return null; }
  };

  if (!user) return <InitStreetSession onComplete={setUser} />;

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden selection:bg-hot-pink/40">
      {/* Sidebar Street Dock */}
      <aside className="w-20 lg:w-64 flex flex-col border-r-4 border-black bg-black/40 z-50">
        <div className="p-6 flex flex-col items-center lg:items-start gap-4">
          <div className="w-12 h-12 bg-hot-pink flex items-center justify-center rotate-3 shadow-[4px_4px_0_#00f2ff] mb-4">
            <span className="archivo-bold text-black text-2xl">G</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="archivo-bold text-sm tracking-tighter leading-none">GUI.A <br/><span className="text-cyan">STREET OS</span></h1>
            <p className="mono text-[8px] text-slate-500 mt-1 uppercase">Terminal de Carreira</p>
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
              className={`w-full flex items-center gap-4 p-4 transition-all group border-b-2 ${activeTab === item.id ? 'border-hot-pink bg-hot-pink/10 shadow-[inset_4px_0_0_#ff007a]' : 'border-transparent text-slate-500 hover:text-white'}`}
            >
              <i className={`fa-solid ${item.icon} text-xl w-6`}></i>
              <span className="hidden lg:block archivo-bold text-[10px] tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 lg:block hidden">
           <div className="p-4 border border-white/5 bg-black/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                 <span className="mono text-[9px] text-slate-500">REPUTAÇÃO</span>
                 <span className="mono text-[9px] text-hot-pink">RANK_01</span>
              </div>
              <div className="h-1 w-full bg-slate-900 overflow-hidden">
                 <div className="h-full bg-cyan" style={{ width: '45%' }}></div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 border-b-4 border-black flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
               <div className="w-2 h-2 bg-hot-pink rounded-full animate-pulse"></div>
               <div className="w-2 h-2 bg-cyan rounded-full"></div>
            </div>
            <h2 className="archivo-bold text-xl text-white italic neon-text-cyan">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
               <p className="archivo-bold text-[9px] text-slate-500 uppercase tracking-widest">Ativos Validados</p>
               <p className="text-xl font-black text-white mono">{user.dossier.length} <span className="text-hot-pink text-xs">UNITS</span></p>
            </div>
            <div className="w-12 h-12 bg-slate-900 border-2 border-white/10 p-1 -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
               <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`} className="w-full h-full" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
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
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-8">
      <div className="p-12 card-street bg-gradient-to-r from-hot-pink/10 to-transparent relative overflow-hidden">
        <div className="radar-bg absolute inset-0"></div>
        <div className="relative z-10">
          <h1 className="archivo-bold text-7xl text-white mb-2 leading-none">{user.name}</h1>
          <p className="mono text-cyan font-black tracking-widest text-sm uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan rounded-full"></span> Operador de Ativos // Node: Porto Digital
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(user.matrix).map(([key, val]) => (
          <div key={key} className="p-8 card-street border-white/5 relative group overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-9xl text-white/[0.02] group-hover:text-cyan/5 transition-all">
               <i className="fa-solid fa-microchip"></i>
            </div>
            <div className="relative z-10">
              <p className="archivo-bold text-[10px] text-slate-500 mb-1 tracking-[0.2em]">{key}</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-black text-white mono">{(val * 10).toFixed(0)}</span>
                <span className="text-hot-pink font-bold text-xl">%</span>
              </div>
              <div className="h-4 w-full bg-black/80 border border-white/10 p-1">
                <div className="h-full bg-gradient-to-r from-hot-pink to-cyan" style={{ width: `${val * 10}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="space-y-6">
       <div className="card-street p-8 border-brasa/20">
          <h3 className="archivo-bold text-xl mb-6 leading-none italic text-brasa">Status da Carreira</h3>
          <div className="space-y-6">
             <div>
                <p className="mono text-[10px] text-slate-500 mb-1">XP ACUMULADO</p>
                <p className="text-4xl font-black text-white mono">{user.exp.toLocaleString()}</p>
             </div>
             <div>
                <p className="mono text-[10px] text-slate-500 mb-1">PROX. NÍVEL</p>
                <div className="h-1 w-full bg-white/5 mt-2">
                   <div className="h-full bg-hot-pink" style={{ width: '40%' }}></div>
                </div>
             </div>
          </div>
       </div>
       <div className="card-street p-8 bg-black/60 border-white/5">
          <h3 className="archivo-bold text-sm text-slate-500 mb-6 uppercase tracking-widest">Logs de Auditoria</h3>
          <div className="space-y-4">
             {user.dossier.slice(0, 3).map((item, i) => (
               <div key={i} className="flex gap-4 items-start border-l-2 border-cyan/40 pl-4">
                  <div className="text-[9px] mono text-slate-600">{item.date}</div>
                  <div className="text-[11px] font-bold text-slate-300 leading-tight">{item.lessonTitle} auditado.</div>
               </div>
             ))}
             {user.dossier.length === 0 && <p className="mono text-[10px] text-slate-700 italic">Nenhum ativo validado ainda...</p>}
          </div>
       </div>
    </div>
  </div>
);

const CorreHub = ({ onSelect }: any) => (
  <div className="space-y-12">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
       <div className="space-y-2">
          <h2 className="archivo-bold text-7xl text-white tracking-tighter leading-none">O CORRE<br/><span className="text-hot-pink italic">VIRA ATIVO.</span></h2>
          <p className="mono text-slate-500 text-sm mt-4 font-bold max-w-xl border-l-4 border-cyan pl-6 uppercase">
            Transforme seu talento em capital técnico auditado. Sem validação, não há progresso.
          </p>
       </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {TRACKS.map(track => (
        <div 
          key={track.id} 
          onClick={() => onSelect(track.lessons[0])}
          className="card-street p-10 cursor-pointer group relative overflow-hidden flex flex-col justify-between h-[360px] border-white/5 bg-slate-900/20"
        >
          <div className="absolute top-0 right-0 p-8 text-[180px] text-white/[0.02] group-hover:text-cyan/5 transition-all -rotate-12 translate-x-12 translate-y-6">
            {track.icon}
          </div>
          <div className="z-10">
            <div className="flex items-center gap-6 mb-8">
               <div className="w-20 h-20 bg-black flex items-center justify-center text-5xl border-2 border-slate-800 group-hover:border-hot-pink transition-all shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                  {track.icon}
               </div>
               <div>
                  <p className="mono text-[11px] text-hot-pink font-black uppercase tracking-widest">{track.lessons[0].category}</p>
                  <h3 className="archivo-bold text-3xl text-white group-hover:neon-text-cyan transition-all">{track.title}</h3>
               </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-bold italic border-b-2 border-black pb-4 mb-4">
               "{track.lessons[0].theory}"
            </p>
          </div>
          <div className="flex justify-between items-center z-10">
             <span className="mono text-[10px] text-slate-600 font-bold uppercase">Nível: Médio</span>
             <button className="btn-brasa py-4 px-10 text-[11px] tracking-[0.2em] group-hover:px-14 transition-all">
                INICIAR OPERAÇÃO
             </button>
          </div>
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
      <div className="w-full max-w-5xl card-street border-hot-pink/20 rounded-none flex flex-col min-h-[90vh] bg-[#020617] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-hot-pink via-cyan to-hot-pink animate-pulse"></div>
        
        <div className="p-8 border-b-4 border-black flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-4">
            <span className="archivo-bold text-hot-pink text-sm tracking-[0.3em]">OPER::LAB_V2</span>
            <div className="h-6 w-px bg-slate-800"></div>
            <span className="mono text-[11px] text-slate-400 uppercase font-bold">{lesson.title}</span>
          </div>
          <button onClick={onClose} className="hover:text-hot-pink transition-colors text-slate-500"><i className="fa-solid fa-xmark text-3xl"></i></button>
        </div>

        <div className="flex-1 p-8 sm:p-16 space-y-12">
          {step === 1 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6">
              <div className="space-y-6">
                <h1 className="archivo-bold text-7xl text-white leading-none italic uppercase">HACKEANDO O<br/><span className="text-cyan">SISTEMA</span></h1>
                <p className="text-slate-300 text-2xl font-black leading-relaxed italic border-l-8 border-hot-pink pl-8">
                  "{lesson.theory}"
                </p>
              </div>
              
              <div className="p-12 card-street bg-black/60 border-cyan/10">
                 <h5 className="archivo-bold text-xs text-cyan mb-8 tracking-[0.4em]">MISSÃO DE VALIDAÇÃO</h5>
                 <p className="text-3xl font-black text-white leading-tight mono">
                    {lesson.labPrompt}
                 </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button onClick={onClose} className="px-12 py-6 border-4 border-black archivo-bold text-[12px] tracking-widest text-slate-600 hover:text-white transition-colors">Abortar</button>
                <button onClick={() => setStep(2)} className="flex-1 btn-brasa py-8 text-xl">
                   INICIAR ENTREGA TÉCNICA
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 bg-cyan rounded-full animate-ping"></div>
                   <span className="mono text-[11px] text-cyan uppercase font-black neon-text-cyan">Terminal Ativo::Aguardando Payload</span>
                </div>
                <span className="mono text-[11px] text-slate-600 font-bold">BYTES: {input.length}</span>
              </div>
              <textarea 
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="// Desenvolva sua entrega aqui. O Auditor não aceita mediocridade."
                className="flex-1 w-full min-h-[450px] bg-black border-4 border-slate-900 p-10 text-2xl mono text-cyan focus:border-hot-pink outline-none transition-all shadow-inner leading-relaxed"
              />
              <div className="flex gap-6">
                <button onClick={() => setStep(1)} className="p-8 border-4 border-black archivo-bold text-[11px] tracking-widest text-slate-600">Voltar</button>
                <button 
                  disabled={!input || loading} 
                  onClick={handleAudit} 
                  className="flex-1 btn-brasa py-8 text-xl relative overflow-hidden"
                >
                  {loading ? 'ANALISANDO RIGOR TÉCNICO...' : 'SUBMETER PARA AUDITORIA'}
                  {loading && <div className="scanline"></div>}
                </button>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="space-y-12 animate-in zoom-in-95 text-center max-w-3xl mx-auto">
              <div className="space-y-4">
                <p className="archivo-bold text-xs text-slate-500 tracking-[0.5em] uppercase">Status do Ativo</p>
                <div className={`text-[150px] font-black italic archivo-bold leading-none flex items-center justify-center ${result.score >= 5 ? 'text-white' : 'text-slate-800'}`}>
                  {result.score.toFixed(1)}<span className="text-hot-pink text-5xl">/10</span>
                </div>
                <div className="flex justify-center">
                   <div className={`px-8 py-2 border-2 archivo-bold text-xs ${result.score >= 5 ? 'border-cyan text-cyan' : 'border-slate-800 text-slate-700'}`}>
                      {result.score >= 5 ? 'ATIVO VALIDADO' : 'ATIVO REJEITADO'}
                   </div>
                </div>
              </div>

              <div className="p-12 card-street bg-white/5 border-hot-pink/30 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 mono text-[9px] text-slate-700 italic font-black">AUDIT_PROTOCOL_v2</div>
                <h4 className="archivo-bold text-sm text-hot-pink mb-6 tracking-widest italic">PAPO DO AUDITOR:</h4>
                <p className="text-white text-3xl font-black leading-tight italic mono">"{result.feedback}"</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {Object.entries(result.rubrics || {}).map(([key, val]: any) => (
                  <div key={key} className="p-6 card-street border-white/5 bg-black/40">
                    <p className="mono text-[10px] text-slate-600 uppercase mb-2 font-black tracking-tighter">{key}</p>
                    <p className="text-2xl font-black text-white mono">{val}%</p>
                  </div>
                ))}
              </div>

              <button onClick={onClose} className="btn-brasa w-full py-8 text-2xl shadow-[0_15px_60px_rgba(255,0,122,0.4)]">
                 {result.score >= 5 ? 'ARQUIVAR NO DOSSIÊ' : 'TENTAR NOVAMENTE'}
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
    <div className="space-y-4">
       <h2 className="archivo-bold text-7xl text-white tracking-tighter italic">DOSSIÊ DE<br/><span className="text-cyan">RESPONSA</span></h2>
       <p className="mono text-slate-600 text-xs font-bold uppercase tracking-widest">Seu capital técnico verificado pelo sistema.</p>
    </div>
    
    <div className="grid grid-cols-1 gap-6">
       {dossier.map((item: any, i: number) => (
         <div key={i} className="card-street p-10 flex flex-col sm:flex-row justify-between items-center gap-8 group hover:border-hot-pink border-white/5">
            <div className="flex items-center gap-10">
               <div className="archivo-bold text-8xl text-slate-900 group-hover:text-white transition-colors leading-none italic">{item.audit.score}</div>
               <div>
                  <h4 className="archivo-bold text-3xl text-white group-hover:text-cyan transition-colors">{item.lessonTitle}</h4>
                  <div className="flex gap-6 mt-4">
                    <span className="mono text-[11px] text-slate-500 font-black uppercase border-r border-slate-800 pr-6">Data: {item.date}</span>
                    <span className="mono text-[11px] text-hot-pink font-black uppercase tracking-widest">Status: Validado</span>
                  </div>
               </div>
            </div>
            <button className="btn-brasa py-4 px-12 text-[11px] tracking-widest">Abrir Relatório</button>
         </div>
       ))}
       {dossier.length === 0 && (
         <div className="py-40 text-center card-street border-dashed border-slate-800 flex flex-col items-center justify-center">
            <i className="fa-solid fa-folder-closed text-6xl text-slate-800 mb-6"></i>
            <p className="mono text-slate-700 font-black uppercase tracking-widest">Dossiê Vazio. Vá fazer o corre primeiro.</p>
         </div>
       )}
    </div>
  </div>
);

const ManifestoView = () => (
  <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in pb-20">
    <div className="text-center space-y-4">
       <div className="w-20 h-20 bg-hot-pink flex items-center justify-center mx-auto rotate-12 mb-8">
          <i className="fa-solid fa-fingerprint text-black text-4xl"></i>
       </div>
       <h2 className="archivo-bold text-7xl text-white tracking-tighter italic uppercase">Manifesto</h2>
       <p className="mono text-cyan font-black uppercase tracking-[0.4em] text-xs">A Regra do Jogo</p>
    </div>

    <div className="card-street p-12 space-y-10 border-white/10 bg-black/40 text-slate-200">
       <div className="space-y-4">
          <h3 className="archivo-bold text-2xl text-hot-pink italic">01. Não é um curso.</h3>
          <p className="text-xl font-bold italic leading-relaxed">Este é um Sistema Operacional para hackear a exclusão. Se você quer vídeos motivacionais, procure outro lugar. Aqui, o foco é a técnica calejada.</p>
       </div>
       <div className="space-y-4">
          <h3 className="archivo-bold text-2xl text-hot-pink italic">02. Rigor é respeito.</h3>
          <p className="text-xl font-bold italic leading-relaxed">O mercado não vai te dar "parabéns" por tentar. O mercado paga pela entrega. Nossa auditoria simula a pressão real para você chegar pronto.</p>
       </div>
       <div className="space-y-4">
          <h3 className="archivo-bold text-2xl text-hot-pink italic">03. Favela é Potência.</h3>
          <p className="text-xl font-bold italic leading-relaxed">Onde o sistema vê carência, nós ativamos ativos. Sua visão periférica é uma vantagem estratégica. Use-a.</p>
       </div>
       <div className="pt-8 border-t border-slate-800 text-center">
          <p className="mono text-[10px] text-slate-600 font-bold tracking-widest uppercase italic">Mobilidade Social via Alta Tecnologia // GUI.A Digital 2026</p>
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-hot-pink/5 rounded-full blur-[150px]"></div>
      <div className="radar-bg absolute inset-0"></div>
      
      <div className="max-w-2xl w-full space-y-12 relative z-10 text-center">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-white rounded-none rotate-6 mx-auto flex items-center justify-center shadow-[12px_12px_0_#ff007a]">
             <span className="archivo-bold text-black text-6xl">G</span>
          </div>
          <h1 className="archivo-bold text-8xl text-white tracking-tighter italic leading-none">GUI.A<br/><span className="text-cyan">STREET</span></h1>
          <p className="mono text-hot-pink font-black uppercase tracking-[0.6em] text-[10px] mt-4">Career Operating System v2.026</p>
        </div>

        <div className="card-street p-16 space-y-12 bg-black/80">
          <div className="space-y-4">
             <p className="archivo-bold text-[10px] text-slate-500 tracking-[0.5em] uppercase">Registrar Credencial</p>
             <input 
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="COMO TE CHAMAM?"
              className="w-full bg-transparent border-b-8 border-slate-900 py-6 text-center text-5xl font-black text-white outline-none focus:border-hot-pink transition-all placeholder:text-slate-900 mono italic uppercase"
            />
          </div>
          
          <button 
            disabled={!name || loading}
            onClick={handleStart}
            className="btn-brasa w-full py-10 text-2xl shadow-[0_10px_40px_rgba(255,77,0,0.4)]"
          >
            {loading ? 'HACKEANDO ACESSO...' : 'SUBIR PRO SISTEMA'}
          </button>
          
          <div className="flex justify-between items-center pt-8 border-t-2 border-slate-900">
             <span className="mono text-[9px] text-slate-700 italic font-black">NODE_REC_PD_01</span>
             <span className="mono text-[9px] text-slate-700 italic font-black">SECURE_AUTH_V2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
