
import React, { useState, useEffect } from 'react';
import { MODULES as INITIAL_MODULES, IA_TOOLS } from './constants.tsx';
import { Module, Lesson, UserProfile, IATool } from './types.ts';
import { GoogleGenAI } from "@google/genai";

const triggerVibration = (type: 'light' | 'success' | 'warning') => {
  if (!window.navigator.vibrate) return;
  const p = { light: 10, success: [10, 30, 10], warning: 100 };
  window.navigator.vibrate(p[type] as any);
};

// --- Componentes de Identidade Visual ---

const BrandingLogo = ({ size = "md", light = false }: { size?: "sm" | "md" | "lg", light?: boolean }) => {
  const sizes = {
    sm: "h-8",
    md: "h-12",
    lg: "h-32"
  };
  
  return (
    <div className={`flex items-center gap-3 ${size === 'lg' ? 'flex-col' : 'flex-row'}`}>
      <div className={`${sizes[size]} aspect-square relative flex items-center justify-center`}>
        {/* Círculo de Fundo (Aura) */}
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
        {/* Ilustração do Smartphone (Vetor Estilizado) */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
          <circle cx="50" cy="50" r="45" fill="#22d3ee" fillOpacity="0.1" />
          <path d="M40 85 C 30 80, 25 70, 25 50 C 25 30, 35 20, 50 20 C 65 20, 75 30, 75 50 C 75 70, 70 80, 60 85" stroke="#22d3ee" strokeWidth="2" fill="none" />
          <rect x="38" y="30" width="24" height="40" rx="3" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
          <path d="M46 45 L 56 50 L 46 55 Z" fill="#22d3ee" />
          <path d="M30 60 C 25 65, 20 80, 25 90 C 35 95, 45 95, 50 90 L 50 75" stroke="#9333ea" strokeWidth="6" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <div className={size === 'lg' ? 'text-center' : 'text-left'}>
        <h1 className={`${size === 'lg' ? 'text-4xl' : 'text-xl'} font-black italic uppercase tracking-tighter leading-none ${light ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          GUIA <span className="text-cyan-500">DIGITAL</span>
        </h1>
        {size === 'lg' && <div className="h-1 w-12 bg-cyan-600 mx-auto mt-2 shadow-[0_0_10px_#22d3ee]"></div>}
      </div>
    </div>
  );
};

const Toast = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const styles = {
    success: 'bg-emerald-500 text-slate-950',
    error: 'bg-rose-500 text-white',
    info: 'bg-cyan-500 text-slate-950'
  };
  return (
    <div className={`fixed top-12 left-6 right-6 z-[90000] p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in ${styles[type as keyof typeof styles] || styles.info}`}>
      <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center shrink-0 text-white">
        <i className="fa-solid fa-bolt-lightning text-sm"></i>
      </div>
      <p className="text-[11px] font-black uppercase tracking-widest leading-tight">{message}</p>
    </div>
  );
};

// --- Arsenal de IA (RESOLUÇÃO DEFINITIVA DO ERRO DE API KEY) ---

const AIToolRunner = ({ tool, userProfile, onComplete }: { tool: IATool, userProfile: UserProfile, onComplete: (res: string) => void }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const runTool = async () => {
    if (!input) return;
    
    // Verificação de ambiente crítica para o SDK Gemini no Browser
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setLocalError("Terminal Desincronizado: Chave de API ausente no contexto do navegador.");
      triggerVibration('warning');
      return;
    }

    setLoading(true);
    setLocalError(null);
    try {
      // Inicialização mandatória seguindo @google/genai guidelines
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const prompt = tool.promptTemplate
        .replace('{business_type}', input)
        .replace('{neighborhood}', userProfile.neighborhood)
        .replace('{input}', input);

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (result.text) {
        onComplete(result.text);
        triggerVibration('success');
      } else {
        throw new Error("O núcleo de IA não retornou dados processáveis.");
      }
    } catch (err: any) {
      console.error("AI Fatal Error:", err);
      setLocalError(`Falha no Arsenal: ${err.message || 'Erro de barramento'}`);
      triggerVibration('warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-[40px] border border-white/5 space-y-6 shadow-2xl animate-in">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 flex items-center justify-center text-2xl text-cyan-500 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
          <i className={`fa-solid ${tool.icon}`}></i>
        </div>
        <div>
          <h3 className="font-black uppercase text-xs tracking-widest leading-none">{tool.name}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 italic">Processamento Inteligente</p>
        </div>
      </div>
      
      {localError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-in">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">Diagnóstico de Erro:</p>
          <p className="text-[10px] text-slate-400 mt-1 leading-tight">{localError}</p>
        </div>
      )}

      <textarea 
        className="w-full bg-black border-2 border-white/5 p-6 rounded-3xl text-sm text-white outline-none focus:border-cyan-600 min-h-[160px] font-bold transition-all" 
        placeholder="Insira o contexto técnico para processamento..." 
        value={input} 
        onChange={e => setInput(e.target.value)} 
      />
      
      <button 
        disabled={loading || !input} 
        onClick={runTool} 
        className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-xs tracking-[0.2em] rounded-3xl disabled:opacity-20 active:scale-95 transition-all shadow-[0_0_40px_rgba(34,211,238,0.3)]"
      >
        {loading ? <i className="fa-solid fa-circle-notch animate-spin text-xl"></i> : 'ATIVAR PROTOCOLO'}
      </button>
    </div>
  );
};

// --- Dossiê de Formação (Lição Robusta) ---

const LessonDossier = ({ lesson, onComplete, onBack }: { lesson: Lesson, onComplete: () => void, onBack: () => void }) => {
  const [showValidation, setShowValidation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleValidate = () => {
    if (selectedOption === lesson.quiz.correctIndex) {
      setIsCorrect(true);
      triggerVibration('success');
      setTimeout(onComplete, 1500);
    } else {
      setIsCorrect(false);
      triggerVibration('warning');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col animate-in overflow-y-auto pb-40">
      <header className="px-8 py-10 flex items-center gap-6 border-b border-white/5 sticky top-0 bg-slate-950/90 backdrop-blur-2xl z-50">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="flex-1">
          <span className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.3em]">Dossiê Técnico Territorial</span>
          <h2 className="text-sm font-black text-white uppercase italic tracking-tighter leading-none">{lesson.title}</h2>
        </div>
      </header>

      <main className="px-8 py-10 space-y-12 max-w-2xl mx-auto w-full">
        {!showValidation ? (
          <>
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-cyan-500">
                <i className="fa-solid fa-book-open-reader text-xl"></i>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Fundamentação Teórica</h3>
              </div>
              <div className="text-lg font-bold leading-relaxed text-slate-200 border-l-4 border-cyan-600 pl-8 text-justify italic">
                {lesson.theory}
              </div>
            </section>

            <section className="space-y-8 bg-white/5 p-8 rounded-[40px] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 text-emerald-500">
                <i className="fa-solid fa-vial-circle-check text-xl"></i>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Desafio de Campo</h3>
              </div>
              <p className="text-sm font-medium text-slate-400 leading-relaxed uppercase italic">
                {lesson.challenge}
              </p>
              <div className="pt-6 border-t border-white/5">
                <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 italic">Checklist Técnico:</h4>
                <ul className="space-y-3">
                  {lesson.checklist.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-cyan-600 shadow-[0_0_10px_#22d3ee]"></div>
                      {item.toUpperCase()}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <button onClick={() => setShowValidation(true)} className="w-full py-8 bg-cyan-600 text-black font-black uppercase text-xs tracking-[0.2em] rounded-[32px] shadow-[0_0_50px_rgba(34,211,238,0.2)] active:scale-95 transition-all">
              VALIDAR COMPETÊNCIA
            </button>
          </>
        ) : (
          <section className="space-y-10 animate-in">
             <div className="space-y-4">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Protocolo de Verificação</span>
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{lesson.quiz.question}</h3>
             </div>

             <div className="space-y-3">
               {lesson.quiz.options.map((opt, i) => (
                 <button key={i} onClick={() => setSelectedOption(i)} className={`w-full p-6 rounded-3xl text-left text-xs font-black uppercase transition-all border-2 ${selectedOption === i ? 'bg-cyan-600 border-cyan-400 text-black' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                    {opt}
                 </button>
               ))}
             </div>

             {isCorrect === false && (
               <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-in">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">Acesso Negado: Revise os fundamentos técnicos acima.</p>
               </div>
             )}

             <div className="flex gap-4">
                <button onClick={() => setShowValidation(false)} className="flex-1 py-6 bg-white/5 text-slate-500 font-black uppercase text-[10px] rounded-3xl">REVISAR DOSSIÊ</button>
                <button onClick={handleValidate} disabled={selectedOption === null || isCorrect === true} className="flex-[2] py-6 bg-cyan-600 text-black font-black uppercase text-[10px] rounded-3xl disabled:opacity-30 shadow-lg">AUTENTICAR APRENDIZADO</button>
             </div>
          </section>
        )}
      </main>
    </div>
  );
};

// --- Onboarding & Manifesto (TEXTO PRESERVADO) ---

const Onboarding = ({ onComplete }: { onComplete: (p: UserProfile, xp: number, progress: any, applications: string[]) => void }) => {
  const [phase, setPhase] = useState<'manifesto' | 'auth' | 'fields' | 'verification' | 'pending'>('manifesto');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [form, setForm] = useState({ 
    username: '', password: '', name: '', neighborhood: '', skill: '', 
    age: '', class: '', rg: '', cpf: '', email: '', phone: '', lgpd: false,
    socialName: '', ethnicity: '', sexualOrientation: '', genderIdentity: '', isIntersex: '', transIdentity: ''
  });
  const [verificationInput, setVerificationInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');

  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleAuth = () => {
    if (!form.username || !form.password) { setError('Preencha as credenciais'); return; }
    const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
    if (authMode === 'login') {
      const user = users[form.username];
      if (user && user.profile.password === form.password) {
        if (user.profile.status === 'pending') setPhase('pending');
        else onComplete(user.profile, user.totalXP || 0, user.lessonProgress || {}, user.appliedJobs || []);
      } else setError('Credenciais inválidas no terminal.');
    } else {
      if (users[form.username]) setError('Usuário já registrado.'); else setPhase('fields');
    }
  };

  if (phase === 'manifesto') return (
    <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col p-10 justify-center animate-in overflow-y-auto">
      <div className="space-y-12 max-w-sm mx-auto">
        <div className="flex justify-center">
            <BrandingLogo size="lg" light />
        </div>
        
        <div className="space-y-8 text-slate-300 font-bold text-xs uppercase leading-relaxed tracking-wider italic text-justify">
           <p><span className="text-cyan-600 font-black">NÃO SOMOS APENAS UM APP.</span> O Guia Digital é um Sistema Operacional para hackear a pobreza territorial através do conhecimento técnico.</p>
           <p>Transformamos talentos do Recife em infraestrutura de renda real. Onde o sistema vê carência, nós ativamos potência.</p>
           <p className="border-l-4 border-cyan-600 pl-6 text-white font-black text-sm not-italic uppercase">Mobilidade Social é um Direito Tecnológico.</p>
        </div>

        <button onClick={() => setPhase('auth')} className="w-full py-8 bg-cyan-600 text-slate-950 font-black uppercase text-xs rounded-[32px] active:scale-95 shadow-[0_0_50px_rgba(34,211,238,0.3)] transition-all">INICIALIZAR PROTOCOLO</button>
      </div>
    </div>
  );

  if (phase === 'verification') return (
    <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col p-8 justify-center animate-in text-center">
      <div className="max-w-sm mx-auto w-full space-y-8">
        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">Autenticação</h2>
        <input 
          className="w-full bg-slate-900 border-2 border-white/5 p-6 rounded-3xl text-white text-3xl text-center outline-none font-black tracking-[0.5em]" 
          placeholder="000000" 
          maxLength={6} 
          value={verificationInput} 
          onChange={e => setVerificationInput(e.target.value)} 
        />
        <p className="text-[10px] font-mono text-slate-500 uppercase">Token de Sistema: <span className="text-cyan-600">{generatedCode}</span></p>
        <button onClick={() => {
            if (verificationInput === generatedCode) {
                const profile: UserProfile = { ...form, level: 1, joinedAt: Date.now(), status: 'pending', isVerified: true, lgpdAccepted: true };
                const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
                users[form.username] = { profile, totalXP: 0, lessonProgress: {}, appliedJobs: [] };
                localStorage.setItem('guia_users_db', JSON.stringify(users));
                setPhase('pending');
                triggerVibration('success');
            } else { setError('Token Inválido'); triggerVibration('warning'); }
        }} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-[10px] rounded-3xl shadow-xl">ATIVAR MATRÍCULA</button>
      </div>
    </div>
  );

  // Renderização padrão dos formulários de login/signup...
  return (
    <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col p-8 justify-start animate-in overflow-y-auto pt-20 pb-40">
       <div className="max-w-sm mx-auto w-full space-y-12">
         <div className="flex justify-center mb-8">
            <BrandingLogo size="md" light />
         </div>
         <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter border-b border-white/10 pb-4">{authMode === 'signup' ? 'Dossiê de Matrícula' : 'Login de Terminal'}</h2>
         
         {error && <p className="text-rose-500 text-[10px] font-black uppercase bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">{error}</p>}
         
         {authMode === 'login' ? (
           <div className="space-y-4">
             <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="USUÁRIO" value={form.username} onChange={e => setForm({...form, username: e.target.value.toLowerCase()})} />
             <input type="password" className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="SENHA" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
             <button onClick={handleAuth} className="w-full py-6 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-3xl">CONECTAR</button>
             <button onClick={() => setAuthMode('signup')} className="w-full text-center text-slate-500 font-black text-[9px] uppercase mt-4 tracking-widest">NOVA MATRÍCULA NO TERRITÓRIO</button>
           </div>
         ) : (
           <div className="space-y-10">
             <div className="space-y-4">
               <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="NOME COMPLETO" value={form.name} onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} />
               <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
               <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="BAIRRO (RECIFE)" value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value.toUpperCase()})} />
               <div className="grid grid-cols-2 gap-3">
                    {['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena'].map(opt => (
                        <button key={opt} onClick={() => setForm({...form, ethnicity: opt})} className={`px-4 py-3 rounded-2xl text-[9px] font-black border-2 transition-all ${form.ethnicity === opt ? 'bg-cyan-600 border-cyan-400 text-black shadow-lg' : 'bg-slate-900 border-white/5 text-slate-500'}`}>{opt.toUpperCase()}</button>
                    ))}
               </div>
             </div>
             <div className="space-y-4">
                <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black" placeholder="NOME DE USUÁRIO" value={form.username} onChange={e => setForm({...form, username: e.target.value.toLowerCase()})} />
                <input type="password" className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black" placeholder="CHAVE DE ACESSO" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
             </div>
             <button onClick={() => { 
                if(!form.name || !form.cpf || !form.neighborhood) { setError("Complete o Dossiê."); return; }
                const code = generateCode(); setGeneratedCode(code); setPhase('verification');
             }} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-[10px] tracking-widest rounded-3xl">ATIVAR PROTOCOLO</button>
             <button onClick={() => setAuthMode('login')} className="w-full text-center text-slate-500 font-black text-[9px] uppercase mt-4 tracking-widest">JÁ POSSUO TERMINAL ATIVO</button>
           </div>
         )}
       </div>
    </div>
  );
};

// --- App Principal ---

const App = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [xp, setXp] = useState(0);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [toast, setToast] = useState<{message: string, type: string} | null>(null);
  const [view, setView] = useState<'home' | 'jobs' | 'tools' | 'profile' | 'mei'>('home');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTool, setActiveTool] = useState<IATool | null>(null);
  const [toolResult, setToolResult] = useState<string | null>(null);
  const [showManifestoOverlay, setShowManifestoOverlay] = useState(false);

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
    showToast(`Dossiê Validado: ${activeLesson.title}`, 'success');
  };

  useEffect(() => {
    const user = localStorage.getItem('guia_current_user');
    if (user) {
      const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
      if (users[user]?.profile.status === 'active') {
        setProfile(users[user].profile); setXp(users[user].totalXP); setProgress(users[user].lessonProgress); setAppliedJobs(users[user].appliedJobs);
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
      
      {activeLesson && <LessonDossier lesson={activeLesson} onBack={() => setActiveLesson(null)} onComplete={handleCompleteLesson} />}

      {showManifestoOverlay && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/95 backdrop-blur-xl flex flex-col p-10 justify-center animate-in overflow-y-auto">
             <div className="space-y-12 max-w-sm mx-auto">
                <BrandingLogo size="lg" light />
                <h2 className="text-3xl font-black italic uppercase text-cyan-600 leading-none tracking-tighter text-center mt-[-40px]">O PACTO</h2>
                <div className="space-y-6 text-[12px] font-bold text-slate-300 uppercase leading-relaxed tracking-wider italic text-justify">
                    <p>O Guia Digital é um Sistema Operacional de Mobilidade Social.</p>
                    <p>Aqui, o conhecimento é técnico, a formação é robusta e a finalidade é a geração de renda real através da vocação territorial do Recife.</p>
                    <p className="text-cyan-600 font-black border-l-4 border-cyan-600 pl-6">Nossa missão é hackear a exclusão econômica através da tecnologia.</p>
                </div>
                <button onClick={() => setShowManifestoOverlay(false)} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-[10px] rounded-3xl shadow-lg">RETORNAR AO SISTEMA</button>
             </div>
        </div>
      )}

      <header className="px-8 py-10 flex justify-between items-center border-b border-white/5 sticky top-0 bg-slate-950/90 backdrop-blur-2xl z-50">
        <BrandingLogo size="sm" light />
        <div className="flex flex-col items-end">
          <div className="text-base font-black text-cyan-500 italic leading-none">{xp} <span className="text-[9px] opacity-40 uppercase tracking-widest">XP</span></div>
          <div className="text-[8px] font-black text-slate-700 uppercase tracking-widest mt-1">LVL {Math.floor(xp/1000) + 1}</div>
        </div>
      </header>

      <main className="flex-1 px-6 pt-10 pb-48 max-w-2xl mx-auto w-full space-y-12">
        {view === 'home' && !selectedModule && (
          <div className="space-y-12 animate-in">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none border-l-4 border-cyan-600 pl-6">Matriz de <span className="text-cyan-600">Competências</span></h2>
            <div className="space-y-6">
              {INITIAL_MODULES.map(module => (
                <div key={module.id} onClick={() => setSelectedModule(module)} className="p-8 rounded-[40px] bg-white/5 border-2 border-white/5 active:scale-[0.98] transition-all hover:bg-white/10 shadow-2xl relative group overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center text-2xl border border-cyan-500/20 group-hover:scale-110 transition-transform"><i className={`fa-solid ${module.icon}`}></i></div>
                     <span className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.3em] italic border border-cyan-500/20 px-3 py-1 rounded-full">{module.technicalSkill}</span>
                  </div>
                  <h3 className="text-xl font-black uppercase italic mb-2 tracking-tighter text-white">{module.title}</h3>
                  <p className="text-[11px] text-slate-500 font-bold mb-6 leading-tight uppercase italic">{module.description}</p>
                  <div className="h-1 bg-black rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-cyan-600 shadow-[0_0_15px_#22d3ee] transition-all duration-1000" style={{ width: `${Object.keys(progress).filter(id => module.lessons.some(l => l.id === id)).length * (100 / module.lessons.length)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedModule && (
          <div className="animate-in space-y-12">
             <button onClick={() => setSelectedModule(null)} className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full hover:text-white transition-all"><i className="fa-solid fa-arrow-left"></i> Voltar à Matriz de Formação</button>
             <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-[0.8]">{selectedModule.title}</h2>
             <div className="space-y-5">
               {selectedModule.lessons.map(lesson => (
                 <div key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`p-8 rounded-[40px] border-2 transition-all active:scale-95 flex items-center justify-between shadow-2xl ${progress[lesson.id] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex-1">
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-2">{lesson.title}</h4>
                      <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest bg-cyan-600/10 px-3 py-1 rounded-full border border-cyan-500/10">Dossiê: +{lesson.xpValue} XP</span>
                    </div>
                    {progress[lesson.id] ? <i className="fa-solid fa-circle-check text-emerald-500 text-3xl shadow-[0_0_15px_rgba(16,185,129,0.2)]"></i> : <i className="fa-solid fa-chevron-right text-slate-700"></i>}
                 </div>
               ))}
             </div>
          </div>
        )}

        {view === 'tools' && (
          <div className="animate-in space-y-12">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Arsenal de <span className="text-cyan-600">IA</span></h2>
            {activeTool ? (
              <div className="space-y-8">
                <button onClick={() => { setActiveTool(null); setToolResult(null); }} className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-2 bg-white/5 px-6 py-3 rounded-full"><i className="fa-solid fa-arrow-left"></i> Fechar Terminal</button>
                <AIToolRunner tool={activeTool} userProfile={profile} onComplete={setToolResult} />
                {toolResult && (
                  <div className="bg-slate-900 p-8 rounded-[40px] border-2 border-cyan-500/20 animate-in relative shadow-2xl overflow-hidden">
                    <button onClick={() => { navigator.clipboard.writeText(toolResult); showToast("Copiado!", "success"); }} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                      <i className="fa-solid fa-copy"></i>
                    </button>
                    <div className="text-sm font-bold leading-relaxed text-slate-300 italic whitespace-pre-wrap">{toolResult}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {IA_TOOLS.map(tool => (
                  <button key={tool.id} onClick={() => setActiveTool(tool)} className="p-10 rounded-[56px] bg-white/5 border-2 border-white/5 text-left active:scale-[0.98] transition-all hover:bg-white/10 flex items-center gap-8 shadow-xl group">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-4xl text-cyan-600 shadow-inner border border-white/5 group-hover:scale-105 transition-transform">
                      <i className={`fa-solid ${tool.icon}`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black uppercase text-lg mb-2 tracking-tighter leading-none">{tool.name}</h3>
                      <p className="text-[11px] text-slate-500 italic uppercase leading-tight font-bold">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'jobs' && (
          <div className="animate-in space-y-12">
            <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter">Fluxo de <span className="text-cyan-600">Renda</span></h2>
            <div className="p-12 border-2 border-dashed border-white/10 rounded-[56px] text-center space-y-6 bg-white/5 shadow-2xl">
               <i className="fa-solid fa-network-wired text-6xl text-cyan-600 animate-pulse"></i>
               <p className="text-slate-500 uppercase font-black text-[10px] italic tracking-[0.3em]">Sincronizando contratos locais...</p>
               <p className="text-[11px] font-bold text-slate-600 uppercase italic">A formação na Matriz desbloqueia oportunidades reais de negócio.</p>
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="animate-in space-y-12 text-center pt-10">
             <div className="relative inline-block">
               <div className="w-48 h-48 bg-slate-900 rounded-[64px] mx-auto flex items-center justify-center border-4 border-cyan-600 relative shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-black font-black border-8 border-slate-950 uppercase text-[10px]">LV.{Math.floor(xp/1000) + 1}</div>
                  <i className="fa-solid fa-user-shield text-7xl opacity-20"></i>
               </div>
             </div>
             <div>
               <h3 className="text-4xl font-black uppercase italic leading-none tracking-tighter">{profile.socialName || profile.name}</h3>
               <p className="text-[11px] font-black text-cyan-600 uppercase italic mt-4 tracking-[0.4em]">{profile.neighborhood} • Turma: {profile.class}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowManifestoOverlay(true)} className="bg-white/5 p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col items-center gap-2 active:scale-95 transition-all">
                   <i className="fa-solid fa-scroll text-cyan-600 text-xl"></i>
                   <p className="text-[9px] font-black text-slate-500 uppercase">LER MANIFESTO</p>
                </button>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col items-center gap-2">
                   <i className="fa-solid fa-id-card-clip text-cyan-600 text-xl"></i>
                   <p className="text-[9px] font-black text-slate-500 uppercase">IDENTIDADE</p>
                </div>
             </div>

             <div className="pt-10">
                <button onClick={() => { localStorage.removeItem('guia_current_user'); window.location.reload(); }} className="w-full py-6 text-rose-500/60 font-black uppercase text-[10px] tracking-[0.4em] border-2 border-rose-500/10 rounded-[32px] hover:text-rose-500 hover:border-rose-500 transition-all shadow-xl">Encerrar Terminal de Acesso</button>
             </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 p-8 z-[1000] pointer-events-none">
        <div className="max-w-xl mx-auto h-24 rounded-[48px] flex justify-around items-center px-6 glass-panel pointer-events-auto shadow-[0_-20px_60px_rgba(0,0,0,0.8)] border border-white/10">
          {[
            { id: 'home', icon: 'fa-graduation-cap', label: 'MATRIZ' },
            { id: 'tools', icon: 'fa-bolt-lightning', label: 'ARSENAL' },
            { id: 'jobs', icon: 'fa-briefcase', label: 'FLUXO' },
            { id: 'profile', icon: 'fa-id-card-clip', label: 'TERMINAL' }
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id as any); setSelectedModule(null); triggerVibration('light'); }} className={`flex flex-col items-center justify-center gap-2 transition-all min-w-[56px] ${view === item.id ? 'text-cyan-500 scale-110' : 'text-slate-700'}`}>
              <i className={`fa-solid ${item.icon} text-xl`}></i>
              <span className={`text-[7px] font-black uppercase tracking-widest ${view === item.id ? 'opacity-100 italic' : 'opacity-40'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
