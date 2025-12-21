
import React, { useState, useEffect, useMemo } from 'react';
import { MODULES as INITIAL_MODULES, OPPORTUNITIES, IA_TOOLS } from './constants.tsx';
import { Module, Lesson, Opportunity, UserProfile, IATool } from './types.ts';
import { GoogleGenAI } from "@google/genai";
import { connectTalentToBusiness } from './utils.ts';

const triggerVibration = (type: 'light' | 'success' | 'warning') => {
  if (!window.navigator.vibrate) return;
  const p = { light: 10, success: [10, 30, 10], warning: 100 };
  window.navigator.vibrate(p[type] as any);
};

// --- Componentes ---

const Toast = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const styles = {
    success: 'bg-emerald-500 text-slate-950',
    error: 'bg-rose-500 text-white',
    info: 'bg-cyan-500 text-slate-950'
  };
  return (
    <div className={`fixed top-12 left-6 right-6 z-[80000] p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in ${styles[type as keyof typeof styles] || styles.info}`}>
      <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center shrink-0">
        <i className="fa-solid fa-bolt-lightning text-sm"></i>
      </div>
      <p className="text-[11px] font-black uppercase tracking-widest leading-tight">{message}</p>
    </div>
  );
};

const LessonView = ({ lesson, onComplete, onBack }: { lesson: Lesson, onComplete: () => void, onBack: () => void }) => {
  const [step, setStep] = useState<'theory' | 'challenge' | 'quiz' | 'success'>('theory');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizError, setQuizError] = useState(false);

  const handleQuizSubmit = () => {
    if (selectedOption === lesson.quiz.correctIndex) {
      setStep('success');
      triggerVibration('success');
    } else {
      setQuizError(true);
      triggerVibration('warning');
      setTimeout(() => setQuizError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[60000] bg-slate-950 flex flex-col animate-in overflow-hidden">
      <div className="px-6 py-4 flex items-center gap-2 border-b border-white/5 bg-slate-950">
        <button onClick={onBack} className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 active:bg-white/5">
          <i className="fa-solid fa-chevron-left text-xl"></i>
        </button>
        <div className="flex-1 flex gap-1.5 px-4">
          {['theory', 'challenge', 'quiz', 'success'].map((s, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              (['theory', 'challenge', 'quiz', 'success'].indexOf(step) >= i) ? 'bg-cyan-500 shadow-[0_0_15px_#22d3ee]' : 'bg-white/10'
            }`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pb-40">
        {step === 'theory' && (
          <div className="space-y-8 animate-in">
            <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.4em]">Fase 01: Estudo Teórico</span>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-[0.9]">{lesson.title}</h2>
            <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl">
              <p className="text-base font-bold leading-relaxed text-slate-200 italic">{lesson.theory}</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-list-check"></i> Checklist da apostila
              </h4>
              {lesson.checklist.map((c, i) => (
                <div key={i} className="flex items-center gap-4 text-xs font-bold text-slate-400 bg-black/40 p-4 rounded-2xl">
                  <i className="fa-solid fa-circle-check text-cyan-600"></i> {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'challenge' && (
          <div className="space-y-8 animate-in h-full flex flex-col justify-center">
            <div className="text-center space-y-4">
               <div className="w-24 h-24 rounded-[32px] bg-amber-500/10 border-2 border-amber-500/20 mx-auto flex items-center justify-center text-4xl text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                 <i className="fa-solid fa-person-running"></i>
               </div>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter">Missão de Campo</h2>
            </div>
            <div className="bg-amber-500/5 border-2 border-amber-500/10 p-10 rounded-[48px] shadow-2xl">
               <p className="text-xl font-black text-white italic leading-tight text-center">{lesson.challenge}</p>
            </div>
            <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest px-6 leading-relaxed">Não pule esta etapa. O aprendizado real acontece na prática social.</p>
          </div>
        )}

        {step === 'quiz' && (
          <div className="space-y-10 animate-in">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Fase 03: Validação Técnica</span>
            <div className="bg-white/5 p-8 rounded-[40px] border border-white/10">
              <p className="text-lg font-bold text-white mb-10 leading-tight">{lesson.quiz.question}</p>
              <div className="space-y-4">
                {lesson.quiz.options.map((opt, i) => (
                  <button key={i} onClick={() => setSelectedOption(i)}
                    className={`w-full p-6 rounded-3xl border-2 text-left font-black text-sm transition-all active:scale-95 ${
                      selectedOption === i ? 'bg-cyan-600 border-cyan-400 text-slate-950 shadow-xl' : 'bg-black border-white/5 text-slate-500'
                    }`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            {quizError && <p className="text-center text-rose-500 font-black uppercase text-[10px] animate-pulse">Resposta incorreta. Revise a apostila!</p>}
          </div>
        )}

        {step === 'success' && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-10 animate-in">
            <div className="w-40 h-40 rounded-[56px] bg-emerald-500 flex items-center justify-center text-6xl text-slate-950 shadow-[0_0_80px_rgba(16,185,129,0.5)] animate-bounce">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Skill <br/><span className="text-emerald-500">Validada!</span></h2>
              <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[280px] mx-auto">{lesson.quiz.explanation}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-slate-950/90 backdrop-blur-2xl border-t border-white/5">
        {step === 'theory' && <button onClick={() => setStep('challenge')} className="w-full py-6 bg-white text-black font-black uppercase text-xs tracking-widest rounded-[32px] shadow-2xl active:scale-95 transition-all">Aceitar Missão</button>}
        {step === 'challenge' && <button onClick={() => setStep('quiz')} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-xs tracking-widest rounded-[32px] shadow-2xl active:scale-95 transition-all">Fazer o Quiz</button>}
        {step === 'quiz' && <button disabled={selectedOption === null} onClick={handleQuizSubmit} className="w-full py-6 bg-white text-black font-black uppercase text-xs tracking-widest rounded-[32px] shadow-2xl active:scale-95 disabled:opacity-20 transition-all">Validar Resposta</button>}
        {step === 'success' && <button onClick={onComplete} className="w-full py-6 bg-emerald-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-[32px] shadow-2xl active:scale-95 transition-all">Continuar Trilha</button>}
      </div>
    </div>
  );
};

// --- Componente Onboarding (Com Manifesto e Trava de Matrícula) ---

const Onboarding = ({ onComplete }: { onComplete: (p: UserProfile, xp: number, progress: any, applications: string[]) => void }) => {
  const [phase, setPhase] = useState<'manifesto' | 'auth' | 'fields' | 'pending'>('manifesto');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [form, setForm] = useState({ username: '', password: '', name: '', neighborhood: '', skill: '' });
  const [error, setError] = useState('');

  const handleAuth = () => {
    if (!form.username || !form.password) { setError('Preencha os campos'); return; }
    const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
    
    if (authMode === 'login') {
      const user = users[form.username];
      if (user && user.profile.password === form.password) {
        if (user.profile.status === 'pending') {
          setPhase('pending');
        } else {
          onComplete(user.profile, user.totalXP || 0, user.lessonProgress || {}, user.appliedJobs || []);
        }
      } else { setError('Usuário não encontrado ou senha incorreta'); }
    } else {
      if (users[form.username]) { setError('Usuário já registrado'); } else { setPhase('fields'); }
    }
  };

  const finish = () => {
    if (!form.name || !form.neighborhood || !form.skill) return;
    const profile: UserProfile = { ...form, level: 1, joinedAt: Date.now(), status: 'pending' };
    
    const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
    users[form.username] = { profile, totalXP: 0, lessonProgress: {}, appliedJobs: [] };
    localStorage.setItem('guia_users_db', JSON.stringify(users));
    
    // Simulação de envio de email
    console.log(`ENVIANDO CADASTRO PARA institutoguiasocial@gmail.com:`, profile);
    setPhase('pending');
  };

  if (phase === 'manifesto') {
    return (
      <div className="fixed inset-0 z-[70000] bg-slate-950 flex flex-col p-10 justify-center animate-in overflow-y-auto">
        <div className="space-y-12 max-w-sm mx-auto">
          <div className="w-20 h-2 bg-cyan-600 rounded-full shadow-[0_0_20px_#22d3ee]"></div>
          <h2 className="text-6xl font-black italic uppercase text-white leading-[0.8] tracking-tighter">MANIFESTO <br/><span className="text-cyan-600">GUIA SOCIAL</span></h2>
          <div className="space-y-6 text-slate-400 font-bold text-sm leading-relaxed border-l-4 border-white/5 pl-8 italic">
            <p>1. O Guia Digital é uma arma de mobilidade econômica para jovens de periferia.</p>
            <p>2. Transformamos talentos invisíveis em potências digitais reais.</p>
            <p>3. Do bairro para o mundo. O seu futuro começa na sua matrícula.</p>
          </div>
          <button onClick={() => setPhase('auth')} className="w-full py-6 bg-cyan-600 text-slate-950 font-black uppercase tracking-[0.3em] text-[10px] rounded-3xl active:scale-95 shadow-xl transition-all">Conectar ao Sistema</button>
        </div>
      </div>
    );
  }

  if (phase === 'pending') {
    return (
      <div className="fixed inset-0 z-[70000] bg-slate-950 flex flex-col p-10 justify-center animate-in text-center">
        <div className="space-y-8 max-w-sm mx-auto">
          <div className="w-24 h-24 rounded-full bg-cyan-600/10 border-2 border-cyan-500/20 mx-auto flex items-center justify-center text-4xl text-cyan-500 animate-pulse">
            <i className="fa-solid fa-hourglass-half"></i>
          </div>
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">Matrícula em <br/>Validação</h2>
          <p className="text-slate-400 font-bold text-sm leading-relaxed px-4">
            Seus dados foram enviados para <span className="text-cyan-500">institutoguiasocial@gmail.com</span>. 
            Aguarde a liberação do administrador presencial para acessar o curso completo.
          </p>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
             <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Protocolo de Segurança:</p>
             <p className="text-[9px] font-mono text-cyan-600/60 break-all uppercase tracking-widest">{form.username || 'USUARIO_PENDENTE'}</p>
          </div>
          <button onClick={() => setPhase('auth')} className="text-[10px] font-black uppercase text-slate-600 underline">Voltar para Login</button>
          
          {/* BOTÃO SECRETO PARA VOCÊ TESTAR O APP AGORA - REmover em produção real */}
          <button 
            onClick={() => {
              const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
              if (users[form.username]) {
                users[form.username].profile.status = 'active';
                localStorage.setItem('guia_users_db', JSON.stringify(users));
                onComplete(users[form.username].profile, 0, {}, []);
              }
            }} 
            className="mt-10 opacity-0 active:opacity-20 text-[8px] uppercase font-black"
          >
            [Dev: Forçar Ativação]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70000] bg-slate-950 flex flex-col p-8 justify-center animate-in">
       <div className="max-w-sm mx-auto w-full space-y-8">
         <h2 className="text-3xl font-black uppercase text-white italic tracking-tighter">{phase === 'auth' ? 'Terminal de Acesso' : 'Identidade Social'}</h2>
         {error && <p className="text-rose-500 text-[10px] font-black uppercase bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}
         {phase === 'auth' ? (
           <div className="space-y-4">
             <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none focus:border-cyan-600 uppercase font-black" placeholder="USUÁRIO" value={form.username} onChange={e => setForm({...form, username: e.target.value.toLowerCase()})} />
             <input type="password" className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none focus:border-cyan-600 uppercase font-black" placeholder="SENHA" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
             <button onClick={handleAuth} className="w-full py-6 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-2xl"> {authMode === 'signup' ? 'Iniciar Formação' : 'Conectar'} </button>
             <button onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')} className="w-full text-center text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] mt-2">{authMode === 'signup' ? 'Já sou matriculado' : 'Fazer Nova Matrícula'}</button>
           </div>
         ) : (
           <div className="space-y-4">
             <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none uppercase font-black" placeholder="NOME COMPLETO" value={form.name} onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} />
             <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none uppercase font-black" placeholder="BAIRRO" value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value.toUpperCase()})} />
             <div className="grid grid-cols-2 gap-3">
               {['DESIGN', 'VENDAS', 'SOCIAL', 'TECH'].map(s => (
                 <button key={s} onClick={() => setForm({...form, skill: s})} className={`py-5 rounded-2xl text-[10px] font-black border-2 transition-all ${form.skill === s ? 'bg-cyan-600 border-cyan-400 text-black' : 'bg-slate-900 border-white/5 text-slate-600'}`}>{s}</button>
               ))}
             </div>
             <button onClick={finish} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-2xl mt-4">Confirmar Matrícula</button>
           </div>
         )}
       </div>
    </div>
  );
};

const AIToolRunner = ({ tool, userProfile, onComplete }: { tool: IATool, userProfile: UserProfile, onComplete: (res: string) => void }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const runTool = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = tool.promptTemplate
        .replace('{business_type}', input)
        .replace('{neighborhood}', userProfile.neighborhood)
        .replace('{input}', input);

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite-latest',
        contents: prompt,
        config: { temperature: 0.7 }
      });
      
      onComplete(result.text || "Sem resposta da IA.");
    } catch (err) {
      console.error(err);
      onComplete("ERRO NO SISTEMA: Verifique sua conexão ou tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-[40px] border border-white/5 space-y-6 shadow-2xl animate-in">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 flex items-center justify-center text-2xl text-cyan-500 border border-cyan-500/20"><i className={`fa-solid ${tool.icon}`}></i></div>
        <div>
          <h3 className="font-black uppercase text-xs tracking-widest leading-none">{tool.name}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 italic">Protocolo {tool.id}</p>
        </div>
      </div>
      <textarea 
        className="w-full bg-black border-2 border-white/5 p-6 rounded-3xl text-sm text-white outline-none focus:border-cyan-600 min-h-[160px] font-bold" 
        placeholder="O que você precisa que a IA execute hoje?" 
        value={input} 
        onChange={e => setInput(e.target.value)} 
      />
      <button disabled={loading || !input} onClick={runTool} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-xs tracking-[0.2em] rounded-3xl disabled:opacity-20 active:scale-95 transition-all shadow-[0_0_40px_rgba(34,211,238,0.3)]">
        {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'ATIVAR INTELIGÊNCIA'}
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
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTool, setActiveTool] = useState<IATool | null>(null);
  const [toolResult, setToolResult] = useState<string | null>(null);

  const showToast = (message: string, type: string = 'info') => {
    setToast({ message, type });
    triggerVibration(type === 'error' ? 'warning' : type === 'success' ? 'success' : 'light');
  };

  const handleCompleteLesson = () => {
    if (!activeLesson) return;
    const newProgress = { ...progress, [activeLesson.id]: true };
    setProgress(newProgress);
    setXp(prev => prev + activeLesson.xpValue);
    setActiveLesson(null);
    showToast(`Expertise Validada: ${activeLesson.title}`, 'success');
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
      if (data && data.profile.status === 'active') { 
        setProfile(data.profile); 
        setXp(data.totalXP || 0); 
        setProgress(data.lessonProgress || {}); 
        setAppliedJobs(data.appliedJobs || []); 
      }
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
      {activeLesson && <LessonView lesson={activeLesson} onBack={() => setActiveLesson(null)} onComplete={handleCompleteLesson} />}

      <header className="px-8 py-10 flex justify-between items-end border-b border-white/5 sticky top-0 bg-slate-950/90 backdrop-blur-2xl z-50">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-[0.85]">GUIA <span className="text-cyan-600">DIGITAL</span></h1>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] mt-2">{profile.neighborhood}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-base font-black text-cyan-500 italic leading-none">{xp} <span className="text-[9px] opacity-40 uppercase not-italic">XP</span></div>
          <div className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-1 italic">Nível Social</div>
        </div>
      </header>

      <main className="flex-1 px-6 pt-10 pb-48 max-w-2xl mx-auto w-full space-y-12">
        {view === 'home' && !selectedModule && (
          <div className="space-y-12 animate-in">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Trilhas de <span className="text-cyan-600">Formação</span></h2>
            <div className="space-y-6">
              {INITIAL_MODULES.map(module => {
                const doneCount = module.lessons.filter(l => progress[l.id]).length;
                const totalCount = module.lessons.length;
                const isLocked = module.id !== '1' && !INITIAL_MODULES.find(m => m.id === (parseInt(module.id)-1).toString())?.lessons.every(l => progress[l.id]);
                return (
                  <div key={module.id} onClick={() => !isLocked && setSelectedModule(module)} className={`p-8 rounded-[48px] border-2 transition-all relative overflow-hidden ${isLocked ? 'opacity-20 grayscale cursor-not-allowed' : 'bg-white/5 border-white/5 active:scale-[0.98] shadow-2xl'}`}>
                    <div className="flex justify-between items-start mb-8">
                       <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl ${isLocked ? 'bg-slate-900 text-slate-700' : 'bg-cyan-600/10 text-cyan-600'}`}><i className={`fa-solid ${module.icon}`}></i></div>
                       <div className="text-right">
                         <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block mb-1">{module.technicalSkill}</span>
                         <span className="text-2xl font-black italic">{Math.floor((doneCount/totalCount)*100)}%</span>
                       </div>
                    </div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">{module.title}</h3>
                    <p className="text-[11px] text-slate-500 font-bold leading-tight mb-6">{module.description}</p>
                    <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-cyan-600 shadow-[0_0_15px_#22d3ee] transition-all duration-1000" style={{ width: `${(doneCount/totalCount)*100}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedModule && (
          <div className="animate-in space-y-12">
             <button onClick={() => setSelectedModule(null)} className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full"><i className="fa-solid fa-arrow-left"></i> Dashboard</button>
             <div className="space-y-4">
                <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-[0.8]">{selectedModule.title}</h2>
                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.3em]">Formação Especialista</span>
             </div>
             <div className="space-y-5">
               {selectedModule.lessons.map((lesson, idx) => (
                 <div key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`p-8 rounded-[40px] border-2 transition-all active:scale-95 ${progress[lesson.id] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-center mb-6">
                       <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${progress[lesson.id] ? 'text-emerald-500' : 'text-cyan-600'}`}>Unidade 0{idx+1}</span>
                       {progress[lesson.id] && <i className="fa-solid fa-circle-check text-emerald-500 text-xl"></i>}
                    </div>
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-6">{lesson.title}</h4>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase bg-black/40 px-3 py-1.5 rounded-full"><i className="fa-regular fa-clock"></i> {lesson.duration}</div>
                       <div className="flex items-center gap-2 text-[9px] font-black text-cyan-600 uppercase bg-cyan-600/10 px-3 py-1.5 rounded-full border border-cyan-500/20">+{lesson.xpValue} XP</div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {view === 'tools' && (
          <div className="animate-in space-y-12">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Arsenal de <span className="text-cyan-600">IA Social</span></h2>
            {activeTool ? (
              <div className="space-y-8">
                <button onClick={() => { setActiveTool(null); setToolResult(null); }} className="text-[10px] font-black uppercase text-slate-600"><i className="fa-solid fa-arrow-left"></i> Voltar arsenal</button>
                <AIToolRunner tool={activeTool} userProfile={profile} onComplete={setToolResult} />
                {toolResult && (
                  <div className="bg-slate-900 p-8 rounded-[40px] border-2 border-cyan-500/20 animate-in shadow-2xl">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-600">Inteligência Processada</span>
                      <button onClick={() => { navigator.clipboard.writeText(toolResult); showToast("Conteúdo Copiado!", "success"); }} className="text-slate-500 hover:text-white"><i className="fa-solid fa-copy"></i></button>
                    </div>
                    <div className="text-sm font-bold leading-relaxed text-slate-300 whitespace-pre-wrap">{toolResult}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {IA_TOOLS.map(tool => (
                  <button key={tool.id} onClick={() => setActiveTool(tool)} className="p-10 rounded-[56px] bg-white/5 border-2 border-white/5 text-left flex items-center gap-8 active:scale-[0.98] transition-all hover:bg-white/10 shadow-xl">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-4xl text-cyan-600 shadow-2xl border border-white/5"><i className={`fa-solid ${tool.icon}`}></i></div>
                    <div className="flex-1">
                      <h3 className="font-black uppercase text-lg tracking-widest mb-2 leading-none">{tool.name}</h3>
                      <p className="text-[11px] text-slate-500 font-bold leading-tight uppercase italic">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'jobs' && (
          <div className="animate-in space-y-12">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Mural de <span className="text-cyan-600">Renda</span></h2>
            <div className="space-y-6">
              {opportunitiesWithMatch.map(opp => (
                <div key={opp.id} className="bg-white/5 p-10 rounded-[56px] border-2 border-white/5 relative overflow-hidden group shadow-2xl">
                  <div className="absolute -top-6 -right-6 p-10 opacity-5"><i className="fa-solid fa-briefcase text-8xl"></i></div>
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block mb-3">{opp.businessName}</span>
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-4">{opp.title}</h4>
                      <div className="flex flex-wrap gap-4">
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full">{opp.reward}</span>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full">• {opp.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-3xl font-black text-cyan-500 leading-none">{opp.matchingScore}%</div>
                       <span className="text-[9px] font-black text-slate-700 uppercase block tracking-widest mt-2 italic">Match</span>
                    </div>
                  </div>
                  <button className="w-full py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] transition-all bg-white text-black shadow-2xl active:scale-95">Pegar Consultoria</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="animate-in space-y-12">
             <div className="text-center space-y-6 pt-10">
                <div className="relative inline-block">
                   <div className="w-48 h-48 bg-slate-900 rounded-[64px] mx-auto flex items-center justify-center border-4 border-cyan-600 shadow-2xl">
                      <div className="absolute -top-6 -right-6 w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-black font-black text-lg border-8 border-slate-950 shadow-2xl">LV.{Math.floor(xp/1000) + 1}</div>
                      <i className="fa-solid fa-user-ninja text-7xl opacity-20"></i>
                   </div>
                </div>
                <div>
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{profile.name}</h3>
                   <p className="text-[11px] font-black text-cyan-600 uppercase tracking-[0.5em] mt-4 opacity-70 italic">{profile.neighborhood} • MATRÍCULA ATIVA</p>
                </div>
             </div>
             
             <div className="bg-white/5 rounded-[56px] p-10 border-2 border-white/5 space-y-10 shadow-2xl">
                <div className="space-y-6">
                   <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-600">
                      <span>Progresso da Formação</span>
                      <span className="text-cyan-500">{xp} XP TOTAL</span>
                   </div>
                   <div className="h-4 bg-black rounded-full overflow-hidden border-2 border-white/5 p-1">
                      <div className="h-full bg-cyan-600 shadow-[0_0_25px_#22d3ee] rounded-full transition-all duration-1000" style={{ width: `${(xp % 1000) / 10}%` }}></div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-black/40 p-8 rounded-[36px] text-center border-2 border-white/5">
                    <p className="text-4xl font-black italic leading-none mb-3 text-cyan-500">{Object.keys(progress).length}</p>
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">Competências</p>
                  </div>
                  <div className="bg-black/40 p-8 rounded-[36px] text-center border-2 border-white/5">
                    <p className="text-4xl font-black italic text-emerald-500 leading-none mb-3">{appliedJobs.length}</p>
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">Renda Gerada</p>
                  </div>
                </div>
             </div>

             <button onClick={() => { localStorage.removeItem('guia_current_user'); window.location.reload(); }} className="w-full py-6 text-rose-500/60 font-black uppercase text-[10px] tracking-[0.4em] border-2 border-rose-500/10 rounded-[32px] hover:text-rose-500 transition-all">Encerrar Sessão</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 p-8 z-[1000] pointer-events-none">
        <div className="max-w-md mx-auto h-24 rounded-[48px] flex justify-around items-center px-8 glass-panel pointer-events-auto shadow-[0_-30px_100px_rgba(0,0,0,0.9)] border-t border-white/10">
          {[
            { id: 'home', icon: 'fa-graduation-cap', label: 'FORMAÇÃO' },
            { id: 'tools', icon: 'fa-bolt-lightning', label: 'ARSENAL' },
            { id: 'jobs', icon: 'fa-briefcase', label: 'MURAL' },
            { id: 'profile', icon: 'fa-id-card-clip', label: 'PERFIL' }
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id as any); setSelectedModule(null); triggerVibration('light'); }} className={`flex flex-col items-center justify-center gap-2.5 transition-all active:scale-90 ${view === item.id ? 'text-cyan-500 scale-110' : 'text-slate-700 hover:text-slate-400'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${view === item.id ? 'bg-cyan-600/10 border-2 border-cyan-500/20' : ''}`}>
                <i className={`fa-solid ${item.icon} text-2xl`}></i>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${view === item.id ? 'opacity-100 italic' : 'opacity-40'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
