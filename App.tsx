
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
    <div className={`fixed top-12 left-6 right-6 z-[90000] p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in ${styles[type as keyof typeof styles] || styles.info}`}>
      <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center shrink-0">
        <i className="fa-solid fa-bolt-lightning text-sm"></i>
      </div>
      <p className="text-[11px] font-black uppercase tracking-widest leading-tight">{message}</p>
    </div>
  );
};

// --- Tela MEI: Decolagem Empreendedora ---

const MeiPortal = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="fixed inset-0 z-[80000] bg-slate-950 flex flex-col animate-in overflow-y-auto pb-40">
      <header className="px-8 py-10 flex items-center gap-6 border-b border-white/5 sticky top-0 bg-slate-950/90 backdrop-blur-2xl z-50">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none">TORNE-SE MEI</h2>
          <p className="text-[10px] text-cyan-600 font-black uppercase tracking-widest mt-1">Sua Empresa Real</p>
        </div>
      </header>

      <main className="px-8 py-10 space-y-12 max-w-2xl mx-auto w-full">
        <section className="space-y-6">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-[0.8]">DECOLAGEM <br/><span className="text-cyan-600">MEI</span></h1>
          <p className="text-lg font-bold leading-tight text-slate-200 border-l-4 border-cyan-600 pl-6 italic">
            "Saia da informalidade hoje com CNPJ próprio, direito a aposentadoria e poder para emitir notas fiscais!"
          </p>
        </section>

        <section className="bg-amber-500/10 border-2 border-amber-500/20 p-8 rounded-[40px] shadow-2xl space-y-4">
          <div className="flex items-center gap-3 text-amber-500">
            <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Atenção Prioritária</span>
          </div>
          <p className="text-sm font-bold text-white leading-relaxed italic">
            Antes de começar, verifique se sua senha do <span className="text-amber-500 font-black">Gov.br é Prata ou Ouro</span>. Se não for, você precisará aumentar o nível dela pelo app do governo primeiro.
          </p>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Lista de Verificação</h3>
          <div className="grid gap-3">
            {["Faturamento até R$ 81k/ano", "Não ser sócio de outra empresa", "Ocupação permitida", "Conta Gov.br Prata/Ouro"].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5">
                <i className="fa-solid fa-circle-check text-emerald-500"></i>
                <span className="text-xs font-black uppercase text-slate-400">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Protocolo de 6 Etapas</h3>
          <div className="space-y-10 pl-6 border-l-2 border-white/5">
            {[
              { t: "01. ACESSO", d: "Entre no Portal do Empreendedor em 'Quero ser MEI'." },
              { t: "02. CONTA GOV.BR", d: "Faça login (nível Prata ou Ouro obrigatório)." },
              { t: "03. DADOS", d: "Preencha recibo do IR ou Título e valide o celular." },
              { t: "04. IDENTIDADE", d: "Defina Nome Fantasia e suas atividades." },
              { t: "05. LOCALIZAÇÃO", d: "Informe o endereço do seu negócio." },
              { t: "06. DECOLAGEM", d: "Aceite os termos e emita seu Certificado CCMEI!" }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[35px] top-0 w-4 h-4 rounded-full bg-cyan-600 shadow-[0_0_15px_#22d3ee]"></div>
                <h4 className="text-sm font-black text-white uppercase italic tracking-widest leading-none mb-2">{step.t}</h4>
                <p className="text-[11px] font-bold text-slate-500 leading-tight uppercase italic">{step.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 pt-10 border-t border-white/5">
          <h3 className="text-[10px] font-black text-center text-cyan-600 uppercase tracking-[0.5em] mb-8 italic">Vamos tirar seu sonho do papel?</h3>
          <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei" target="_blank" className="block w-full py-8 bg-cyan-600 text-black text-center font-black uppercase text-xs tracking-[0.2em] rounded-[32px] shadow-[0_0_50px_rgba(34,211,238,0.3)] active:scale-95 transition-all">
            <i className="fa-solid fa-rocket mr-3"></i> QUERO ME FORMALIZAR AGORA
          </a>
        </section>
      </main>
    </div>
  );
};

// --- Arsenal de IA: Refatorado para Gemini 3 ---

const AIToolRunner = ({ tool, userProfile, onComplete }: { tool: IATool, userProfile: UserProfile, onComplete: (res: string) => void }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const runTool = async () => {
    if (!input) return;
    setLoading(true);
    setLocalError(null);
    try {
      // Inicialização correta seguindo as diretrizes
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = tool.promptTemplate
        .replace('{business_type}', input)
        .replace('{neighborhood}', userProfile.neighborhood)
        .replace('{input}', input);

      // Chamada otimizada para Gemini 3 Flash
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        onComplete(response.text);
      } else {
        throw new Error("O núcleo não retornou dados.");
      }
    } catch (err: any) {
      console.error("Arsenal Error:", err);
      // Log amigável mas técnico para diagnóstico
      setLocalError(err.message || "Falha na conexão com o Núcleo de IA.");
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
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 italic">Processamento Inteligente</p>
        </div>
      </div>
      
      {localError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Diagnóstico de Erro:</p>
          <p className="text-[10px] font-mono text-slate-400 break-words">{localError}</p>
        </div>
      )}

      <textarea className="w-full bg-black border-2 border-white/5 p-6 rounded-3xl text-sm text-white outline-none focus:border-cyan-600 min-h-[160px] font-bold" placeholder="Digite os dados ou objetivo..." value={input} onChange={e => setInput(e.target.value)} />
      <button disabled={loading || !input} onClick={runTool} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-xs tracking-[0.2em] rounded-3xl disabled:opacity-20 active:scale-95 transition-all shadow-[0_0_40px_rgba(34,211,238,0.3)]">
        {loading ? <i className="fa-solid fa-circle-notch animate-spin text-xl"></i> : 'Ativar Inteligência'}
      </button>
    </div>
  );
};

// --- Onboarding Principal com Validação Robusta ---

const Onboarding = ({ onComplete }: { onComplete: (p: UserProfile, xp: number, progress: any, applications: string[]) => void }) => {
  const [phase, setPhase] = useState<'manifesto' | 'auth' | 'fields' | 'verification' | 'pending'>('manifesto');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [form, setForm] = useState({ 
    username: '', password: '', name: '', neighborhood: '', skill: '', 
    age: '', class: '', rg: '', cpf: '', email: '', phone: '', lgpd: false 
  });
  const [verificationInput, setVerificationInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');

  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleAuth = () => {
    if (!form.username || !form.password) { setError('Defina usuário e senha'); return; }
    const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
    if (authMode === 'login') {
      const user = users[form.username];
      if (user && user.profile.password === form.password) {
        if (user.profile.status === 'pending') setPhase('pending');
        else onComplete(user.profile, user.totalXP || 0, user.lessonProgress || {}, user.appliedJobs || []);
      } else setError('Matrícula não encontrada ou senha incorreta');
    } else {
      if (users[form.username]) setError('Este usuário já existe'); else setPhase('fields');
    }
  };

  const startVerification = () => {
    // Validação detalhada para apontar exatamente o que falta
    const missing = [];
    if (!form.name) missing.push('Nome');
    if (!form.cpf) missing.push('CPF');
    if (!form.rg) missing.push('RG');
    if (!form.class) missing.push('Turma');
    if (!form.age) missing.push('Idade');
    if (!form.phone) missing.push('Telefone');
    if (!form.email) missing.push('E-mail');
    if (!form.neighborhood) missing.push('Bairro');
    if (!form.skill) missing.push('Vocação');

    if (missing.length > 0) { 
      setError(`Campos faltantes: ${missing.join(', ')}`); 
      triggerVibration('warning');
      return; 
    }
    
    if (!form.lgpd) { setError('Você precisa aceitar a LGPD'); return; }
    
    const code = generateCode();
    setGeneratedCode(code);
    setError('');
    setPhase('verification');
  };

  const confirmVerification = () => {
    if (verificationInput === generatedCode) {
      const profile: UserProfile = { ...form, level: 1, joinedAt: Date.now(), status: 'pending', isVerified: true, lgpdAccepted: true };
      const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
      users[form.username] = { profile, totalXP: 0, lessonProgress: {}, appliedJobs: [] };
      localStorage.setItem('guia_users_db', JSON.stringify(users));
      setPhase('pending');
      triggerVibration('success');
    } else { setError('Código inválido.'); triggerVibration('warning'); }
  };

  if (phase === 'manifesto') return (
    <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col p-10 justify-center animate-in overflow-y-auto">
      <div className="space-y-12 max-w-sm mx-auto">
        <h2 className="text-6xl font-black italic uppercase text-white leading-[0.8] tracking-tighter">GUIA <br/><span className="text-cyan-600">SOCIAL</span></h2>
        <p className="text-slate-400 font-bold text-sm leading-relaxed border-l-4 border-white/5 pl-8 italic">Seu Sistema Operacional de Mobilidade Econômica.</p>
        <button onClick={() => setPhase('auth')} className="w-full py-6 bg-cyan-600 text-slate-950 font-black uppercase text-[10px] rounded-3xl active:scale-95 shadow-xl transition-all">Acessar Sistema</button>
      </div>
    </div>
  );

  if (phase === 'verification') return (
    <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col p-8 justify-center animate-in text-center">
      <div className="max-w-sm mx-auto w-full space-y-8">
        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">Validação</h2>
        <p className="text-xs text-slate-500 uppercase font-black">Digite o código enviado no seu e-mail de matrícula:</p>
        <input className="w-full bg-slate-900 border-2 border-white/5 p-6 rounded-3xl text-white text-3xl text-center outline-none font-black tracking-[0.5em]" placeholder="000000" maxLength={6} value={verificationInput} onChange={e => setVerificationInput(e.target.value)} />
        <div className="p-4 bg-black rounded-2xl border border-white/10 text-left">
           <p className="text-[8px] font-black text-cyan-600 uppercase mb-1">Log de Teste:</p>
           <p className="text-[10px] font-mono text-slate-500 italic">Código recebido: {generatedCode}</p>
        </div>
        <button onClick={confirmVerification} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-[10px] rounded-3xl shadow-2xl">Validar Matrícula</button>
      </div>
    </div>
  );

  if (phase === 'pending') return (
    <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col p-10 justify-center animate-in text-center">
      <div className="space-y-8 max-w-sm mx-auto">
        <h2 className="text-3xl font-black italic uppercase text-white leading-none tracking-tighter">Matrícula <br/>Enviada</h2>
        <p className="text-xs font-bold text-slate-400">O Instituto Guia Social recebeu seu dossiê e está processando a liberação.</p>
        <button onClick={() => {
          const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
          if (users[form.username]) {
            users[form.username].profile.status = 'active';
            localStorage.setItem('guia_users_db', JSON.stringify(users));
            onComplete(users[form.username].profile, 0, {}, []);
          }
        }} className="w-full py-6 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-3xl shadow-lg">Aprovação Mentor (Modo Teste)</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col p-8 justify-center animate-in overflow-y-auto">
       <div className="max-w-sm mx-auto w-full space-y-6 pt-20 pb-20">
         <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">{authMode === 'signup' ? 'Dossiê de Matrícula' : 'Login de Acesso'}</h2>
         {error && <p className="text-rose-500 text-[10px] font-black uppercase bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 shadow-lg">{error}</p>}
         
         {authMode === 'login' ? (
           <div className="space-y-4">
             <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="USUÁRIO" value={form.username} onChange={e => setForm({...form, username: e.target.value.toLowerCase()})} />
             <input type="password" className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="SENHA" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
             <button onClick={handleAuth} className="w-full py-6 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-2xl">Conectar</button>
             <button onClick={() => setAuthMode('signup')} className="w-full text-center text-slate-500 font-black text-[9px] uppercase mt-4 tracking-widest">Ainda não sou matriculado</button>
           </div>
         ) : (
           <div className="space-y-4">
             <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block mb-1">01. Identidade</span>
             <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="NOME COMPLETO" value={form.name} onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} />
             
             <div className="grid grid-cols-2 gap-3">
               <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
               <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="RG" value={form.rg} onChange={e => setForm({...form, rg: e.target.value})} />
             </div>

             <div className="grid grid-cols-2 gap-3">
               <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="TURMA" value={form.class} onChange={e => setForm({...form, class: e.target.value.toUpperCase()})} />
               <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="IDADE" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
             </div>

             <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block mt-4 mb-1">02. Contato e Bairro</span>
             <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="TELEFONE / WHATSAPP" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
             <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black" placeholder="E-MAIL" value={form.email} onChange={e => setForm({...form, email: e.target.value.toLowerCase()})} />
             <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black uppercase" placeholder="BAIRRO DE ATUAÇÃO" value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value.toUpperCase()})} />

             <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block mt-4 mb-1">03. Vocação Digital</span>
             <div className="grid grid-cols-2 gap-2">
               {['DESIGN', 'VENDAS', 'SOCIAL', 'TECH'].map(s => (
                 <button key={s} onClick={() => setForm({...form, skill: s})} className={`py-4 rounded-2xl text-[10px] font-black border-2 transition-all ${form.skill === s ? 'bg-cyan-600 border-cyan-400 text-black shadow-lg scale-105' : 'bg-slate-900 border-white/5 text-slate-600'}`}>{s}</button>
               ))}
             </div>

             <div className="p-4 bg-cyan-600/5 border border-cyan-600/10 rounded-2xl flex items-start gap-4 mt-6">
                <input type="checkbox" checked={form.lgpd} onChange={e => setForm({...form, lgpd: e.target.checked})} className="mt-1 w-5 h-5 accent-cyan-600" id="lgpd" />
                <label htmlFor="lgpd" className="text-[9px] font-bold text-slate-500 uppercase leading-tight italic">Autorizo o uso dos dados para fins educacionais e de geração de renda (LGPD).</label>
             </div>

             <button onClick={startVerification} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-[0_0_30px_rgba(34,211,238,0.3)] sticky bottom-0 active:scale-95 transition-all">Finalizar Dossiê</button>
             <button onClick={() => setAuthMode('login')} className="w-full text-center text-slate-500 font-black text-[9px] uppercase mt-4 tracking-widest">Já possuo acesso</button>
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
    showToast(`Habilidade Desbloqueada: ${activeLesson.title}`, 'success');
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
      
      {activeLesson && (
        <div className="fixed inset-0 z-[1000] bg-slate-950 p-8 overflow-y-auto animate-in pb-40">
          <header className="flex justify-between items-center mb-12">
            <button onClick={() => setActiveLesson(null)} className="text-cyan-600 font-black uppercase text-[10px] bg-white/5 px-6 py-3 rounded-full"><i className="fa-solid fa-arrow-left mr-2"></i> Voltar</button>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{activeLesson.duration}</span>
          </header>
          <h2 className="text-4xl font-black italic uppercase mb-8 tracking-tighter leading-tight">{activeLesson.title}</h2>
          
          <div className="space-y-10">
             <div className="space-y-4">
                <span className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.4em]">Teoria de Mercado</span>
                <p className="text-lg font-bold text-slate-300 italic border-l-4 border-cyan-600 pl-8 leading-relaxed">"{activeLesson.theory}"</p>
             </div>

             <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 space-y-4">
                <span className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.4em]">Desafio de Campo</span>
                <p className="text-sm font-bold text-slate-400">{activeLesson.challenge}</p>
             </div>
          </div>

          <div className="fixed bottom-10 left-8 right-8 max-w-2xl mx-auto">
            <button onClick={handleCompleteLesson} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-xs rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.2)]">Validar Conhecimento</button>
          </div>
        </div>
      )}

      {view === 'mei' && <MeiPortal onBack={() => setView('home')} />}

      <header className="px-8 py-10 flex justify-between items-end border-b border-white/5 sticky top-0 bg-slate-950/90 backdrop-blur-2xl z-50">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-[0.85]">GUIA <span className="text-cyan-600">DIGITAL</span></h1>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] mt-2">{profile.neighborhood}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-base font-black text-cyan-500 italic leading-none">{xp} <span className="text-[9px] opacity-40">XP</span></div>
          <div className="text-[8px] font-black text-slate-700 uppercase tracking-widest mt-1">Nível {Math.floor(xp/1000) + 1}</div>
        </div>
      </header>

      <main className="flex-1 px-6 pt-10 pb-48 max-w-2xl mx-auto w-full space-y-12">
        {view === 'home' && !selectedModule && (
          <div className="space-y-12 animate-in">
            <div onClick={() => setView('mei')} className="bg-cyan-600 p-8 rounded-[48px] text-black space-y-4 active:scale-[0.98] transition-all shadow-[0_0_50px_rgba(34,211,238,0.2)] relative overflow-hidden group">
               <div className="absolute -right-6 -bottom-6 text-9xl text-black/10 group-hover:scale-110 transition-transform"><i className="fa-solid fa-rocket"></i></div>
               <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter">TORNE-SE MEI: <br/>TIRE SEU SONHO DO PAPEL</h2>
               <p className="text-xs font-bold uppercase italic opacity-80">Guia passo a passo para seu CNPJ.</p>
            </div>

            <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Caminho de <span className="text-cyan-600">Formação</span></h2>
            <div className="space-y-6">
              {INITIAL_MODULES.map(module => (
                <div key={module.id} onClick={() => setSelectedModule(module)} className="p-8 rounded-[48px] bg-white/5 border-2 border-white/5 active:scale-[0.98] transition-all hover:bg-white/10 shadow-2xl">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center text-2xl border border-cyan-500/20"><i className={`fa-solid ${module.icon}`}></i></div>
                     <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.3em] italic">{module.technicalSkill}</span>
                  </div>
                  <h3 className="text-xl font-black uppercase italic mb-2 tracking-tighter">{module.title}</h3>
                  <p className="text-[11px] text-slate-500 font-bold mb-6 leading-tight uppercase italic">{module.description}</p>
                  <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-cyan-600 shadow-[0_0_15px_#22d3ee] transition-all duration-1000" style={{ width: `${Object.keys(progress).filter(id => module.lessons.some(l => l.id === id)).length * (100 / module.lessons.length)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedModule && (
          <div className="animate-in space-y-12">
             <button onClick={() => setSelectedModule(null)} className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full hover:text-white transition-all"><i className="fa-solid fa-arrow-left"></i> Voltar Painel</button>
             <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-[0.8]">{selectedModule.title}</h2>
             <div className="space-y-5">
               {selectedModule.lessons.map(lesson => (
                 <div key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`p-8 rounded-[40px] border-2 transition-all active:scale-95 flex items-center justify-between ${progress[lesson.id] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10 shadow-xl'}`}>
                    <div className="flex-1">
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-2">{lesson.title}</h4>
                      <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest bg-cyan-600/10 px-3 py-1 rounded-full border border-cyan-500/10">+{lesson.xpValue} XP</span>
                    </div>
                    {progress[lesson.id] ? <i className="fa-solid fa-circle-check text-emerald-500 text-3xl"></i> : <i className="fa-solid fa-chevron-right text-slate-700"></i>}
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
                <button onClick={() => { setActiveTool(null); setToolResult(null); }} className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-2 bg-white/5 px-6 py-3 rounded-full"><i className="fa-solid fa-arrow-left"></i> Voltar Arsenal</button>
                <AIToolRunner tool={activeTool} userProfile={profile} onComplete={setToolResult} />
                {toolResult && (
                  <div className="bg-slate-900 p-8 rounded-[40px] border-2 border-cyan-500/20 animate-in relative shadow-2xl">
                    <button onClick={() => { navigator.clipboard.writeText(toolResult); showToast("Copiado!", "success"); }} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><i className="fa-solid fa-copy"></i></button>
                    <div className="text-sm font-bold leading-relaxed text-slate-300 italic whitespace-pre-wrap">{toolResult}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {IA_TOOLS.map(tool => (
                  <button key={tool.id} onClick={() => setActiveTool(tool)} className="p-10 rounded-[56px] bg-white/5 border-2 border-white/5 text-left active:scale-[0.98] transition-all hover:bg-white/10 flex items-center gap-8 shadow-xl">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-4xl text-cyan-600 shadow-inner border border-white/5"><i className={`fa-solid ${tool.icon}`}></i></div>
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
            <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter">Mural de <span className="text-cyan-600">Renda</span></h2>
            <div className="p-12 border-2 border-dashed border-white/5 rounded-[56px] text-center space-y-6">
               <i className="fa-solid fa-box-open text-6xl text-slate-800"></i>
               <p className="text-slate-500 uppercase font-black text-[10px] italic tracking-[0.3em]">Aguardando conexões no seu bairro...</p>
               <p className="text-[11px] font-bold text-slate-600 uppercase">Complete mais módulos para desbloquear oportunidades reais.</p>
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="animate-in space-y-12 text-center pt-10">
             <div className="relative inline-block">
               <div className="w-48 h-48 bg-slate-900 rounded-[64px] mx-auto flex items-center justify-center border-4 border-cyan-600 relative shadow-2xl">
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-black font-black border-8 border-slate-950">LV.{Math.floor(xp/1000) + 1}</div>
                  <i className="fa-solid fa-user-ninja text-7xl opacity-20"></i>
               </div>
             </div>
             <div>
               <h3 className="text-4xl font-black uppercase italic leading-none tracking-tighter">{profile.name}</h3>
               <p className="text-[11px] font-black text-cyan-600 uppercase italic mt-4 tracking-[0.4em]">{profile.neighborhood} • {profile.class}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                   <p className="text-[9px] font-black text-slate-700 uppercase mb-2">TELEFONE</p>
                   <p className="text-xs font-black italic">{profile.phone}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                   <p className="text-[9px] font-black text-slate-700 uppercase mb-2">CPF</p>
                   <p className="text-xs font-black italic">{profile.cpf}</p>
                </div>
             </div>

             <button onClick={() => { localStorage.removeItem('guia_current_user'); window.location.reload(); }} className="w-full py-6 text-rose-500/60 font-black uppercase text-[10px] tracking-[0.4em] border-2 border-rose-500/10 rounded-[32px] mt-12 hover:text-rose-500 hover:border-rose-500 transition-all">Encerrar Sessão</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 p-8 z-[1000] pointer-events-none">
        <div className="max-w-md mx-auto h-24 rounded-[48px] flex justify-around items-center px-8 glass-panel pointer-events-auto shadow-[0_-20px_60px_rgba(0,0,0,0.8)] border border-white/10">
          {[
            { id: 'home', icon: 'fa-graduation-cap', label: 'CURSOS' },
            { id: 'tools', icon: 'fa-bolt-lightning', label: 'ARSENAL' },
            { id: 'jobs', icon: 'fa-briefcase', label: 'MURAL' },
            { id: 'profile', icon: 'fa-id-card-clip', label: 'PERFIL' }
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id as any); setSelectedModule(null); triggerVibration('light'); }} className={`flex flex-col items-center justify-center gap-2 transition-all ${view === item.id ? 'text-cyan-500 scale-110' : 'text-slate-700'}`}>
              <i className={`fa-solid ${item.icon} text-2xl`}></i>
              <span className={`text-[8px] font-black uppercase tracking-widest ${view === item.id ? 'opacity-100 italic' : 'opacity-40'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
