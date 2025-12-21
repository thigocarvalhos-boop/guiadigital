
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
  const scale = { sm: "scale-50", md: "scale-75", lg: "scale-100" };
  return (
    <div className={`flex items-center gap-4 ${scale[size]} origin-left select-none`} aria-hidden="true">
      <div className="relative w-16 h-24 flex items-center justify-center">
        <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-2xl">
          <rect x="5" y="5" width="90" height="150" rx="12" fill="#1e293b" stroke="#22d3ee" strokeWidth="4" />
          <rect x="12" y="15" width="76" height="120" rx="4" fill="#020617" />
          <path d="M40 65 L 65 80 L 40 95 Z" fill="#e91e63" />
        </svg>
      </div>
      <div className="flex flex-col font-black italic tracking-tighter leading-none text-white">
        <span className="text-4xl uppercase">Guia</span>
        <span className="text-5xl text-cyan-500 uppercase">Digital</span>
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
    const prog = lessonProgress[lesson.id] || { lessonId: lesson.id, state: 'THEORY' };
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
    if (activeLesson && lessonProgress[activeLesson.id]?.state === 'THEORY') {
      timerRef.current = window.setInterval(() => setReadSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeLesson, lessonProgress]);

  const updateState = (newState: LessonState) => {
    if (!activeLesson) return;
    const current = lessonProgress[activeLesson.id] || { lessonId: activeLesson.id, state: 'THEORY' };
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
      updateState('THEORY'); // Falha no Quiz volta para Teoria
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
        prompt = `Você é um Professor Avaliador Sênior de Marketing Digital. Avalie com rigor técnico absoluto.
        Título da Lição: ${activeLesson.title}
        Desafio de Escrita Técnica: ${activeLesson.challenge}
        Resposta do Aluno: ${practiceText}
        
        Regras de Auditoria:
        1. Reprove se for vago/generalista (ex.: "marketing é bom para crescer"). Exija profundidade.
        2. Reprove se houver erro conceitual básico.
        3. Exija clareza estratégica e termos profissionais.
        
        Retorne APENAS JSON:
        {
          "verdict": "approved" | "needs_revision",
          "scores": { "conceptual_mastery_0_3": 0-3, "technical_quality_0_3": 0-3, "strategy_clarity_0_2": 0-2, "professionalism_0_2": 0-2 },
          "strengths": ["Lista de pontos positivos"], 
          "weaknesses": ["Onde falhou"], 
          "actionable_fixes": ["O que mudar"],
          "min_required_rewrite_instructions": "Instrução direta para reescrita"
        }`;
      } else {
        prompt = `Você é um Auditor Profissional de Portfólio. Sua tarefa é verificar se o aluno realmente executou o trabalho fora do app e se o entregável tem padrão mínimo de mercado.

        Exercício: ${activeLesson.title}
        Objetivo: ${activeLesson.deliverablePrompt}
        Checklist de Entrega: ${activeLesson.deliverableChecklist.join(', ')}
        Rubrica: ${activeLesson.gradingRubric}

        Submissão do Aluno:
        A) O que fiz: ${deliverableData.what_i_did}
        B) Como fiz: ${deliverableData.how_i_did}
        C) Entregável (link): ${deliverableData.deliverable_link}
        D) Resultado/aprendizado: ${deliverableData.results_or_learnings}
        E) Autoavaliação: ${deliverableData.self_assessment}

        Regras de Decisão:
        1. Sem evidência verificável (link/URL), REPROVAR automaticamente.
        2. Se não cumprir o checklist mínimo ou estiver incoerente, REPROVAR.
        3. Exigir correção prática objetiva.

        Retorne APENAS JSON:
        {
          "verdict": "approved" | "needs_revision",
          "scores": { "execution_0_3": 0-3, "technical_quality_0_3": 0-3, "strategy_clarity_0_2": 0-2, "professionalism_0_2": 0-2 },
          "evidence_check": { "evidence_present": true|false, "evidence_quality": "weak"|"ok"|"strong", "what_is_missing": ["..."] },
          "issues_found": ["..."],
          "required_fixes": ["..."],
          "portfolio_summary_if_approved": "Resumo curto (2-4 linhas) para o portfólio."
        }`;
      }

      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });

      const result: AIReview = JSON.parse(resp.text);
      setCurrentReview(result);
      
      const isApproved = result.verdict === 'approved';
      let nextState: LessonState = lessonProgress[activeLesson.id].state;

      if (isApproved) {
        nextState = type === 'practice' ? 'PRACTICE_APPROVED' : 'COMPLETED';
      } else {
        // Se reprovado no deliverable, volta para PRACTICE_APPROVED (precisa submeter de novo)
        // Se reprovado no practice, volta para QUIZ_APPROVED (precisa reescrever)
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
          category: selectedModule?.technicalSkill || 'Geral',
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
      alert("Falha crítica na auditoria. Verifique sua conexão ou tente novamente.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!profile) return <Onboarding onComplete={(p) => save(p, {})} />;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
      <header className="sticky top-0 z-[100] px-8 py-10 flex justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl">
        <OfficialLogo size="sm" />
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-black italic text-cyan-500 tracking-tighter">{profile.xp} <span className="text-[10px] opacity-40 uppercase tracking-widest">XP</span></div>
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">S.O. Carreira Digital</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 pb-48">
        {view === 'home' && !selectedModule && (
          <div className="space-y-12 animate-in">
            <div className="space-y-2">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Matriz de <span className="text-cyan-500">Mestria</span></h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seu progresso profissional em tempo real.</p>
            </div>
            <div className="grid gap-8">
              {MODULES.map(m => {
                const completed = m.lessons.filter(l => lessonProgress[l.id]?.state === 'COMPLETED').length;
                return (
                  <button key={m.id} onClick={() => { setSelectedModule(m); triggerVibration('light'); }} className="p-10 rounded-[56px] border border-white/5 bg-white/5 text-left hover:bg-white/[0.08] transition-all">
                    <div className="flex justify-between items-start mb-10">
                      <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-3xl"><i className={`fa-solid ${m.icon}`}></i></div>
                      <span className="text-[9px] font-black text-cyan-500 border border-cyan-500/20 px-4 py-1.5 rounded-full uppercase">{m.technicalSkill}</span>
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">{m.title}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase italic opacity-70 mb-8">{m.description}</p>
                    <div className="h-2 bg-black rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 shadow-[0_0_15px_#22d3ee] transition-all duration-1000" style={{ width: `${(completed / m.lessons.length) * 100}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedModule && !activeLesson && (
          <div className="space-y-12 animate-in">
            <button onClick={() => setSelectedModule(null)} className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-3"><i className="fa-solid fa-arrow-left"></i> Voltar à Matriz</button>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">{selectedModule.title}</h2>
            <div className="space-y-4">
              {selectedModule.lessons.map(l => {
                const status = lessonProgress[l.id]?.state || 'LOCKED';
                const isCompleted = status === 'COMPLETED';
                const isUnlocked = true; // Simples para demo, mas poderia ser sequencial
                return (
                  <button key={l.id} onClick={() => isUnlocked && startLesson(l)} className={`w-full p-10 rounded-[48px] border-2 text-left flex items-center justify-between transition-all ${isCompleted ? 'bg-emerald-500/5 border-emerald-500/10 opacity-60' : 'bg-white/5 border-white/5 shadow-2xl'}`}>
                    <div className="space-y-3">
                      <h4 className="text-xl font-black italic uppercase">{l.title}</h4>
                      <div className="flex gap-4">
                        <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-500">{l.duration}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-slate-500/10 text-slate-500">+{l.xpValue} XP</span>
                      </div>
                    </div>
                    {isCompleted ? <i className="fa-solid fa-certificate text-emerald-500 text-3xl"></i> : <i className="fa-solid fa-chevron-right text-slate-800 text-2xl"></i>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === 'portfolio' && (
          <div className="space-y-12 animate-in">
             <h2 className="text-4xl font-black italic uppercase">Arquivo de <span className="text-cyan-500">Projetos</span></h2>
             {profile.portfolio.length === 0 ? (
               <div className="p-20 border-2 border-dashed border-white/10 rounded-[64px] text-center text-slate-600 font-black uppercase text-sm italic">Nenhum projeto auditado ainda.</div>
             ) : (
               <div className="grid gap-6">
                 {profile.portfolio.map(item => (
                   <div key={item.id} className="p-10 rounded-[56px] bg-white/5 border border-white/10 space-y-6">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xl font-black italic uppercase text-cyan-500">{item.lessonTitle}</h4>
                        <i className="fa-solid fa-check-double text-emerald-500"></i>
                      </div>
                      <p className="text-xs text-slate-400 italic leading-relaxed">{item.description}</p>
                      <a href={item.artifactUrl} target="_blank" rel="noreferrer" className="block w-full py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-center tracking-widest hover:bg-white/5">Ver Documento Auditado</a>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {view === 'profile' && (
          <div className="text-center space-y-16 animate-in">
            <div className="relative w-48 h-48 mx-auto">
              <div className="w-full h-full rounded-[64px] bg-slate-900 border-4 border-cyan-500 flex items-center justify-center text-6xl text-cyan-500 shadow-2xl">
                <i className="fa-solid fa-user-tie"></i>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl font-black italic uppercase tracking-tighter">{profile.name}</h3>
              <p className="text-sm font-black text-cyan-500 uppercase tracking-[0.5em] italic opacity-60">{profile.neighborhood}</p>
              <div className="text-xl font-bold">{profile.xp} XP acumulado</div>
            </div>
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full py-8 text-rose-500 font-black uppercase text-[10px] tracking-[0.5em] border-2 border-rose-500/20 rounded-[40px]">Formatar Sistema (Zerar Tudo)</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 p-8 z-[1000] pointer-events-none pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <div className="max-w-md mx-auto h-24 rounded-[48px] bg-slate-900/95 border border-white/10 flex justify-around items-center px-8 pointer-events-auto shadow-2xl backdrop-blur-3xl">
          {[{ id: 'home', icon: 'fa-book-open' }, { id: 'portfolio', icon: 'fa-briefcase' }, { id: 'profile', icon: 'fa-id-badge' }].map(item => (
            <button key={item.id} onClick={() => { setView(item.id as any); setSelectedModule(null); triggerVibration('light'); }} className={`transition-all ${view === item.id ? 'text-cyan-500 scale-125' : 'text-slate-600 opacity-40'}`}>
              <i className={`fa-solid ${item.icon} text-2xl`}></i>
            </button>
          ))}
        </div>
      </nav>

      {activeLesson && (
        <div className="fixed inset-0 z-[5000] bg-slate-950 animate-in overflow-y-auto pb-48">
          <header className="sticky top-0 p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/95 backdrop-blur-xl z-50 pt-[env(safe-area-inset-top)]">
            <button onClick={() => setActiveLesson(null)} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg"><i className="fa-solid fa-xmark"></i></button>
            <div className="flex-1 px-8 text-center space-y-4">
              <h2 className="text-[10px] font-black uppercase italic tracking-widest opacity-40">Banca Examinadora: {activeLesson.title}</h2>
              <div className="flex justify-center gap-2">
                {['THEORY', 'QUIZ', 'PRACTICE', 'DELIVERABLE'].map((s, i) => {
                  const states = ['THEORY', 'THEORY_COMPLETED', 'QUIZ_APPROVED', 'PRACTICE_APPROVED', 'COMPLETED'];
                  const currIdx = states.indexOf(lessonProgress[activeLesson.id]?.state || 'THEORY');
                  const isActive = currIdx >= i;
                  return <div key={s} className={`h-1 rounded-full transition-all duration-500 ${isActive ? 'w-8 bg-cyan-500' : 'w-4 bg-slate-900'}`} />;
                })}
              </div>
            </div>
            <div className="w-14" />
          </header>

          <main className="max-w-2xl mx-auto px-10 py-16 space-y-12">
            {lessonProgress[activeLesson.id]?.state === 'THEORY' && (
              <div className="space-y-12 animate-in">
                <div className="text-[10px] font-black text-cyan-500 uppercase tracking-widest border-l-4 border-cyan-500 pl-8">Material para Estudo Auditor</div>
                <div className="text-xl font-bold italic leading-relaxed text-slate-300 whitespace-pre-wrap">{activeLesson.theory}</div>
                <div className="pt-10">
                   <div className="flex justify-between mb-4">
                     <span className="text-[9px] font-black uppercase text-slate-600">Leitura Mínima: {activeLesson.minReadSeconds}s</span>
                     <span className="text-[9px] font-black uppercase text-cyan-500">Tempo Decorrido: {readSeconds}s</span>
                   </div>
                   <button disabled={readSeconds < activeLesson.minReadSeconds} onClick={() => updateState('THEORY_COMPLETED')} className="w-full py-10 bg-cyan-600 text-slate-950 font-black uppercase text-xs tracking-[0.5em] rounded-[48px] shadow-2xl disabled:opacity-20 active:scale-95 transition-all">Prosseguir para o Exame</button>
                </div>
              </div>
            )}

            {lessonProgress[activeLesson.id]?.state === 'THEORY_COMPLETED' && (
              <div className="space-y-10 animate-in">
                <div className="bg-white/5 p-8 rounded-[40px] flex justify-between items-center border border-white/5">
                  <div className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Exame de Qualificação</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase">Questão {quizIdx + 1}/{activeLesson.quizzes.length}</div>
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">{activeLesson.quizzes[quizIdx].question}</h3>
                <div className="space-y-4">
                  {activeLesson.quizzes[quizIdx].options.map((opt, i) => (
                    <button key={i} onClick={() => handleQuizAnswer(i)} className={`w-full p-8 rounded-[36px] border-2 text-left font-bold italic transition-all ${quizAnswer === i ? (i === activeLesson.quizzes[quizIdx].correctIndex ? 'border-emerald-500 bg-emerald-500/10' : 'border-rose-500 bg-rose-500/10') : 'border-white/5 bg-white/5'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
                {quizAnswer !== null && (
                  <div className="animate-in pt-6">
                    <div className={`p-8 rounded-[32px] mb-8 text-xs font-bold italic border-2 ${quizAnswer === activeLesson.quizzes[quizIdx].correctIndex ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                      {quizAnswer === activeLesson.quizzes[quizIdx].correctIndex ? activeLesson.quizzes[quizIdx].explanation : 'Incorreto. Você deve retornar à teoria se errar esta etapa.'}
                    </div>
                    <button onClick={nextQuizStep} className="w-full py-10 bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.5em] rounded-[48px] shadow-2xl active:scale-95">
                      {quizAnswer === activeLesson.quizzes[quizIdx].correctIndex ? 'Validar e Avançar' : 'Retornar e Estudar'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {(lessonProgress[activeLesson.id]?.state === 'QUIZ_APPROVED' || (currentReview?.verdict === 'needs_revision' && lessonProgress[activeLesson.id]?.state === 'QUIZ_APPROVED')) && (
              <div className="space-y-12 animate-in">
                <div className="text-[10px] font-black text-cyan-500 uppercase tracking-widest border-l-4 border-cyan-500 pl-8">Relatório de Estratégia Técnica</div>
                {currentReview?.verdict === 'needs_revision' && currentReview.min_required_rewrite_instructions && (
                  <div className="p-8 bg-rose-950/20 border border-rose-500/30 rounded-[40px] space-y-4">
                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest"><i className="fa-solid fa-circle-exclamation mr-2"></i> Instruções de Correção:</div>
                    <p className="text-sm font-bold italic text-rose-200">{currentReview.min_required_rewrite_instructions}</p>
                  </div>
                )}
                <div className="p-12 rounded-[56px] border border-white/5 bg-white/5 space-y-10 shadow-2xl">
                  <p className="text-xl font-bold italic text-slate-300 leading-relaxed">{activeLesson.challenge}</p>
                  <div className="space-y-4">
                    <textarea value={practiceText} onChange={e => setPracticeText(e.target.value)} className="w-full h-80 bg-black/50 border-2 border-white/10 rounded-[40px] p-10 text-sm font-bold italic focus:border-cyan-500/50 outline-none transition-all resize-none leading-relaxed" placeholder="Redija seu parecer técnico..." />
                    <div className="flex justify-between px-6 text-[10px] font-black uppercase tracking-widest">
                      <span className={practiceText.length < activeLesson.minWordsPractice ? 'text-rose-500' : 'text-emerald-500'}>Caracteres: {practiceText.length}/{activeLesson.minWordsPractice}</span>
                      <span className="text-slate-600 italic">Banca: Professor Auditor</span>
                    </div>
                  </div>
                </div>
                <button disabled={practiceText.length < activeLesson.minWordsPractice || aiLoading} onClick={() => runAiAudit('practice')} className="w-full py-10 bg-cyan-600 text-slate-950 font-black uppercase text-xs tracking-[0.5em] rounded-[48px] shadow-2xl disabled:opacity-20 flex items-center justify-center gap-4 active:scale-95 transition-all">
                  {aiLoading ? <i className="fa-solid fa-gavel animate-pulse text-2xl"></i> : <><i className="fa-solid fa-file-signature"></i> Submeter para Auditoria</>}
                </button>
              </div>
            )}

            {(lessonProgress[activeLesson.id]?.state === 'PRACTICE_APPROVED' || (currentReview?.verdict === 'needs_revision' && lessonProgress[activeLesson.id]?.state === 'PRACTICE_APPROVED')) && (
              <div className="space-y-12 animate-in">
                <div className="text-[10px] font-black text-cyan-500 uppercase tracking-widest border-l-4 border-cyan-500 pl-8">Auditoria de Portfólio: Submissão Final</div>
                <div className="p-8 bg-cyan-900/10 border border-cyan-500/20 rounded-[40px] space-y-2">
                   <div className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Checklist de Aprovação:</div>
                   <ul className="text-xs font-bold italic text-slate-400 list-disc pl-5">
                      {activeLesson.deliverableChecklist.map((c, i) => <li key={i}>{c}</li>)}
                   </ul>
                </div>
                {currentReview?.verdict === 'needs_revision' && currentReview.required_fixes && (
                  <div className="p-8 bg-rose-950/20 border border-rose-500/30 rounded-[40px] space-y-4">
                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest"><i className="fa-solid fa-triangle-exclamation mr-2"></i> Correções Práticas Exigidas:</div>
                    <ul className="text-xs font-bold italic text-rose-200 list-disc pl-5">{currentReview.required_fixes.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </div>
                )}
                <div className="grid gap-6">
                  {[
                    { key: 'what_i_did', label: 'A) O que fiz:', placeholder: 'Resumo da execução...' },
                    { key: 'how_i_did', label: 'B) Como fiz (Processo Técnico):', placeholder: 'Etapas e ferramentas...' },
                    { key: 'deliverable_link', label: 'C) Entregável (Link verificável):', placeholder: 'https://...' },
                    { key: 'results_or_learnings', label: 'D) Resultado / Aprendizado:', placeholder: 'Impacto ou conclusão...' },
                    { key: 'self_assessment', label: 'E) Autoavaliação (0-10):', placeholder: 'Sua análise crítica...' }
                  ].map(f => (
                    <div key={f.key} className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-600 ml-4">{f.label}</label>
                      <textarea value={(deliverableData as any)[f.key]} onChange={e => setDeliverableData({...deliverableData, [f.key]: e.target.value})} className="w-full p-8 bg-white/5 border border-white/10 rounded-3xl text-sm font-bold italic min-h-[100px] outline-none focus:border-cyan-500/50" placeholder={f.placeholder} />
                    </div>
                  ))}
                </div>
                <button disabled={!deliverableData.deliverable_link.includes('http') || aiLoading} onClick={() => runAiAudit('deliverable')} className="w-full py-10 bg-cyan-600 text-slate-950 font-black uppercase text-xs tracking-[0.5em] rounded-[48px] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                  {aiLoading ? <i className="fa-solid fa-search animate-pulse text-2xl"></i> : <><i className="fa-solid fa-stamp"></i> Auditar Ativo de Portfólio</>}
                </button>
              </div>
            )}

            {currentReview && (
              <div className="mt-12 p-10 bg-slate-900/80 rounded-[56px] border border-white/10 space-y-10 animate-in">
                <div className="flex justify-between items-center">
                   <div className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Parecer da Auditoria</div>
                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${currentReview.verdict === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {currentReview.verdict === 'approved' ? 'Aprovado para Mercado' : 'Revisão Necessária'}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Domínio/Execução', score: currentReview.scores.conceptual_mastery_0_3 || currentReview.scores.execution_0_3, max: 3 },
                    { label: 'Qualidade Técnica', score: currentReview.scores.technical_quality_0_3, max: 3 },
                    { label: 'Clareza Estratégica', score: currentReview.scores.strategy_clarity_0_2, max: 2 },
                    { label: 'Profissionalismo', score: currentReview.scores.professionalism_0_2, max: 2 }
                  ].map(s => (
                    <div key={s.label} className="p-6 bg-black/40 rounded-3xl border border-white/5">
                       <div className="text-[8px] font-black text-slate-500 uppercase mb-2">{s.label}</div>
                       <div className="text-xl font-black italic text-cyan-500">{s.score || 0}<span className="text-[10px] text-slate-700 opacity-50">/{s.max}</span></div>
                    </div>
                  ))}
                </div>

                {currentReview.evidence_check && (
                   <div className={`p-8 rounded-3xl border ${currentReview.evidence_check.evidence_present ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                      <div className="text-[10px] font-black uppercase mb-2">Verificação de Evidência:</div>
                      <div className="text-xs font-bold italic">Qualidade: {currentReview.evidence_check.evidence_quality.toUpperCase()}</div>
                      {currentReview.evidence_check.what_is_missing.length > 0 && (
                        <div className="text-[9px] mt-2 text-rose-400">Ausente: {currentReview.evidence_check.what_is_missing.join(', ')}</div>
                      )}
                   </div>
                )}

                <div className="space-y-6">
                  {(currentReview.strengths || []).length > 0 && (
                    <div>
                      <div className="text-[10px] font-black text-emerald-500 uppercase mb-3">Pontos de Autoridade:</div>
                      <ul className="space-y-2">
                        {currentReview.strengths?.map((s, i) => <li key={i} className="text-xs font-bold text-slate-400 italic flex gap-2"><i className="fa-solid fa-check text-emerald-500 mt-0.5"></i> {s}</li>)}
                      </ul>
                    </div>
                  )}
                  {currentReview.verdict === 'needs_revision' && (currentReview.weaknesses || currentReview.issues_found) && (
                    <div>
                      <div className="text-[10px] font-black text-rose-500 uppercase mb-3">Gargalos Detectados:</div>
                      <ul className="space-y-2">
                        {(currentReview.weaknesses || currentReview.issues_found || []).map((w, i) => <li key={i} className="text-xs font-bold text-slate-400 italic flex gap-2"><i className="fa-solid fa-xmark text-rose-500 mt-0.5"></i> {w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {lessonProgress[activeLesson.id]?.state === 'COMPLETED' && (
              <div className="space-y-12 animate-in text-center">
                <div className="w-40 h-40 bg-emerald-500 rounded-[64px] mx-auto flex items-center justify-center text-white text-6xl shadow-[0_0_80px_rgba(16,185,129,0.3)]"><i className="fa-solid fa-certificate"></i></div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black italic uppercase text-cyan-500 tracking-tighter leading-none">Ativo de Portfólio Outorgado</h3>
                  <p className="text-sm font-bold italic text-slate-400">Parabéns. Sua competência técnica foi validada e este projeto agora compõe seu portfólio profissional.</p>
                </div>
                <button onClick={() => setActiveLesson(null)} className="w-full py-10 bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.5em] rounded-[48px] shadow-2xl active:scale-95 transition-all">Encerrar Auditoria</button>
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
    <div className="fixed inset-0 z-[9999] bg-slate-950 text-white flex flex-col p-12 items-center justify-center space-y-16 animate-in">
       <OfficialLogo size="lg" />
       <div className="max-w-xs w-full space-y-6">
         <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Nome Completo</label>
            <input className="w-full p-8 rounded-[36px] bg-slate-900 border-2 border-white/5 text-sm font-bold uppercase outline-none focus:border-cyan-500/50" value={name} onChange={e => setName(e.target.value)} />
         </div>
         <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Bairro (Recife)</label>
            <input className="w-full p-8 rounded-[36px] bg-slate-900 border-2 border-white/5 text-sm font-bold uppercase outline-none focus:border-cyan-500/50" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
         </div>
         <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">ID Acadêmico</label>
            <input className="w-full p-8 rounded-[36px] bg-slate-900 border-2 border-white/5 text-sm font-bold lowercase outline-none focus:border-cyan-500/50" value={username} onChange={e => setUsername(e.target.value)} />
         </div>
       </div>
       <button disabled={!name || !username} onClick={() => onComplete({ name, neighborhood, username, level: 1, joinedAt: Date.now(), xp: 0, portfolio: [] })} className="w-full max-w-xs py-10 bg-cyan-600 text-slate-950 font-black uppercase text-xs tracking-[0.5em] rounded-[48px] shadow-2xl active:scale-95 disabled:opacity-20 transition-all">Matricular Agora</button>
    </div>
  );
};

export default App;
