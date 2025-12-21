
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

// --- Fluxo de Onboarding, LGPD e Verificação ---

const Onboarding = ({ onComplete }: { onComplete: (p: UserProfile, xp: number, progress: any, applications: string[]) => void }) => {
  const [phase, setPhase] = useState<'manifesto' | 'auth' | 'fields' | 'verification' | 'pending'>('manifesto');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [form, setForm] = useState({ 
    username: '', password: '', name: '', neighborhood: '', skill: '', 
    age: '', class: '', rg: '', cpf: '', email: '', lgpd: false 
  });
  const [verificationInput, setVerificationInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');

  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleAuth = () => {
    if (!form.username || !form.password) { setError('Preencha os campos de acesso'); return; }
    const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
    
    if (authMode === 'login') {
      const user = users[form.username];
      if (user && user.profile.password === form.password) {
        if (user.profile.status === 'pending') {
          setPhase('pending');
        } else {
          onComplete(user.profile, user.totalXP || 0, user.lessonProgress || {}, user.appliedJobs || []);
        }
      } else { setError('Matrícula não encontrada ou senha incorreta'); }
    } else {
      if (users[form.username]) { setError('Nome de usuário já está em uso'); } else { setPhase('fields'); }
    }
  };

  const startVerification = () => {
    if (!form.name || !form.class || !form.email || !form.cpf || !form.rg) {
       setError('Todos os campos da ficha são obrigatórios');
       return;
    }
    if (!form.lgpd) {
       setError('Você precisa aceitar os termos da LGPD para continuar');
       return;
    }
    
    const code = generateCode();
    setGeneratedCode(code);
    setError('');
    
    // Simulação de Envio de E-mail para o Aluno e para o Instituto
    console.log(`%c SISTEMA GUIA SOCIAL: ENVIANDO CÓDIGO ${code} PARA ${form.email}`, "color: #22d3ee; font-weight: bold;");
    console.log(`%c DOSSIÊ DE MATRÍCULA ENVIADO PARA: institutoguiasocial@gmail.com`, "color: #10b981; font-weight: bold;");
    
    setPhase('verification');
  };

  const confirmVerification = () => {
    if (verificationInput === generatedCode) {
      const profile: UserProfile = { 
        ...form, 
        level: 1, 
        joinedAt: Date.now(), 
        status: 'pending',
        isVerified: true,
        lgpdAccepted: true,
        verificationCode: generatedCode
      };
      
      const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
      users[form.username] = { profile, totalXP: 0, lessonProgress: {}, appliedJobs: [] };
      localStorage.setItem('guia_users_db', JSON.stringify(users));
      
      setPhase('pending');
      triggerVibration('success');
    } else {
      setError('Código de validação incorreto. Tente novamente.');
      triggerVibration('warning');
    }
  };

  if (phase === 'manifesto') {
    return (
      <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col p-10 justify-center animate-in overflow-y-auto">
        <div className="space-y-12 max-w-sm mx-auto">
          <div className="w-20 h-2 bg-cyan-600 rounded-full shadow-[0_0_25px_#22d3ee]"></div>
          <h2 className="text-6xl font-black italic uppercase text-white leading-[0.8] tracking-tighter">MANIFESTO <br/><span className="text-cyan-600 tracking-normal">GUIA SOCIAL</span></h2>
          <div className="space-y-8 text-slate-400 font-bold text-sm leading-relaxed border-l-4 border-white/5 pl-8 italic">
            <p>1. O Guia Digital é um sistema operacional de mobilidade econômica.</p>
            <p>2. Seus dados estão protegidos; sua privacidade é nossa prioridade técnica.</p>
            <p>3. Do bairro para o mundo: Transformamos talentos em renda real.</p>
          </div>
          <button onClick={() => setPhase('auth')} className="w-full py-6 bg-cyan-600 text-slate-950 font-black uppercase tracking-[0.3em] text-[10px] rounded-3xl active:scale-95 shadow-xl transition-all">Acessar Sistema</button>
        </div>
      </div>
    );
  }

  if (phase === 'verification') {
    return (
      <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col p-8 justify-center animate-in text-center">
        <div className="max-w-sm mx-auto w-full space-y-8">
          <div className="w-24 h-24 rounded-3xl bg-cyan-600/10 border-2 border-cyan-500/20 mx-auto flex items-center justify-center text-4xl text-cyan-500">
            <i className="fa-solid fa-envelope-shield"></i>
          </div>
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">Validação de <br/>Segurança</h2>
          <p className="text-slate-400 font-bold text-sm leading-relaxed">
            Enviamos um código de 6 dígitos para <span className="text-cyan-500">{form.email}</span>. 
            Insira-o abaixo para validar sua identidade digital.
          </p>
          {error && <p className="text-rose-500 text-[10px] font-black uppercase bg-rose-500/10 p-3 rounded-xl">{error}</p>}
          
          <input 
            className="w-full bg-slate-900 border-2 border-white/5 p-6 rounded-3xl text-white text-3xl text-center outline-none focus:border-cyan-600 font-black tracking-[0.5em]" 
            placeholder="000000"
            maxLength={6}
            value={verificationInput}
            onChange={e => setVerificationInput(e.target.value)}
          />

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
             <p className="text-[9px] font-black text-slate-500 uppercase italic">
               DICA: Verifique sua caixa de entrada e spam. <br/>
               Simulação: O código é <span className="text-cyan-600">{generatedCode}</span>
             </p>
          </div>

          <button onClick={confirmVerification} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-2xl">Validar Matrícula</button>
        </div>
      </div>
    );
  }

  if (phase === 'pending') {
    return (
      <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col p-10 justify-center animate-in text-center">
        <div className="space-y-8 max-w-sm mx-auto">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 mx-auto flex items-center justify-center text-4xl text-emerald-500">
            <i className="fa-solid fa-check-double"></i>
          </div>
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">Matrícula <br/>Protocolada</h2>
          <p className="text-slate-400 font-bold text-sm leading-relaxed px-4">
            Seu dossiê completo foi enviado para o Instituto. Seus dados estão protegidos sob a <span className="text-cyan-500">LGPD</span>. 
            Aguarde a liberação do seu mentor presencial.
          </p>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-left space-y-3">
             <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase">
                <i className="fa-solid fa-lock text-cyan-600"></i> Proteção LGPD Ativa
             </div>
             <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase">
                <i className="fa-solid fa-paper-plane text-cyan-600"></i> Dossiê em: institutoguiasocial@gmail.com
             </div>
          </div>
          <button onClick={() => setPhase('auth')} className="text-[10px] font-black uppercase text-slate-600 underline tracking-widest">Voltar para Início</button>
          
          <button onClick={() => {
            const users = JSON.parse(localStorage.getItem('guia_users_db') || '{}');
            if (users[form.username]) {
              users[form.username].profile.status = 'active';
              localStorage.setItem('guia_users_db', JSON.stringify(users));
              onComplete(users[form.username].profile, 0, {}, []);
            }
          }} className="mt-20 opacity-0 active:opacity-20 text-[8px] font-black uppercase">[Simular Aprovação do Admin]</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col p-8 justify-center animate-in">
       <div className="max-w-sm mx-auto w-full space-y-8">
         <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">{phase === 'auth' ? 'Terminal de Acesso' : 'Dossiê de Matrícula'}</h2>
         {error && <p className="text-rose-500 text-[10px] font-black uppercase bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}
         
         {phase === 'auth' ? (
           <div className="space-y-4">
             <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none focus:border-cyan-600 uppercase font-black" placeholder="NOME DE USUÁRIO" value={form.username} onChange={e => setForm({...form, username: e.target.value.toLowerCase()})} />
             <input type="password" className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none focus:border-cyan-600 uppercase font-black" placeholder="SENHA DE ACESSO" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
             <button onClick={handleAuth} className="w-full py-6 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-2xl"> {authMode === 'signup' ? 'Novo Cadastro' : 'Conectar'} </button>
             <button onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')} className="w-full text-center text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] mt-4">{authMode === 'signup' ? 'Já sou matriculado' : 'Desejo me cadastrar'}</button>
           </div>
         ) : (
           <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-4 custom-scrollbar">
             <div className="space-y-4 pb-8">
               <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block pl-2">Identidade e Turma</span>
               <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none uppercase font-black" placeholder="NOME COMPLETO" value={form.name} onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} />
               
               <div className="grid grid-cols-2 gap-3">
                 <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none uppercase font-black" placeholder="IDADE" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
                 <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none uppercase font-black" placeholder="TURMA" value={form.class} onChange={e => setForm({...form, class: e.target.value.toUpperCase()})} />
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none uppercase font-black" placeholder="RG" value={form.rg} onChange={e => setForm({...form, rg: e.target.value})} />
                 <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none uppercase font-black" placeholder="CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
               </div>

               <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none font-black" placeholder="E-MAIL PESSOAL" value={form.email} onChange={e => setForm({...form, email: e.target.value.toLowerCase()})} />
               <input className="w-full bg-slate-900 border-2 border-white/5 p-5 rounded-3xl text-white text-sm outline-none uppercase font-black" placeholder="BAIRRO" value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value.toUpperCase()})} />

               <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block mt-6 pl-2">Vocações Digitais</span>
               <div className="grid grid-cols-2 gap-3">
                 {['DESIGN', 'VENDAS', 'SOCIAL', 'TECH'].map(s => (
                   <button key={s} onClick={() => setForm({...form, skill: s})} className={`py-5 rounded-2xl text-[10px] font-black border-2 transition-all ${form.skill === s ? 'bg-cyan-600 border-cyan-400 text-black shadow-lg scale-[1.02]' : 'bg-slate-900 border-white/5 text-slate-600'}`}>{s}</button>
                 ))}
               </div>

               <div className="mt-8 p-6 bg-cyan-600/5 border-2 border-cyan-600/10 rounded-3xl space-y-4">
                  <div className="flex items-start gap-4">
                    <input 
                      type="checkbox" 
                      id="lgpd" 
                      className="mt-1 w-5 h-5 rounded-lg accent-cyan-600"
                      checked={form.lgpd}
                      onChange={e => setForm({...form, lgpd: e.target.checked})}
                    />
                    <label htmlFor="lgpd" className="text-[10px] font-bold text-slate-400 leading-tight uppercase italic">
                      Declaro que aceito o processamento dos meus dados pessoais pelo Instituto Guia Social, para fins educacionais e de geração de renda, conforme as normas da <span className="text-cyan-500 font-black">LGPD</span>.
                    </label>
                  </div>
               </div>
             </div>
             
             <button onClick={startVerification} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-2xl sticky bottom-0">Verificar E-mail</button>
           </div>
         )}
       </div>
    </div>
  );
};

// --- Arsenal de IA Consertado ---

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

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      onComplete(response.text || "Sem resposta do núcleo.");
    } catch (err) {
      console.error(err);
      onComplete("ERRO TÉCNICO: O Arsenal está em manutenção ou sem conexão com a rede.");
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-[40px] border border-white/5 space-y-6 shadow-2xl animate-in">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 flex items-center justify-center text-2xl text-cyan-500 border border-cyan-500/20"><i className={`fa-solid ${tool.icon}`}></i></div>
        <div>
          <h3 className="font-black uppercase text-xs tracking-widest leading-none">{tool.name}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 italic">Nível de Acesso {tool.minLevel}</p>
        </div>
      </div>
      <textarea className="w-full bg-black border-2 border-white/5 p-6 rounded-3xl text-sm text-white outline-none focus:border-cyan-600 min-h-[160px] font-bold" placeholder="Digite os dados ou objetivo para processamento..." value={input} onChange={e => setInput(e.target.value)} />
      <button disabled={loading || !input} onClick={runTool} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-xs tracking-[0.2em] rounded-3xl disabled:opacity-20 active:scale-95 transition-all shadow-[0_0_40px_rgba(34,211,238,0.3)]">
        {loading ? <i className="fa-solid fa-circle-notch animate-spin text-xl"></i> : 'Ativar Inteligência'}
      </button>
    </div>
  );
};

// Componente para visualização de aulas e realização de quizzes.
const LessonView = ({ lesson, onBack, onComplete }: { lesson: Lesson, onBack: () => void, onComplete: () => void }) => {
  const [step, setStep] = useState<'theory' | 'challenge' | 'quiz'>('theory');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'none' | 'correct' | 'wrong'>('none');

  const handleQuizSubmit = () => {
    if (selectedOption === lesson.quiz.correctIndex) {
      setQuizResult('correct');
      triggerVibration('success');
    } else {
      setQuizResult('wrong');
      triggerVibration('warning');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col animate-in overflow-y-auto pb-32">
      <header className="px-8 py-10 flex items-center gap-6 border-b border-white/5 sticky top-0 bg-slate-950/90 backdrop-blur-2xl z-50">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400"><i className="fa-solid fa-chevron-left"></i></button>
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none">{lesson.title}</h2>
          <p className="text-[10px] text-cyan-600 font-black uppercase tracking-widest mt-1">Nível de Especialista</p>
        </div>
      </header>

      <main className="px-8 py-12 space-y-12 max-w-2xl mx-auto w-full">
        {step === 'theory' && (
          <div className="space-y-10 animate-in">
            <div className="space-y-6">
              <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.4em] block">01. Fundamento Teórico</span>
              <p className="text-lg font-bold leading-relaxed text-slate-300 italic border-l-4 border-cyan-600 pl-8">"{lesson.theory}"</p>
            </div>
            <div className="space-y-6">
              <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.4em] block">Checklist de Estudo</span>
              <div className="space-y-3">
                {lesson.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5">
                    <div className="w-6 h-6 rounded-full border-2 border-cyan-600 flex items-center justify-center"><i className="fa-solid fa-check text-[10px] text-cyan-600"></i></div>
                    <span className="text-xs font-black uppercase text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setStep('challenge')} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-xs tracking-widest rounded-3xl shadow-2xl">Próxima Etapa</button>
          </div>
        )}

        {step === 'challenge' && (
          <div className="space-y-10 animate-in">
            <div className="space-y-6">
              <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.4em] block">02. Desafio Prático</span>
              <div className="p-10 bg-cyan-600/10 border-2 border-cyan-500/20 rounded-[48px] shadow-2xl">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-6 leading-tight">Missão de <br/>Campo</h3>
                <p className="text-sm font-bold text-slate-300 leading-relaxed mb-8">{lesson.challenge}</p>
                <div className="flex items-center gap-4 text-[10px] font-black text-cyan-500 uppercase bg-black/40 px-6 py-3 rounded-full border border-white/5 w-fit">
                  <i className="fa-solid fa-triangle-exclamation"></i> Requer Atenção aos Detalhes
                </div>
              </div>
            </div>
            <button onClick={() => setStep('quiz')} className="w-full py-6 bg-cyan-600 text-black font-black uppercase text-xs tracking-widest rounded-3xl shadow-2xl">Ir para o Quiz</button>
          </div>
        )}

        {step === 'quiz' && (
          <div className="space-y-10 animate-in">
            <div className="space-y-6">
              <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.4em] block">03. Validação de Conhecimento</span>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-tight">{lesson.quiz.question}</h3>
            </div>
            
            <div className="space-y-4">
              {lesson.quiz.options.map((opt, idx) => (
                <button 
                  key={idx} 
                  onClick={() => quizResult === 'none' && setSelectedOption(idx)}
                  className={`w-full p-8 rounded-[32px] text-left border-2 transition-all font-black uppercase text-xs tracking-widest ${
                    selectedOption === idx ? 'bg-cyan-600 border-cyan-400 text-black' : 'bg-white/5 border-white/5 text-slate-400'
                  } ${quizResult === 'correct' && idx === lesson.quiz.correctIndex ? 'bg-emerald-500 border-emerald-400 text-black' : ''} ${quizResult === 'wrong' && selectedOption === idx && idx !== lesson.quiz.correctIndex ? 'bg-rose-500 border-rose-400 text-white' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {quizResult === 'none' ? (
              <button disabled={selectedOption === null} onClick={handleQuizSubmit} className="w-full py-6 bg-white text-black font-black uppercase text-xs tracking-widest rounded-3xl shadow-2xl disabled:opacity-20">Verificar Resposta</button>
            ) : (
              <div className="space-y-8 animate-in">
                <div className={`p-8 rounded-[32px] border-2 ${quizResult === 'correct' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3">{quizResult === 'correct' ? 'EXCELENTE!' : 'TENTE NOVAMENTE'}</p>
                  <p className="text-sm font-bold text-slate-300 italic">"{lesson.quiz.explanation}"</p>
                </div>
                {quizResult === 'correct' ? (
                  <button onClick={onComplete} className="w-full py-6 bg-emerald-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)]">Finalizar e Ganhar XP</button>
                ) : (
                  <button onClick={() => { setQuizResult('none'); setSelectedOption(null); }} className="w-full py-6 bg-white/5 text-white font-black uppercase text-xs tracking-widest rounded-3xl border border-white/10">Refazer Teste</button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
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
    showToast(`Habilidade Desbloqueada: ${activeLesson.title}`, 'success');
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
        setProfile(data.profile); setXp(data.totalXP || 0); setProgress(data.lessonProgress || {}); setAppliedJobs(data.appliedJobs || []); 
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
          <div className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-1 italic">Matrícula Ativa</div>
        </div>
      </header>

      <main className="flex-1 px-6 pt-10 pb-48 max-w-2xl mx-auto w-full space-y-12">
        {view === 'home' && !selectedModule && (
          <div className="space-y-12 animate-in">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Caminho de <span className="text-cyan-600">Formação</span></h2>
            <div className="space-y-6">
              {INITIAL_MODULES.map(module => {
                const doneCount = module.lessons.filter(l => progress[l.id]).length;
                const totalCount = module.lessons.length;
                const isLocked = module.id !== '1' && !INITIAL_MODULES.find(m => m.id === (parseInt(module.id)-1).toString())?.lessons.every(l => progress[l.id]);
                return (
                  <div key={module.id} onClick={() => !isLocked && setSelectedModule(module)} className={`p-8 rounded-[48px] border-2 transition-all relative overflow-hidden ${isLocked ? 'opacity-20 grayscale cursor-not-allowed shadow-none' : 'bg-white/5 border-white/5 active:scale-[0.98] shadow-2xl'}`}>
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
             <button onClick={() => setSelectedModule(null)} className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full hover:text-white transition-all"><i className="fa-solid fa-arrow-left"></i> Voltar Dashboard</button>
             <div className="space-y-4">
                <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-[0.8]">{selectedModule.title}</h2>
                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.3em]">Módulos de Especialista</span>
             </div>
             <div className="space-y-5">
               {selectedModule.lessons.map((lesson, idx) => (
                 <div key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`p-8 rounded-[40px] border-2 transition-all active:scale-95 ${progress[lesson.id] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-center mb-6">
                       <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${progress[lesson.id] ? 'text-emerald-500' : 'text-cyan-600'}`}>Unit 0{idx+1}</span>
                       {progress[lesson.id] && <i className="fa-solid fa-circle-check text-emerald-500 text-xl"></i>}
                    </div>
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-6">{lesson.title}</h4>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase bg-black/40 px-3 py-1.5 rounded-full"><i className="fa-regular fa-clock text-[8px]"></i> {lesson.duration}</div>
                       <div className="flex items-center gap-2 text-[9px] font-black text-cyan-600 uppercase bg-cyan-600/10 px-3 py-1.5 rounded-full border border-cyan-500/20">+{lesson.xpValue} XP</div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {view === 'tools' && (
          <div className="animate-in space-y-12">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Arsenal de <span className="text-cyan-600">Trabalho</span></h2>
            {activeTool ? (
              <div className="space-y-8">
                <button onClick={() => { setActiveTool(null); setToolResult(null); }} className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-2"><i className="fa-solid fa-arrow-left"></i> Voltar ferramentas</button>
                <AIToolRunner tool={activeTool} userProfile={profile} onComplete={setToolResult} />
                {toolResult && (
                  <div className="bg-slate-900 p-8 rounded-[40px] border-2 border-cyan-500/20 animate-in shadow-2xl relative">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-600">Conteúdo Inteligente</span>
                      <button onClick={() => { navigator.clipboard.writeText(toolResult); showToast("Texto Copiado!", "success"); }} className="text-slate-500 hover:text-white transition-colors"><i className="fa-solid fa-copy"></i></button>
                    </div>
                    <div className="text-sm font-bold leading-relaxed text-slate-300 whitespace-pre-wrap italic">{toolResult}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {IA_TOOLS.map(tool => (
                  <button key={tool.id} onClick={() => setActiveTool(tool)} className="p-10 rounded-[56px] bg-white/5 border-2 border-white/5 text-left flex items-center gap-8 active:scale-[0.98] transition-all hover:bg-white/10 shadow-xl border border-white/5">
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
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Mural de <span className="text-cyan-600">Renda Real</span></h2>
            <div className="space-y-6">
              {opportunitiesWithMatch.map(opp => (
                <div key={opp.id} className="bg-white/5 p-10 rounded-[56px] border-2 border-white/5 relative overflow-hidden group shadow-2xl">
                  <div className="absolute -top-6 -right-6 p-10 opacity-5"><i className="fa-solid fa-briefcase text-8xl"></i></div>
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block mb-3">{opp.businessName}</span>
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-4">{opp.title}</h4>
                      <div className="flex flex-wrap gap-4">
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">{opp.reward}</span>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full">• {opp.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-3xl font-black text-cyan-500 leading-none">{opp.matchingScore}%</div>
                       <span className="text-[9px] font-black text-slate-700 uppercase block tracking-widest mt-2">Match</span>
                    </div>
                  </div>
                  <button className="w-full py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] transition-all bg-white text-black shadow-2xl active:scale-95">Solicitar Consultoria</button>
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
                      <div className="absolute -top-6 -right-6 w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-black font-black text-lg border-8 border-slate-950">LV.{Math.floor(xp/1000) + 1}</div>
                      <i className="fa-solid fa-user-ninja text-7xl opacity-20"></i>
                   </div>
                </div>
                <div>
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{profile.name}</h3>
                   <p className="text-[11px] font-black text-cyan-600 uppercase tracking-[0.5em] mt-4 opacity-70 italic">{profile.neighborhood} • {profile.class}</p>
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

             <button onClick={() => { localStorage.removeItem('guia_current_user'); window.location.reload(); }} className="w-full py-6 text-rose-500/60 font-black uppercase text-[10px] tracking-[0.4em] border-2 border-rose-500/10 rounded-[32px] hover:text-rose-500 transition-all">Encerrar Sessão Digital</button>
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
