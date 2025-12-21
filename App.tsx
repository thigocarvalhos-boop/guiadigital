import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MODULES } from './constants.tsx';
import { UserProfile, Module, Lesson, QuizQuestion, LessonProgress, AIReview, PortfolioItem, LessonState, DeliverableData } from './types.ts';
import { GoogleGenAI } from "@google/genai";
import { initDB, addToUserStore, getUserState } from './db.ts';

const triggerVibration = (type: 'light' | 'success' | 'warning' | 'error') => {
  if (!window.navigator.vibrate) return;
  const patterns = { light: 5, success: [5, 15, 5], warning: [30, 50, 30], error: [100, 50, 100] };
  window.navigator.vibrate(patterns[type] as any);
};

const OfficialLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const containerSizes = { sm: "gap-2", md: "gap-3", lg: "gap-4" };
  const iconSizes = { sm: "w-8 h-8", md: "w-11 h-11", lg: "w-16 h-16" };
  const textSizes = { sm: "text-[10px]", md: "text-lg", lg: "text-2xl" };
  const titleSizes = { sm: "text-[16px]", md: "text-3xl", lg: "text-5xl" };

  return (
    <div className={`flex items-center ${containerSizes[size]} select-none`} aria-hidden="true">
      <div className={`relative ${iconSizes[size]} flex items-center justify-center flex-shrink-0`}>
        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(124,58,237,0.4)]">
          <rect x="15" y="15" width="70" height="70" rx="20" fill="none" stroke="url(#logoGrad)" strokeWidth="10" />
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <path d="M40 35 L 70 50 L 40 65 Z" fill="#f97316" />
        </svg>
      </div>
      <div className="flex flex-col font-black italic tracking-tighter leading-[0.8] text-white">
        <span className={`${textSizes[size]} uppercase opacity-40`}>Guia</span>
        <span className={`${titleSizes[size]} bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent uppercase`}>Digital</span>
      </div>
    </div>
  );
};

const App = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [view, setView] = useState<'home' | 'portfolio' | 'profile'>('home');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [practiceText, setPracticeText] = useState('');
  const [deliverableData, setDeliverableData] = useState<DeliverableData>({
    what_i_did: '', how_i_did: '', deliverable_link: '', results_or_learnings: '', self_assessment: ''
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [readSeconds, setReadSeconds] = useState(0);
  const [currentReview, setCurrentReview] = useState<AIReview | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const load = async () => {
      await initDB();
      const user = localStorage.getItem('guia_user');
      if (user) {
        const state: any = await getUserState(user);
        if (state) {
          setProfile(state.profile);
          setLessonProgress(state.progress || {});
        }
      }
    };
    load();
  }, []);

  const save = async (p: UserProfile, pr: Record<string, LessonProgress>) => {
    setProfile(p);
    setLessonProgress(pr);
    localStorage.setItem('guia_user', p.username);
    await addToUserStore(p.username, { profile: p, progress: pr });
  };

  const startLesson = (lesson: Lesson) => {
    const prog = (lessonProgress[lesson.id] as LessonProgress) || { lessonId: lesson.id, state: 'THEORY' };
    setActiveLesson(lesson);
    setQuizIdx(0);
    setQuizAnswer(null);
    setPracticeText(prog.practiceText || '');
    setDeliverableData(prog.deliverableData || { what_i_did: '', how_i_did: '', deliverable_link: '', results_or_learnings: '', self_assessment: '' });
    setReadSeconds(0);
    setCurrentReview(prog.state === 'PRACTICE_APPROVED' ? prog.practiceReview || null : prog.deliverableReview || null);
    triggerVibration('light');
  };

  useEffect(() => {
    if (activeLesson && (lessonProgress[activeLesson.id] as LessonProgress)?.state === 'THEORY') {
      timerRef.current = window.setInterval(() => setReadSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeLesson, lessonProgress]);

  const updateState = (newState: LessonState) => {
    if (!activeLesson) return;
    const current = (lessonProgress[activeLesson.id] as LessonProgress) || { lessonId: activeLesson.id, state: 'THEORY' };
    const nextProg = { ...current, state: newState, practiceText, deliverableData };
    const nextLessonProgress = { ...lessonProgress, [activeLesson.id]: nextProg };
    save(profile!, nextLessonProgress);
  };

  const handleQuizAnswer = (idx: number) => {
    if (!activeLesson) return;
    setQuizAnswer(idx);
    const correct = activeLesson.quizzes[quizIdx].correctIndex === idx;
    triggerVibration(correct ? 'success' : 'error');
  };

  const nextQuizStep = () => {
    if (!activeLesson) return;
    if (quizAnswer !== activeLesson.quizzes[quizIdx].correctIndex) {
      updateState('THEORY');
      setQuizIdx(0);
      setQuizAnswer(null);
      return;
    }
    if (quizIdx < activeLesson.quizzes.length - 1) {
      setQuizIdx(v => v + 1);
      setQuizAnswer(null);
    } else {
      updateState('QUIZ_APPROVED');
    }
  };

  const runAiAudit = async (type: 'practice' | 'deliverable') => {
    if (!activeLesson || !profile) return;
    setAiLoading(true);
    setCurrentReview(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = "";
      
      if (type === 'practice') {
        prompt = `Aja como um Professor Auditor de Marketing Digital Sênior. Avalie o rigor técnico deste diagnóstico:
        Lição: ${activeLesson.title}
        Desafio: ${activeLesson.challenge}
        Resposta do Aluno: ${practiceText}
        Retorne estritamente JSON: { "verdict": "approved" | "needs_revision", "scores": { "conceptual_mastery_0_3": 0-3, "technical_quality_0_3": 0-3, "strategy_clarity_0_2": 0-2, "professionalism_0_2": 0-2 }, "strengths": [], "weaknesses": [], "actionable_fixes": [], "min_required_rewrite_instructions": "" }`;
      } else {
        prompt = `Aja como Auditor de Ativos de Portfólio. Verifique a evidência prática:
        Atividade: ${activeLesson.title}
        Link do Ativo: ${deliverableData.deliverable_link}
        Dados de Implementação: ${JSON.stringify(deliverableData)}
        Retorne estritamente JSON: { "verdict": "approved" | "needs_revision", "scores": { "execution_0_3": 0-3, "technical_quality_0_3": 0-3, "strategy_clarity_0_2": 0-2, "professionalism_0_2": 0-2 }, "evidence_check": { "evidence_present": true, "evidence_quality": "strong", "what_is_missing": [] }, "portfolio_summary_if_approved": "" }`;
      }

      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });

      const result: AIReview = JSON.parse(resp.text || '{}');
      setCurrentReview(result);
      
      const isApproved = result.verdict === 'approved';
      let nextState: LessonState = (lessonProgress[activeLesson.id] as LessonProgress).state;

      if (isApproved) {
        nextState = type === 'practice' ? 'PRACTICE_APPROVED' : 'COMPLETED';
      }
      
      const nextProg = { 
        ...lessonProgress[activeLesson.id], 
        state: nextState, 
        [type === 'practice' ? 'practiceReview' : 'deliverableReview']: result,
        practiceText, deliverableData
      };

      if (isApproved && type === 'deliverable') {
        const item: PortfolioItem = {
          id: `p-${Date.now()}`,
          lessonTitle: activeLesson.title,
          category: selectedModule?.technicalSkill || 'Digital Expert',
          description: result.portfolio_summary_if_approved || deliverableData.what_i_did.substring(0, 100),
          artifactUrl: deliverableData.deliverable_link,
          approvedAt: Date.now(),
          aiFeedback: result.portfolio_summary_if_approved || ''
        };
        const nextProfile = { ...profile, xp: profile.xp + activeLesson.xpValue, portfolio: [item, ...profile.portfolio] };
        save(nextProfile, { ...lessonProgress, [activeLesson.id]: nextProg });
      } else {
        save(profile, { ...lessonProgress, [activeLesson.id]: nextProg });
      }
      
      triggerVibration(isApproved ? 'success' : 'warning');
    } catch (e) {
      console.error(e);
      alert("Falha na auditoria de rede. Tente novamente.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!profile) return <Onboarding onComplete={(p) => save(p, {})} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Premium */}
      <header className="sticky top-0 z-[100] glass px-6 py-6 flex justify-between items-center border-b border-white/5 neo-glow">
        <OfficialLogo size="sm" />
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">XP ACUMULADO</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black italic text-white tracking-tighter leading-none">{profile.xp.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 pb-48">
        {view === 'home' && !selectedModule && (
          <div className="space-y-16 animate-in">
            <div className="space-y-4">
              <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-none bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent">
                Matriz de <br/><span className="bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent">Mestria</span>
              </h2>
              <p className="text-lg font-bold text-slate-500 uppercase tracking-[0.2em]">Formação Técnica de Alto Impacto.</p>
            </div>
            
            <div className="grid gap-8">
              {MODULES.map(m => {
                const completed = m.lessons.filter(l => (lessonProgress[l.id] as LessonProgress)?.state === 'COMPLETED').length;
                const progressPercent = (completed / m.lessons.length) * 100;
                
                return (
                  <button 
                    key={m.id} 
                    onClick={() => { setSelectedModule(m); triggerVibration('light'); }}
                    className="group relative p-12 glass hover:bg-white/[0.04] transition-all duration-500 text-left overflow-hidden"
                  >
                    <div className="absolute -top-12 -right-12 p-12 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                        <i className={`fa-solid ${m.icon} text-[200px] text-purple-500`}></i>
                    </div>
                    
                    <div className="relative z-10 space-y-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center text-white text-3xl shadow-xl">
                          <i className={`fa-solid ${m.icon}`}></i>
                        </div>
                        <div>
                          <span className="text-[12px] font-black text-purple-400 uppercase tracking-widest block mb-1">
                            {m.technicalSkill}
                          </span>
                          <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{m.title}</h3>
                        </div>
                      </div>

                      <p className="text-xl text-slate-400 font-medium italic leading-relaxed max-w-sm">{m.description}</p>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                           <span className="text-[12px] font-black text-slate-600 uppercase tracking-widest">{completed}/{m.lessons.length} LIÇÕES CONCLUÍDAS</span>
                           <span className="text-lg font-black text-orange-400 italic">{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-1 border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-orange-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${progressPercent}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedModule && !activeLesson && (
          <div className="space-y-12 animate-in">
            <button onClick={() => setSelectedModule(null)} className="text-[12px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-3 hover:text-purple-400">
              <i className="fa-solid fa-arrow-left"></i> Retornar à Matriz
            </button>
            
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-tight border-l-8 border-orange-500 pl-8">{selectedModule.title}</h2>

            <div className="grid gap-6">
              {selectedModule.lessons.map(l => {
                const status = (lessonProgress[l.id] as LessonProgress)?.state || 'LOCKED';
                const isCompleted = status === 'COMPLETED';
                
                return (
                  <button 
                    key={l.id} 
                    onClick={() => startLesson(l)}
                    className={`group w-full p-10 glass border-2 text-left flex items-center justify-between transition-all ${isCompleted ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 hover:border-purple-500/30'}`}
                  >
                    <div className="flex items-center gap-8">
                       <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center text-3xl ${isCompleted ? 'bg-emerald-500/10 text-emerald-500 shadow-lg' : 'bg-slate-900 text-slate-700'}`}>
                          {isCompleted ? <i className="fa-solid fa-check-double"></i> : <i className="fa-solid fa-terminal"></i>}
                       </div>
                       <div className="space-y-2">
                        <h4 className="text-2xl font-black italic uppercase text-slate-100">{l.title}</h4>
                        <div className="flex gap-6">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 italic"><i className="fa-solid fa-hourglass-half mr-2"></i> {l.duration}</span>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400 italic">+{l.xpValue} XP</span>
                        </div>
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-800 group-hover:text-purple-400"></i>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === 'portfolio' && (
          <div className="space-y-16 animate-in">
             <div className="space-y-4">
                <h2 className="text-6xl font-black italic uppercase tracking-tighter">Ativos <br/><span className="text-purple-400">Certificados</span></h2>
                <p className="text-lg font-bold text-slate-500 uppercase">Seu capital técnico verificado por IA.</p>
             </div>
             
             {profile.portfolio.length === 0 ? (
               <div className="p-32 glass rounded-[56px] text-center border-dashed border-2 border-white/5 opacity-40">
                  <i className="fa-solid fa-shield-slash text-6xl text-slate-800 mb-8 block"></i>
                  <span className="text-sm font-black uppercase tracking-[0.3em] text-slate-600">Nenhum ativo auditado até o momento.</span>
               </div>
             ) : (
               <div className="grid gap-10">
                 {profile.portfolio.map(item => (
                   <div key={item.id} className="p-12 glass space-y-8 relative overflow-hidden border-white/10 group">
                      <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-purple-600 to-orange-500"></div>
                      <div className="flex justify-between items-start">
                        <div>
                           <span className="text-[11px] font-black text-purple-400 uppercase tracking-widest mb-2 block">{item.category}</span>
                           <h4 className="text-4xl font-black italic uppercase text-white leading-none">{item.lessonTitle}</h4>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                          <i className="fa-solid fa-award text-2xl"></i>
                        </div>
                      </div>
                      <p className="text-xl text-slate-400 font-medium italic leading-relaxed bg-black/30 p-8 rounded-[24px]">{item.description}</p>
                      <a href={item.artifactUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-4 w-full py-8 btn-primary rounded-[28px] text-[13px] tracking-[0.2em]">
                        <i className="fa-solid fa-link"></i> Abrir Ativo Digital
                      </a>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {view === 'profile' && (
          <div className="space-y-24 animate-in py-12">
            <div className="flex flex-col items-center gap-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-purple-500/30 blur-[120px] rounded-full group-hover:bg-orange-500/30 transition-all duration-1000"></div>
                <div className="relative w-56 h-56 rounded-[72px] glass border-2 border-white/10 flex items-center justify-center text-8xl text-purple-400 shadow-3xl bg-slate-900/50">
                   <i className="fa-solid fa-user-secret"></i>
                </div>
              </div>
              <div className="text-center space-y-6">
                <h3 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">{profile.name}</h3>
                <div className="flex items-center gap-5 justify-center">
                  <span className="text-[12px] font-black text-purple-400 uppercase tracking-[0.2em] px-8 py-3 rounded-full border border-purple-500/30 bg-purple-500/5">{profile.neighborhood}</span>
                  <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em]">Tier Expert {profile.level}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="glass p-12 rounded-[48px] text-center space-y-4">
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] block">Ranking Regional</span>
                  <div className="text-5xl font-black italic text-white tracking-tighter">#01</div>
               </div>
               <div className="glass p-12 rounded-[48px] text-center space-y-4">
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] block">Skills Seladas</span>
                  <div className="text-5xl font-black italic text-orange-400">{(Object.values(lessonProgress) as LessonProgress[]).filter(p => p.state === 'COMPLETED').length}</div>
               </div>
            </div>

            <button 
              onClick={() => {localStorage.clear(); window.location.reload();}} 
              className="w-full py-10 text-slate-600 font-black uppercase text-[12px] tracking-[0.4em] border border-white/5 rounded-[40px] hover:text-rose-500 transition-all"
            >
              <i className="fa-solid fa-power-off mr-4"></i> Resetar Terminal do Operador
            </button>
          </div>
        )}
      </main>

      {/* Dock Inferior */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[94%] max-w-md z-[1000] pointer-events-none">
        <div className="glass h-28 rounded-[56px] border border-white/10 flex justify-around items-center px-8 pointer-events-auto shadow-2xl bg-slate-950/80">
          {[
            { id: 'home', icon: 'fa-cube', label: 'Nodes' }, 
            { id: 'portfolio', icon: 'fa-box-archive', label: 'Ativos' }, 
            { id: 'profile', icon: 'fa-user-astronaut', label: 'Ego' }
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => { setView(item.id as any); setSelectedModule(null); triggerVibration('light'); }} 
              className={`flex flex-col items-center gap-2 transition-all duration-500 ${view === item.id ? 'text-orange-500 scale-110' : 'text-slate-600'}`}
            >
              <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all ${view === item.id ? 'bg-orange-500/10 shadow-lg' : ''}`}>
                <i className={`fa-solid ${item.icon} text-3xl`}></i>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Lesson View Overlay */}
      {activeLesson && (
        <div className="fixed inset-0 z-[5000] bg-slate-950 animate-in overflow-y-auto pb-48">
          <header className="sticky top-0 p-10 glass flex items-center justify-between z-50 pt-[env(safe-area-inset-top)]">
            <button onClick={() => setActiveLesson(null)} className="w-16 h-16 rounded-[24px] glass flex items-center justify-center text-2xl">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="flex-1 px-12 text-center space-y-4">
              <h2 className="text-[11px] font-black uppercase italic tracking-[0.5em] text-purple-400">QUALIFICAÇÃO TÉCNICA</h2>
              <div className="flex justify-center gap-2.5">
                {['THEORY', 'QUIZ', 'PRACTICE', 'DELIVERABLE'].map((s, i) => {
                  const states = ['THEORY', 'THEORY_COMPLETED', 'QUIZ_APPROVED', 'PRACTICE_APPROVED', 'COMPLETED'];
                  const currentProg = lessonProgress[activeLesson.id] as LessonProgress;
                  const currIdx = states.indexOf(currentProg?.state || 'THEORY');
                  const isActive = currIdx >= i;
                  return <div key={s} className={`h-2.5 rounded-full transition-all duration-700 ${isActive ? 'w-14 bg-gradient-to-r from-purple-600 to-orange-500 shadow-glow' : 'w-5 bg-slate-900'}`} />;
                })}
              </div>
            </div>
            <div className="w-16" />
          </header>

          <main className="max-w-2xl mx-auto px-10 py-16">
            {(lessonProgress[activeLesson.id] as LessonProgress)?.state === 'THEORY' && (
              <div className="space-y-20 animate-in">
                <div className="space-y-12 glass p-14 rounded-[64px] border-l-[12px] border-purple-600 shadow-3xl">
                  <span className="text-[14px] font-black text-purple-400 uppercase tracking-[0.4em]">Fase de Absorção</span>
                  <div className="text-2xl font-semibold italic leading-relaxed text-slate-300 whitespace-pre-wrap">{activeLesson.theory}</div>
                </div>
                
                <div className="pt-10 space-y-8">
                   <div className="flex justify-between px-10">
                     <span className="text-[12px] font-black uppercase text-slate-600 tracking-widest">ESTUDO MÍNIMO: {activeLesson.minReadSeconds}S</span>
                     <span className={`text-[12px] font-black uppercase tracking-widest ${readSeconds >= activeLesson.minReadSeconds ? 'text-emerald-500' : 'text-orange-500'}`}>TEMPO ATUAL: {readSeconds}S</span>
                   </div>
                   <button 
                    disabled={readSeconds < activeLesson.minReadSeconds} 
                    onClick={() => updateState('THEORY_COMPLETED')} 
                    className="w-full py-14 btn-primary rounded-[48px] text-[15px] tracking-[0.5em]"
                   >
                     Iniciar Exame Técnico
                   </button>
                </div>
              </div>
            )}

            {(lessonProgress[activeLesson.id] as LessonProgress)?.state === 'THEORY_COMPLETED' && (
              <div className="space-y-16 animate-in">
                <div className="flex justify-between items-center px-4">
                  <span className="text-[12px] font-black text-purple-400 uppercase tracking-widest">EXAME DE CONCEITOS</span>
                  <span className="text-[12px] font-black text-slate-600 uppercase">{quizIdx + 1} / {activeLesson.quizzes.length}</span>
                </div>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-tight px-4">{activeLesson.quizzes[quizIdx].question}</h3>
                <div className="grid gap-6">
                  {activeLesson.quizzes[quizIdx].options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleQuizAnswer(i)} 
                      className={`w-full p-12 rounded-[40px] border-2 text-left text-2xl font-bold italic transition-all ${quizAnswer === i ? (i === activeLesson.quizzes[quizIdx].correctIndex ? 'border-emerald-500 bg-emerald-500/10' : 'border-orange-500 bg-orange-500/10') : 'border-white/5 glass hover:border-white/20'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {quizAnswer !== null && (
                  <div className="animate-in pt-12 space-y-10">
                    <div className={`p-12 rounded-[48px] text-lg font-bold italic border ${quizAnswer === activeLesson.quizzes[quizIdx].correctIndex ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400' : 'bg-orange-500/5 border-orange-500/30 text-orange-400'}`}>
                      {quizAnswer === activeLesson.quizzes[quizIdx].correctIndex ? activeLesson.quizzes[quizIdx].explanation : 'Incorreto. Reestude a teoria para desbloquear o sistema.'}
                    </div>
                    <button 
                      onClick={nextQuizStep} 
                      className={`w-full py-14 rounded-[48px] font-black uppercase text-[14px] tracking-[0.5em] ${quizAnswer === activeLesson.quizzes[quizIdx].correctIndex ? 'btn-primary' : 'bg-slate-900 text-slate-500'}`}
                    >
                      {quizAnswer === activeLesson.quizzes[quizIdx].correctIndex ? 'Prosseguir Auditoria' : 'Reiniciar Unidade'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {((lessonProgress[activeLesson.id] as LessonProgress)?.state === 'QUIZ_APPROVED' || (currentReview?.verdict === 'needs_revision' && (lessonProgress[activeLesson.id] as LessonProgress)?.state === 'QUIZ_APPROVED')) && (
              <div className="space-y-20 animate-in">
                <div className="glass p-14 rounded-[64px] border-l-[12px] border-purple-600 space-y-10 shadow-3xl">
                  <div className="text-[14px] font-black text-purple-400 uppercase tracking-[0.4em]">Fase de Diagnóstico</div>
                  <p className="text-3xl font-bold italic text-slate-200 leading-relaxed">{activeLesson.challenge}</p>
                </div>
                
                {currentReview?.verdict === 'needs_revision' && currentReview.min_required_rewrite_instructions && (
                  <div className="p-12 bg-orange-950/20 border border-orange-500/30 rounded-[48px] space-y-6">
                    <div className="text-[12px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-4"><i className="fa-solid fa-triangle-exclamation"></i> CORREÇÃO EXIGIDA PELA IA:</div>
                    <p className="text-lg font-bold italic text-orange-200 leading-relaxed">{currentReview.min_required_rewrite_instructions}</p>
                  </div>
                )}

                <div className="space-y-8">
                  <textarea 
                    value={practiceText} 
                    onChange={e => setPracticeText(e.target.value)} 
                    className="w-full h-[400px] glass border-2 border-white/10 rounded-[56px] p-14 text-xl font-medium italic focus:border-purple-500/50 outline-none transition-all resize-none leading-relaxed" 
                    placeholder="Redija aqui sua solução técnica..." 
                  />
                  <div className="flex justify-between px-12 text-[12px] font-black uppercase tracking-widest">
                    <span className={practiceText.length < activeLesson.minWordsPractice ? 'text-orange-500' : 'text-emerald-500'}>{practiceText.length} / {activeLesson.minWordsPractice} CARACTERES</span>
                    <span className="text-slate-700 italic">BANCA DE AUDITORIA GEMINI 3.0</span>
                  </div>
                </div>

                <button 
                  disabled={practiceText.length < activeLesson.minWordsPractice || aiLoading} 
                  onClick={() => runAiAudit('practice')} 
                  className="w-full py-14 btn-primary rounded-[48px] font-black text-[15px] tracking-[0.6em] flex items-center justify-center gap-6"
                >
                  {aiLoading ? <i className="fa-solid fa-gear animate-spin text-4xl"></i> : 'Submeter para Auditoria IA'}
                </button>
              </div>
            )}

            {((lessonProgress[activeLesson.id] as LessonProgress)?.state === 'PRACTICE_APPROVED' || (currentReview?.verdict === 'needs_revision' && (lessonProgress[activeLesson.id] as LessonProgress)?.state === 'PRACTICE_APPROVED')) && (
              <div className="space-y-20 animate-in">
                <div className="glass p-14 rounded-[64px] border-l-[12px] border-emerald-600 space-y-10">
                   <div className="text-[14px] font-black text-emerald-500 uppercase tracking-[0.4em]">Submissão de Prova Social</div>
                   <ul className="text-lg font-bold italic text-slate-400 space-y-5 list-none">
                      {activeLesson.deliverableChecklist.map((c, i) => <li key={i} className="flex gap-5"><i className="fa-solid fa-check-circle text-emerald-500 mt-1.5"></i> {c}</li>)}
                   </ul>
                </div>

                <div className="grid gap-12">
                  {[
                    { key: 'what_i_did', label: 'DESCRIÇÃO TÉCNICA DO PROCESSO', placeholder: 'Detalhe cada etapa da sua execução...' },
                    { key: 'deliverable_link', label: 'URL PÚBLICA DO ATIVO (CANVA, NOTION, REELS...)', placeholder: 'https://...' },
                    { key: 'results_or_learnings', label: 'INSIGHTS TÉCNICOS OBTIDOS', placeholder: 'O que essa prática mudou na sua visão?' }
                  ].map(f => (
                    <div key={f.key} className="space-y-5 px-6">
                      <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.4em] ml-10">{f.label}</label>
                      <textarea 
                        value={(deliverableData as any)[f.key]} 
                        onChange={e => setDeliverableData({...deliverableData, [f.key]: e.target.value})} 
                        className="w-full p-12 glass border border-white/10 rounded-[48px] text-lg font-medium italic min-h-[200px] outline-none focus:border-purple-500/40" 
                        placeholder={f.placeholder} 
                      />
                    </div>
                  ))}
                </div>

                <button 
                  disabled={!deliverableData.deliverable_link.includes('http') || aiLoading} 
                  onClick={() => runAiAudit('deliverable')} 
                  className="w-full py-14 btn-primary rounded-[48px] font-black text-[15px] tracking-[0.6em] flex items-center justify-center gap-6"
                >
                  {aiLoading ? <i className="fa-solid fa-wave-square animate-pulse text-4xl"></i> : 'Selar Ativo de Portfólio'}
                </button>
              </div>
            )}

            {currentReview && (
              <div className="mt-24 p-14 glass rounded-[72px] space-y-14 animate-in neo-glow border-white/20">
                <div className="flex justify-between items-center border-b border-white/5 pb-10">
                   <div className="text-[14px] font-black text-purple-400 uppercase tracking-[0.5em]">RELATÓRIO DE AUDITORIA</div>
                   <span className={`px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-widest ${currentReview.verdict === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-orange-500/10 text-orange-500 border border-orange-500/30'}`}>
                      {currentReview.verdict === 'approved' ? 'CERTIFICADO' : 'EM REVISÃO'}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {[
                    { label: 'EXECUÇÃO', score: currentReview.scores.conceptual_mastery_0_3 || currentReview.scores.execution_0_3, max: 3 },
                    { label: 'TÉCNICA', score: currentReview.scores.technical_quality_0_3, max: 3 },
                    { label: 'ESTRATÉGIA', score: currentReview.scores.strategy_clarity_0_2, max: 2 },
                    { label: 'POSTURA', score: currentReview.scores.professionalism_0_2, max: 2 }
                  ].map(s => (
                    <div key={s.label} className="p-10 glass rounded-[40px] text-center space-y-3 bg-black/40">
                       <div className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">{s.label}</div>
                       <div className="text-4xl font-black italic text-orange-400 tracking-tighter">{s.score || 0}<span className="text-lg text-slate-800 ml-1">/{s.max}</span></div>
                    </div>
                  ))}
                </div>

                {currentReview.verdict === 'approved' && currentReview.strengths && (
                  <div className="space-y-10 pt-6">
                    <div className="text-[13px] font-black text-emerald-500 uppercase tracking-[0.4em] border-l-8 border-emerald-500 pl-8">Destaques da Performance:</div>
                    <ul className="space-y-6">
                      {currentReview.strengths.map((s, i) => <li key={i} className="text-lg font-bold text-slate-400 italic flex gap-6 leading-relaxed"><i className="fa-solid fa-square-check text-emerald-500 mt-1.5"></i> {s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {(lessonProgress[activeLesson.id] as LessonProgress)?.state === 'COMPLETED' && (
              <div className="space-y-20 animate-in text-center py-20">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-emerald-500/40 blur-[120px] animate-pulse"></div>
                    <div className="relative w-48 h-48 bg-gradient-to-br from-emerald-500 to-emerald-800 rounded-[64px] flex items-center justify-center text-white text-7xl shadow-3xl">
                        <i className="fa-solid fa-crown"></i>
                    </div>
                </div>
                <div className="space-y-8">
                  <h3 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none">Mestria <br/><span className="text-emerald-500">Arquivada</span></h3>
                  <p className="text-xl font-bold italic text-slate-500 max-w-sm mx-auto leading-relaxed">Seu ativo foi selado e agora faz parte do capital intelectual da sua rede.</p>
                </div>
                <button 
                  onClick={() => setActiveLesson(null)} 
                  className="w-full py-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[15px] tracking-[0.6em] rounded-[56px] shadow-3xl transition-all"
                >
                  Fechar Unidade
                </button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

const Onboarding = ({ onComplete }: { onComplete: (p: UserProfile) => void }) => {
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [username, setUsername] = useState('');
  
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 text-white flex flex-col items-center justify-center p-12 overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/25 blur-[180px] rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-orange-600/15 blur-[180px] rounded-full"></div>
       </div>

       <div className="relative z-10 w-full max-w-lg flex flex-col items-center space-y-20 animate-in">
          <OfficialLogo size="lg" />
          
          <div className="w-full space-y-12">
            <div className="text-center space-y-6">
                <h2 className="text-sm font-black uppercase tracking-[0.6em] text-slate-700">INICIALIZAR TERMINAL</h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-purple-600 to-orange-500 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-10">
              {[
                { val: name, set: setName, label: 'NOME COMPLETO', icon: 'fa-user-pen' },
                { val: neighborhood, set: setNeighborhood, label: 'ZONA DE OPERAÇÃO', icon: 'fa-map-pin' },
                { val: username, set: setUsername, label: 'ID ACADÊMICO ÚNICO', icon: 'fa-barcode', lower: true }
              ].map(f => (
                <div key={f.label} className="space-y-4">
                  <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.4em] ml-10">{f.label}</label>
                  <div className="relative">
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 text-purple-400/40 text-2xl">
                      <i className={`fa-solid ${f.icon}`}></i>
                    </div>
                    <input 
                      autoComplete="off"
                      className={`w-full py-10 pl-24 pr-12 rounded-[48px] glass border-2 border-white/5 text-2xl font-black outline-none focus:border-purple-500/60 focus:bg-white/[0.05] transition-all ${f.lower ? 'lowercase' : 'uppercase'}`}
                      value={f.val} 
                      onChange={e => f.set(e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            disabled={!name || !username || !neighborhood} 
            onClick={() => onComplete({ name, neighborhood, username, level: 1, joinedAt: Date.now(), xp: 0, portfolio: [] })} 
            className="w-full py-14 btn-primary rounded-[56px] font-black uppercase text-[16px] tracking-[0.7em] disabled:opacity-10 transition-all shadow-4xl"
          >
            Sincronizar Acesso
          </button>
       </div>
    </div>
  );
};

export default App;
