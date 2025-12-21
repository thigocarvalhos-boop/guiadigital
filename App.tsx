
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MODULES as INITIAL_MODULES, OPPORTUNITIES, IA_TOOLS } from './constants.tsx';
import { Module, Lesson, Opportunity, UserProfile, IATool } from './types.ts';
import { GoogleGenAI } from "@google/genai";
import { connectTalentToBusiness } from './utils.ts';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const triggerVibration = (type: 'light' | 'success' | 'warning') => {
  if (!window.navigator.vibrate) return;
  const p = { light: 10, success: [10, 30, 10], warning: 100 };
  window.navigator.vibrate(p[type] as any);
};

// --- Componentes Reutilizáveis ---

const Toast = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const styles = {
    success: 'bg-emerald-500 text-slate-950',
    error: 'bg-rose-500 text-white',
    info: 'bg-cyan-500 text-slate-950'
  };
  return (
    <div className={`fixed top-12 left-6 right-6 z-[60000] p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in ${styles[type as keyof typeof styles] || styles.info}`}>
      <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center shrink-0">
        <i className="fa-solid fa-bolt-lightning text-sm"></i>
      </div>
      <p className="text-[11px] font-black uppercase tracking-widest leading-tight">{message}</p>
    </div>
  );
};

const Onboarding = ({ onComplete }: { onComplete: (p: UserProfile, xp: number, progress: any, applications: string[]) => void }) => {
  const [phase, setPhase] = useState<'manifesto' | 'auth' | 'fields'>('manifesto');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [form, setForm] = useState({ username: '', password: '', name: '', neighborhood: '', skill: '' });
  const [error, setError] = useState('');

  const handleAuth = () => {
    if (!form.username || !form.password) { setError('Preencha os campos'); return; }
    const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
    if (authMode === 'login') {
      const user = users[form.username];
      if (user && user.profile.password === form.password) {
        onComplete(user.profile, user.totalXP || 0, user.lessonProgress || {}, user.appliedJobs || []);
      } else { setError('Credenciais inválidas'); }
    } else {
      if (users[form.username]) { setError('Usuário já existe'); } else { setPhase('fields'); }
    }
  };

  const finish = () => {
    if (!form.name || !form.neighborhood || !form.skill) return;
    const profile: UserProfile = { ...form, level: 1, joinedAt: Date.now() };
    const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
    users[form.username] = { profile, totalXP: 0, lessonProgress: {}, appliedJobs: [] };
    localStorage.setItem('guia_users_db', JSON.stringify(users));
    onComplete(profile, 0, {}, []);
  };

  if (phase === 'manifesto') {
    return (
      <div className="fixed inset-0 z-[40000] bg-slate-950 flex flex-col p-10 justify-center animate-in">
        <div className="space-y-8 max-w-sm mx-auto">
          <div className="w-16 h-1.5 bg-cyan-600 rounded-full"></div>
          <h2 className="text-5xl font-black italic uppercase text-white leading-[0.85] tracking-tighter">Manifesto <br/><span className="text-cyan-600">Guia Digital</span></h2>
          <div className="space-y-6 text-slate-400 font-bold text-sm leading-relaxed terminal-text border-l-2 border-white/5 pl-6">
            <p>1. O Guia Digital é uma arma de mobilidade econômica.</p>
            <p>2. Transformamos talentos invisíveis em potências digitais.</p>
            <p>3. Do bairro para o mundo. Renda real, impacto local.</p>
          </div>
          <button onClick={() => setPhase('auth')} className="w-full py-5 bg-cyan-600 text-slate-950 font-black uppercase tracking-[0.2em] text-xs rounded-2xl active:scale-95 transition-all mt-6 shadow-[0_0_40px_rgba(34,211,238,0.3)]">Entrar no Sistema</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[40000] bg-slate-950 flex flex-col p-8 justify-center animate-in">
       <div className="max-w-sm mx-auto w-full space-y-8">
         <h2 className="text-3xl font-black uppercase text-white italic tracking-tighter">{phase === 'auth' ? 'Terminal de Acesso' : 'Identidade Social'}</h2>
         {error && <p className="text-rose-500 text-[10px] font-black uppercase bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>}
         
         {phase === 'auth' ? (
           <div className="space-y-4">
             <input className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl text-white text-sm outline-none focus:ring-2 ring-cyan-600 uppercase font-black" placeholder="USUÁRIO" value={form.username} onChange={e => setForm({...form, username: e.target.value.toLowerCase()})} />
             <input type="password" className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl text-white text-sm outline-none focus:ring-2 ring-cyan-600 uppercase font-black" placeholder="SENHA" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
             <button onClick={handleAuth} className="w-full py-5 bg-white text-black font-black uppercase text-xs rounded-2xl shadow-xl active:scale-95"> {authMode === 'signup' ? 'Iniciar Ativação' : 'Conectar'} </button>
             <button onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')} className="w-full text-center text-slate-500 font-black text-[9px] uppercase tracking-widest">{authMode === 'signup' ? 'Já sou cadastrado' : 'Criar nova conta'}</button>
           </div>
         ) : (
           <div className="space-y-4">
             <input className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl text-white text-sm outline-none uppercase font-black" placeholder="SEU NOME" value={form.name} onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} />
             <input className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl text-white text-sm outline-none uppercase font-black" placeholder="SEU BAIRRO" value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value.toUpperCase()})} />
             <div className="grid grid-cols-2 gap-3">
               {['DESIGN', 'VENDAS', 'SOCIAL', 'TECH'].map(s => (
                 <button key={s} onClick={() => setForm({...form, skill: s})} className={`py-4 rounded-xl text-[10px] font-black border-2 transition-all ${form.skill === s ? 'bg-cyan-600 border-cyan-400 text-black' : 'bg-slate-900 border-white/5 text-slate-500'}`}>{s}</button>
               ))}
             </div>
             <button onClick={finish} className="w-full py-5 bg-cyan-600 text-black font-black uppercase text-xs rounded-2xl shadow-xl active:scale-95 mt-4">Concluir Protocolo</button>
           </div>
         )}
       </div>
    </div>
  );
};

// --- Componente de Tool ---
const AIToolRunner = ({ tool, userProfile, onComplete }: { tool: IATool, userProfile: UserProfile, onComplete: (res: string) => void }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const runTool = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const ai = getAI();
      const prompt = tool.promptTemplate.replace('{business_type}', input).replace('{neighborhood}', userProfile.neighborhood).replace('{input}', input);
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      onComplete(response.text || 'Falha na resposta.');
    } catch (err) {
      onComplete('ERRO NO NÚCLEO: Verifique sua conexão.');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-3xl border border-white/5 space-y-6 shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 flex items-center justify-center text-xl text-cyan-500 border border-cyan-500/20"><i className={`fa-solid ${tool.icon}`}></i></div>
        <div>
          <h3 className="font-black uppercase text-xs tracking-widest leading-none">{tool.name}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Nível {tool.minLevel} Requerido</p>
        </div>
      </div>
      <textarea className="w-full bg-black border border-white/5 p-5 rounded-2xl text-xs text-white outline-none focus:ring-2 ring-cyan-600 min-h-[140px] font-medium leading-relaxed" placeholder="Descreva o negócio local para a IA processar..." value={input} onChange={e => setInput(e.target.value)} />
      <button disabled={loading} onClick={runTool} className="w-full py-5 bg-cyan-600 text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 transition-all">
        {loading ? <i className="fa-solid fa-circle-notch animate-spin text-lg"></i> : 'Processar Inteligência'}
      </button>
    </div>
  );
};

const App = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [xp, setXp] = useState(0);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [toast, setToast] = useState<{message: string, type: string} | null>(null);
  const [view, setView] = useState<'home' | 'jobs' | 'tools' | 'profile'>('home');
  const [activeTool, setActiveTool] = useState<IATool | null>(null);
  const [toolResult, setToolResult] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const showToast = (message: string, type: string = 'info') => {
    setToast({ message, type });
    triggerVibration(type === 'error' ? 'warning' : type === 'success' ? 'success' : 'light');
  };

  const completeLesson = (lessonId: string, mod: Module) => {
    if (progress[lessonId]) return;
    const newProgress = { ...progress, [lessonId]: true };
    setProgress(newProgress);
    const lesson = mod.lessons.find(l => l.id === lessonId);
    if (lesson) setXp(prev => prev + lesson.xpValue);
    showToast("Skill Validada! +" + (lesson?.xpValue || 0) + " XP", "success");
  };

  const handleApplication = (id: string) => {
    if (appliedJobs.includes(id)) return;
    setAppliedJobs([...appliedJobs, id]);
    setXp(prev => prev + 250);
    showToast('Candidatura Ativa! Impacto Social +250 XP', 'success');
  };

  const opportunitiesWithMatch = useMemo(() => {
    const portfolio = Object.keys(progress).map(id => ({ id, title: '', description: '', category: 'edu' }));
    return connectTalentToBusiness(portfolio, OPPORTUNITIES);
  }, [progress]);

  useEffect(() => {
    const currentUser = localStorage.getItem('guia_current_user');
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
      const data = users[currentUser];
      if (data) { setProfile(data.profile); setXp(data.totalXP || 0); setProgress(data.lessonProgress || {}); setAppliedJobs(data.appliedJobs || []); }
    }
  }, []);

  useEffect(() => {
    if (profile) {
      const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
      users[profile.username] = { profile, totalXP: xp, lessonProgress: progress, appliedJobs };
      localStorage.setItem('guia_users_db', JSON.stringify(users));
      localStorage.setItem('guia_current_user', profile.username);
    }
  }, [profile, xp, progress, appliedJobs]);

  if (!profile) return <Onboarding onComplete={(p, x, pr, a) => { setProfile(p); setXp(x); setProgress(pr); setAppliedJobs(a); }} />;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header Fixo */}
      <header className="px-6 py-8 flex justify-between items-end border-b border-white/5 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50">
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Guia <span className="text-cyan-600">Digital</span></h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">{profile.neighborhood}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm font-black text-cyan-500 italic leading-none">{xp} <span className="text-[9px] opacity-40">XP</span></div>
          <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-1">Rank Social</div>
        </div>
      </header>

      <main className="flex-1 px-6 pt-10 pb-40 max-w-2xl mx-auto w-full space-y-12">
        {view === 'home' && !selectedModule && (
          <div className="space-y-10 animate-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-cyan-600 p-8 rounded-[40px] text-black flex flex-col justify-between shadow-2xl active:scale-95 transition-all" onClick={() => setView('tools')}>
                <i className="fa-solid fa-microchip text-3xl"></i>
                <p className="font-black uppercase text-[11px] leading-tight tracking-widest">Arsenal <br/>IA Ativo</p>
              </div>
              <div className="aspect-square bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col justify-between active:scale-95 transition-all" onClick={() => setView('jobs')}>
                <i className="fa-solid fa-briefcase text-3xl text-cyan-600"></i>
                <p className="font-black uppercase text-[11px] leading-tight tracking-widest">Mural de <br/>Impacto</p>
              </div>
            </div>

            <section className="space-y-6">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Trilhas de <span className="text-cyan-600">Ativação</span></h2>
              <div className="space-y-4">
                {INITIAL_MODULES.map(module => {
                  const doneCount = module.lessons.filter(l => progress[l.id]).length;
                  const totalCount = module.lessons.length;
                  const isLocked = module.id !== '1' && !INITIAL_MODULES.find(m => m.id === (parseInt(module.id)-1).toString())?.lessons.every(l => progress[l.id]);
                  
                  return (
                    <div key={module.id} onClick={() => !isLocked && setSelectedModule(module)} className={`p-8 rounded-[32px] border transition-all ${isLocked ? 'opacity-30 grayscale' : 'bg-white/5 border-white/10 active:scale-[0.98] active:bg-white/10'}`}>
                      <div className="flex justify-between items-start mb-6">
                         <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-2xl text-cyan-600"><i className={`fa-solid ${module.icon}`}></i></div>
                         <div className="text-right">
                           <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block mb-1">{module.technicalSkill}</span>
                           <span className="text-lg font-black italic">{Math.floor((doneCount/totalCount)*100)}%</span>
                         </div>
                      </div>
                      <h3 className="text-lg font-black uppercase italic tracking-tight mb-2">{module.title}</h3>
                      <p className="text-[10px] text-slate-500 font-bold leading-tight">{module.description}</p>
                      <div className="mt-6 h-1.5 bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-600 transition-all duration-700" style={{ width: `${(doneCount/totalCount)*100}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {selectedModule && (
          <div className="animate-in space-y-10">
             <button onClick={() => setSelectedModule(null)} className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><i className="fa-solid fa-arrow-left text-[8px]"></i> Voltar ao Dashboard</button>
             <div className="space-y-2">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{selectedModule.title}</h2>
                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">{selectedModule.technicalSkill} Expert</span>
             </div>
             <div className="space-y-5">
               {selectedModule.lessons.map((lesson, idx) => (
                 <div key={lesson.id} className={`p-8 rounded-[32px] border transition-all ${progress[lesson.id] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-center mb-4">
                       <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${progress[lesson.id] ? 'text-emerald-500' : 'text-cyan-600'}`}>Missão 0{idx+1}</span>
                       {progress[lesson.id] && <i className="fa-solid fa-circle-check text-emerald-500"></i>}
                    </div>
                    <h4 className="text-xl font-black uppercase italic leading-tight mb-4">{lesson.title}</h4>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6">{lesson.content}</p>
                    <div className="space-y-3 mb-8">
                       {lesson.checklist.map((item, i) => (
                         <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                            <div className="w-5 h-5 rounded-lg border border-white/10 flex items-center justify-center"><i className={`fa-solid fa-check text-[8px] ${progress[lesson.id] ? 'text-emerald-500' : 'text-slate-700'}`}></i></div>
                            {item}
                         </div>
                       ))}
                    </div>
                    {!progress[lesson.id] && (
                      <button onClick={() => completeLesson(lesson.id, selectedModule)} className="w-full py-5 bg-cyan-600 text-black font-black uppercase text-xs tracking-widest rounded-2xl active:scale-95 shadow-xl">Finalizar Missão</button>
                    )}
                 </div>
               ))}
             </div>
          </div>
        )}

        {view === 'tools' && (
          <div className="animate-in space-y-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Arsenal de <span className="text-cyan-600">Trabalho</span></h2>
            {activeTool ? (
              <div className="space-y-6">
                <button onClick={() => { setActiveTool(null); setToolResult(null); }} className="text-[10px] font-black uppercase text-slate-500"><i className="fa-solid fa-arrow-left"></i> Voltar ferramentas</button>
                <AIToolRunner tool={activeTool} userProfile={profile} onComplete={setToolResult} />
                {toolResult && (
                  <div className="bg-slate-900 p-8 rounded-3xl border border-cyan-500/20 animate-in">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-600">Resposta Gerada</span>
                      <button onClick={() => { navigator.clipboard.writeText(toolResult); showToast("Copiado!", "success"); }} className="text-slate-500 hover:text-white"><i className="fa-solid fa-copy"></i></button>
                    </div>
                    <div className="text-sm font-bold leading-relaxed text-slate-300 whitespace-pre-wrap">{toolResult}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-5">
                {IA_TOOLS.map(tool => (
                  <button key={tool.id} onClick={() => setActiveTool(tool)} className="p-8 rounded-[36px] bg-white/5 border border-white/10 text-left flex items-center gap-6 active:scale-[0.98] transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-3xl text-cyan-600"><i className={`fa-solid ${tool.icon}`}></i></div>
                    <div>
                      <h3 className="font-black uppercase text-sm tracking-widest mb-1">{tool.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold leading-tight">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'jobs' && (
          <div className="animate-in space-y-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Mural de <span className="text-cyan-600">Impacto</span></h2>
            <div className="space-y-5">
              {opportunitiesWithMatch.map(opp => (
                <div key={opp.id} className="bg-white/5 p-8 rounded-[40px] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><i className="fa-solid fa-briefcase text-6xl"></i></div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest leading-none block mb-2">{opp.businessName}</span>
                      <h4 className="text-xl font-black uppercase italic tracking-tighter leading-none">{opp.title}</h4>
                      <div className="flex gap-4 mt-3">
                         <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{opp.reward}</span>
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">• {opp.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-xl font-black text-cyan-500 leading-none">{opp.matchingScore}%</span>
                       <span className="text-[8px] font-black text-slate-600 uppercase block tracking-widest mt-1">Match</span>
                    </div>
                  </div>
                  <button onClick={() => handleApplication(opp.id)} disabled={appliedJobs.includes(opp.id)} className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${appliedJobs.includes(opp.id) ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white text-black shadow-2xl active:scale-95'}`}>
                    {appliedJobs.includes(opp.id) ? 'Proposta Enviada' : 'Iniciar Consultoria'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="animate-in space-y-10">
             <div className="text-center space-y-4 pt-10">
                <div className="w-40 h-40 bg-slate-900 rounded-[56px] mx-auto flex items-center justify-center border-4 border-cyan-600 shadow-2xl relative">
                   <div className="absolute -top-4 -right-4 w-14 h-14 bg-cyan-600 rounded-full flex items-center justify-center text-black font-black text-sm border-4 border-slate-950">LV.{Math.floor(xp/1000) + 1}</div>
                   <i className="fa-solid fa-user-ninja text-6xl opacity-20"></i>
                </div>
                <div>
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{profile.name}</h3>
                   <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.4em] mt-3 opacity-60">{profile.neighborhood}</p>
                </div>
             </div>
             
             <div className="bg-white/5 rounded-[48px] p-10 border border-white/10 space-y-8 shadow-2xl">
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      <span>Progresso Social</span>
                      <span className="text-cyan-500">{xp} XP</span>
                   </div>
                   <div className="h-2.5 bg-black rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-cyan-600 shadow-[0_0_20px_#22d3ee] transition-all duration-1000" style={{ width: `${(xp % 1000) / 10}%` }}></div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-6 rounded-3xl text-center border border-white/5">
                    <p className="text-2xl font-black leading-none mb-2">{Object.keys(progress).length}</p>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Skills</p>
                  </div>
                  <div className="bg-black/40 p-6 rounded-3xl text-center border border-white/5">
                    <p className="text-2xl font-black text-emerald-500 leading-none mb-2">{appliedJobs.length}</p>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Trabalhos</p>
                  </div>
                </div>
             </div>

             <button onClick={() => { localStorage.removeItem('guia_current_user'); window.location.reload(); }} className="w-full py-5 text-rose-500 font-black uppercase text-[10px] tracking-widest border-2 border-rose-500/10 rounded-3xl hover:bg-rose-500/5 transition-all">Encerrar Sessão</button>
          </div>
        )}
      </main>

      {/* Navegação Principal Otimizada para Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 p-6 z-[1000] pointer-events-none">
        <div className="max-w-md mx-auto h-24 rounded-[48px] flex justify-around items-center px-6 glass-panel pointer-events-auto shadow-[0_-20px_60px_rgba(0,0,0,0.8)] border-t border-white/10">
          {[
            { id: 'home', icon: 'fa-graduation-cap', label: 'TRILHAS' },
            { id: 'tools', icon: 'fa-bolt-lightning', label: 'ARSENAL' },
            { id: 'jobs', icon: 'fa-briefcase', label: 'MURAL' },
            { id: 'profile', icon: 'fa-id-card-clip', label: 'PERFIL' }
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id as any); setSelectedModule(null); triggerVibration('light'); }} className={`nav-button flex flex-col items-center justify-center gap-2 transition-all active:scale-90 ${view === item.id ? 'text-cyan-500 scale-110' : 'text-slate-600 hover:text-slate-400'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${view === item.id ? 'bg-cyan-600/10 border border-cyan-500/20' : ''}`}>
                <i className={`fa-solid ${item.icon} text-xl`}></i>
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${view === item.id ? 'opacity-100' : 'opacity-40'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Overlay de Loading Social */}
      {false && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-[100000] flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-600 animate-pulse">Sincronizando Impacto</p>
        </div>
      )}
    </div>
  );
};

export default App;
