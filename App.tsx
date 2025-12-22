
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Module, Lesson, AIReview, LessonState, PortfolioItem, TrailId } from './types.ts';
import { MODULES } from './constants.tsx';
import { saveOperador, getOperador } from './db.ts';

const triggerVibration = (p: 'light' | 'success' | 'error') => {
  if (!window.navigator.vibrate) return;
  const map = { light: 10, success: [10, 30, 10], error: [50, 50, 50] };
  window.navigator.vibrate(map[p] as any);
};

const App = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'matrix' | 'arsenal' | 'terminal'>('matrix');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonState, setLessonState] = useState<LessonState>('THEORY');
  const [readTime, setReadTime] = useState(0);
  const [practiceInput, setPracticeInput] = useState('');
  const [deliveryInput, setDeliveryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('active_operador');
    if (user) getOperador(user).then(setProfile);
  }, []);

  useEffect(() => {
    if (activeLesson && lessonState === 'THEORY') {
      timerRef.current = window.setInterval(() => setReadTime(v => v + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setReadTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeLesson, lessonState]);

  const save = (p: UserProfile) => {
    setProfile(p);
    saveOperador(p);
    localStorage.setItem('active_operador', p.username);
  };

  const audit = async (type: 'PRACTICE' | 'DELIVERY') => {
    if (!activeLesson || !profile) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `Você é o GUI.A, Mentor Sênior do GUIA DIGITAL. 
      Seu papel é avaliar com alto rigor técnico. Não aceite respostas genéricas, curtas ou sem fundamentos de mercado.
      Avalie: Clareza Técnica, Coerência Estratégica e Vocabulário Profissional.
      Para DELIVERIES (links), verifique se o link parece válido e atribua nota 0-10 baseada no esforço percebido.`;

      const prompt = `AUDITORIA DE PROTOCOLO V5.0:
        Operador: ${profile.name} (Trilha: ${profile.selectedTrail})
        Lição: ${activeLesson.title}
        Tipo de Avaliação: ${type}
        Conteúdo Submetido: ${type === 'PRACTICE' ? practiceInput : deliveryInput}
        
        Gere uma resposta estritamente em JSON: { "verdict": "approved" | "revision", "feedback": "crítica construtiva e técnica", "score": 0-100 }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING },
              feedback: { type: Type.STRING },
              score: { type: Type.NUMBER }
            },
            required: ["verdict", "feedback", "score"]
          }
        }
      });

      const result: AIReview = JSON.parse(response.text || '{}');
      if (result.verdict === 'approved') {
        triggerVibration('success');
        if (type === 'PRACTICE') {
          setLessonState('REVIEW');
        } else {
          const item: PortfolioItem = {
            id: Date.now().toString(),
            title: activeLesson.title,
            category: profile.selectedTrail.toUpperCase().replace('_', ' '),
            description: practiceInput.substring(0, 150) + "...",
            url: deliveryInput,
            score: result.score,
            approvedAt: Date.now()
          };
          const next = { 
            ...profile, 
            xp: profile.xp + activeLesson.xpValue, 
            portfolio: [item, ...profile.portfolio] 
          };
          save(next);
          setLessonState('COMPLETED');
        }
      } else {
        triggerVibration('error');
        alert(`REVISÃO DO MENTOR GUI.A:\n\n${result.feedback}`);
      }
    } catch (e) {
      alert("FALHA DE SINCRONIZAÇÃO. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <Onboarding onComplete={save} />;

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* HUD HEADER */}
      <header className="sticky top-0 z-50 bg-black border-b-8 border-white p-6 flex justify-between items-center">
        <div>
          <h1 className="heavy text-4xl italic leading-none">GUIA<span className="text-purple-600">DIGITAL</span></h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">GUI.A_SISTEMA_V5.1_ATIVO</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-purple-600 uppercase">CAPITAL_INTELECTUAL</span>
          <div className="flex items-center gap-3">
            <span className="heavy text-4xl italic">{profile.xp.toLocaleString()}</span>
            <div className="w-10 h-10 border-4 border-white flex items-center justify-center text-[12px] font-black">XP</div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 pb-40 max-w-4xl mx-auto w-full">
        {view === 'matrix' && !activeLesson && (
          <div className="space-y-16">
            <div className="space-y-4">
              <h2 className="heavy text-6xl leading-[0.8] italic">CENTRAL_DE <br/><span className="text-purple-600">COMANDO</span></h2>
              <div className="h-2 w-24 bg-white"></div>
              <p className="text-lg font-bold italic text-slate-400">Trilha Ativa: {profile.selectedTrail.toUpperCase()}</p>
            </div>

            <div className="grid gap-10">
              {MODULES.map(m => (
                <div key={m.id} className={`brutal-card p-10 space-y-8 ${m.trailId === profile.selectedTrail ? 'border-purple-600' : 'opacity-40 grayscale'}`}>
                  <div className="flex justify-between items-start">
                    <i className={`fa-solid ${m.icon} text-4xl ${m.trailId === profile.selectedTrail ? 'text-purple-600' : 'text-slate-600'}`}></i>
                    <span className="text-[10px] font-black text-slate-500 uppercase">ID_{m.id}</span>
                  </div>
                  <h3 className="heavy text-3xl italic">{m.title}</h3>
                  <p className="text-sm font-bold text-slate-500 italic">{m.description}</p>
                  <div className="space-y-4">
                    {m.lessons.map(l => (
                      <button 
                        key={l.id} 
                        disabled={m.trailId !== profile.selectedTrail}
                        onClick={() => { setActiveLesson(l); setLessonState('THEORY'); triggerVibration('light'); }}
                        className="brutal-btn"
                      >
                        {l.title} <i className="fa-solid fa-bolt-lightning text-xs ml-auto"></i>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'arsenal' && (
          <div className="space-y-16">
             <div className="space-y-4">
              <h2 className="heavy text-6xl leading-[0.8] italic">ATIVOS_DE <br/><span className="text-purple-600">MERCADO</span></h2>
              <div className="h-2 w-24 bg-white"></div>
            </div>
            {profile.portfolio.length === 0 ? (
              <div className="p-20 border-8 border-dashed border-white/10 text-center">
                <p className="heavy text-3xl italic text-slate-700">Nenhum ativo selado ainda.</p>
              </div>
            ) : (
              <div className="grid gap-8">
                {profile.portfolio.map(item => (
                  <div key={item.id} className="brutal-card p-8 border-l-[16px] border-l-purple-600">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black bg-purple-600 text-white px-3 py-1 uppercase">{item.category}</span>
                      <span className="heavy text-2xl italic text-purple-600">Nota: {item.score}/100</span>
                    </div>
                    <h4 className="heavy text-3xl mb-4 italic">{item.title}</h4>
                    <p className="text-slate-400 font-bold italic mb-6 line-clamp-2">{item.description}</p>
                    <a href={item.url} target="_blank" rel="noreferrer" className="brutal-btn py-4 text-lg">
                      <i className="fa-solid fa-eye mr-2"></i> VER_ENTREGÁVEL
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'terminal' && (
          <div className="space-y-20 py-10">
            <div className="flex flex-col md:flex-row items-center gap-10 bg-white/5 p-10 border-4 border-white">
              <div className="w-32 h-32 bg-purple-600 flex items-center justify-center text-white text-6xl">
                <i className="fa-solid fa-user-ninja"></i>
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="heavy text-5xl italic">{profile.name}</h3>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="bg-white text-black px-4 py-1 font-black italic uppercase text-xs">{profile.neighborhood}</span>
                  <span className="border-2 border-purple-600 text-purple-600 px-4 py-1 font-black italic uppercase text-xs">TRILHA_{profile.selectedTrail.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="brutal-card p-6 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Ativos_Totais</span>
                    <div className="heavy text-4xl mt-2">{profile.portfolio.length}</div>
                </div>
                <div className="brutal-card p-6 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Nível_Operador</span>
                    <div className="heavy text-4xl mt-2">SÊNIOR_01</div>
                </div>
            </div>
            <button 
              onClick={() => { if(confirm("FORMATAÇÃO TOTAL? Isso apagará todos os dados do sistema.")) { localStorage.clear(); window.location.reload(); } }}
              className="w-full py-6 text-xs font-black text-red-600 border-4 border-red-600/20 hover:bg-red-600 hover:text-white transition-all uppercase"
            >
              [ FORMATAR_SISTEMA_E_APAGAR_PROGRESSO ]
            </button>
          </div>
        )}
      </main>

      {/* NAVIGATION HUB */}
      <nav className="fixed bottom-0 left-0 w-full bg-black border-t-8 border-white p-4 h-28 flex justify-around gap-4 z-[60]">
        {[
          { id: 'matrix', icon: 'fa-layer-group', label: 'CÉLULAS' },
          { id: 'arsenal', icon: 'fa-vault', label: 'ARSENAL' },
          { id: 'terminal', icon: 'fa-id-card', label: 'TERMINAL' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => { setView(item.id as any); setActiveLesson(null); triggerVibration('light'); }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 border-4 transition-all ${view === item.id ? 'bg-white text-black border-white' : 'border-white/5 text-slate-700'}`}
          >
            <i className={`fa-solid ${item.icon} text-2xl`}></i>
            <span className="text-[8px] font-black italic tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* INTERFACE DE LIÇÃO (FULLSCREEN) */}
      {activeLesson && (
        <div className="fixed inset-0 z-[1000] bg-black overflow-y-auto pb-40">
          <header className="sticky top-0 bg-black border-b-4 border-purple-600 p-6 flex justify-between items-center z-10">
            <button onClick={() => { setActiveLesson(null); setLessonState('THEORY'); }} className="w-12 h-12 border-2 border-white flex items-center justify-center text-xl hover:bg-white hover:text-black">
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div className="text-center">
              <span className="text-xs font-black text-purple-600 uppercase italic tracking-widest">{activeLesson.title}</span>
              <div className="flex gap-2 mt-2">
                {['THEORY', 'QUIZ', 'PRACTICE', 'REVIEW', 'DELIVERY'].map((s, i) => {
                  const states = ['THEORY', 'QUIZ', 'PRACTICE', 'REVIEW', 'DELIVERY', 'COMPLETED'];
                  const cur = states.indexOf(lessonState);
                  return <div key={s} className={`h-1 w-6 ${cur >= i ? 'bg-purple-600' : 'bg-slate-800'}`} />;
                })}
              </div>
            </div>
            <div className="w-12"></div>
          </header>

          <main className="max-w-2xl mx-auto p-8 pt-12">
            {lessonState === 'THEORY' && (
              <div className="space-y-12 animate-in">
                <div className="p-8 border-l-8 border-purple-600 bg-white/5 space-y-6">
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">[ DIRETRIZ_TÉCNICA ]</span>
                  <p className="text-2xl font-bold italic leading-relaxed whitespace-pre-wrap">{activeLesson.theory}</p>
                </div>
                <div className="flex justify-between items-center text-xs font-black text-slate-500 uppercase italic">
                  <span>Tempo de Sincronização: {activeLesson.minReadSeconds}s</span>
                  <span className={readTime >= activeLesson.minReadSeconds ? 'text-emerald-500' : 'text-orange-500'}>Ativo: {readTime}s</span>
                </div>
                <button 
                  disabled={readTime < activeLesson.minReadSeconds} 
                  onClick={() => setLessonState('QUIZ')}
                  className="brutal-btn py-10 text-2xl italic"
                >
                  VALIDAR_ENTENDIMENTO
                </button>
              </div>
            )}

            {lessonState === 'QUIZ' && (
              <div className="space-y-10 animate-in">
                <h3 className="heavy text-4xl italic leading-tight">{activeLesson.quiz.question}</h3>
                <div className="grid gap-4">
                  {activeLesson.quiz.options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        if (i === activeLesson.quiz.correctIndex) {
                          setLessonState('PRACTICE');
                          triggerVibration('success');
                        } else {
                          setLessonState('THEORY');
                          triggerVibration('error');
                          alert("NEGATIVO: Releia a diretriz técnica com atenção.");
                        }
                      }}
                      className="brutal-btn p-8 text-xl text-left italic border-white/10 hover:border-white"
                    >
                      <span className="opacity-20 mr-2">{i+1}.</span> {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lessonState === 'PRACTICE' && (
              <div className="space-y-10 animate-in">
                <div className="p-8 border-2 border-white/10 bg-white/5 space-y-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase">[ LABORATÓRIO_DE_ESCRITA ]</span>
                  <p className="heavy text-2xl italic leading-tight">{activeLesson.challenge}</p>
                </div>
                <textarea 
                  value={practiceInput} 
                  onChange={e => setPracticeInput(e.target.value)}
                  className="h-80 text-lg font-bold italic p-8" 
                  placeholder="Redija sua argumentação técnica aqui..." 
                />
                <div className="flex justify-between text-[10px] font-black text-slate-500 italic uppercase">
                  <span className={practiceInput.length < activeLesson.minChars ? 'text-orange-500' : 'text-emerald-500'}>Caracteres: {practiceInput.length} / {activeLesson.minChars}</span>
                  <span>Mentor_IA: Online</span>
                </div>
                <button 
                  disabled={practiceInput.length < activeLesson.minChars || loading} 
                  onClick={() => audit('PRACTICE')}
                  className={`brutal-btn py-10 text-3xl italic ${loading ? 'is-loading' : ''}`}
                >
                  {loading ? 'AUDITANDO...' : 'SOLICITAR_APROVAÇÃO'}
                </button>
              </div>
            )}

            {lessonState === 'REVIEW' && (
              <div className="space-y-12 animate-in text-center">
                 <div className="w-24 h-24 bg-purple-600 mx-auto flex items-center justify-center text-white text-5xl">
                    <i className="fa-solid fa-clipboard-check"></i>
                 </div>
                 <h3 className="heavy text-5xl italic text-purple-600">AUDITORIA_APROVADA</h3>
                 <p className="text-xl font-bold italic text-slate-300 leading-relaxed border-y-2 border-white/10 py-10">
                    {activeLesson.reviewContent}
                 </p>
                 <button 
                  onClick={() => setLessonState('DELIVERY')}
                  className="brutal-btn py-10 text-3xl italic"
                >
                  IR_PARA_ENTREGA_PRÁTICA
                </button>
              </div>
            )}

            {lessonState === 'DELIVERY' && (
              <div className="space-y-10 animate-in">
                <div className="p-8 border-2 border-emerald-500/20 bg-emerald-500/5 space-y-6">
                  <span className="text-[10px] font-black text-emerald-500 uppercase">[ PROVA_DE_VALOR_REAL ]</span>
                  <p className="heavy text-2xl italic">Execute este trabalho no mundo real (ex: Canvas, Link do Post, Documento Google) e insira o link público abaixo para selagem.</p>
                </div>
                <input 
                  value={deliveryInput} 
                  onChange={e => setDeliveryInput(e.target.value)}
                  placeholder="https://link-do-seu-trabalho.com" 
                  className="text-xl py-8" 
                />
                <button 
                  disabled={!deliveryInput.includes('http') || loading} 
                  onClick={() => audit('DELIVERY')}
                  className={`brutal-btn py-10 text-3xl italic shadow-[12px_12px_0px_#7c3aed] ${loading ? 'is-loading' : ''}`}
                >
                  {loading ? 'SELANDO...' : 'SELAR_ATIVO_DEFINITIVO'}
                </button>
              </div>
            )}

            {lessonState === 'COMPLETED' && (
              <div className="text-center space-y-12 py-10 animate-in">
                <div className="w-40 h-40 bg-emerald-500 border-8 border-white mx-auto flex items-center justify-center text-black text-7xl shadow-[16px_16px_0px_#fff]">
                  <i className="fa-solid fa-medal"></i>
                </div>
                <h3 className="heavy text-6xl italic leading-none">ATIVO <br/><span className="text-emerald-500">CONQUISTADO</span></h3>
                <p className="text-slate-500 font-black italic uppercase text-xs">Este item agora faz parte do seu Arsenal Profissional.</p>
                <button onClick={() => { setActiveLesson(null); setView('arsenal'); }} className="brutal-btn py-10 text-2xl">VOLTAR_À_MATRIZ</button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

const Onboarding = ({ onComplete }: any) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [trail, setTrail] = useState<TrailId | ''>('');
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black z-[2000] p-6 flex flex-col justify-center items-center overflow-y-auto">
      <div className="max-w-xl w-full space-y-12 py-10 animate-in">
        {step === 0 && (
          <div className="space-y-10">
            <h1 className="heavy text-7xl italic leading-none">GUIA<br/><span className="text-purple-600">DIGITAL</span></h1>
            <div className="p-8 border-l-[12px] border-white space-y-8 bg-white/5">
              <h2 className="heavy text-3xl italic">MANIFESTO_OPERACIONAL</h2>
              <p className="text-lg font-bold italic text-slate-300 leading-relaxed">
                Este não é um curso. É um sistema de soberania econômica. <br/><br/>
                Onde o sistema vê carência, ativamos potência territorial. <br/><br/>
                O conhecimento aqui é sua arma de mobilidade social. Use-o com rigor técnico.
              </p>
              <button 
                onClick={() => { setAgreed(!agreed); triggerVibration('success'); }} 
                className={`w-full py-6 text-xl font-black uppercase border-4 transition-all ${agreed ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-transparent border-white text-white'}`}
              >
                {agreed ? "[ PROTOCOLO ACEITO ]" : "[ ACEITAR O PROTOCOLO ]"}
              </button>
            </div>
            <button 
              disabled={!agreed} 
              onClick={() => setStep(1)} 
              className="brutal-btn py-10 text-3xl italic shadow-[12px_12px_0px_#7c3aed]"
            >
              INICIAR_ATIVAÇÃO
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-10">
            <h2 className="heavy text-5xl italic leading-tight">IDENTIDADE_OPERACIONAL</h2>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 italic uppercase ml-2">Nome_do_Operador</label>
                <input value={name} onChange={e => setName(e.target.value)} className="text-2xl py-6" placeholder="DIGITE AQUI" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 italic uppercase ml-2">Zona_de_Atuação (Bairro)</label>
                <input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="text-2xl py-6" placeholder="DIGITE AQUI" />
              </div>
            </div>
            <button 
              disabled={!name || !neighborhood} 
              onClick={() => setStep(2)} 
              className="brutal-btn py-10 text-3xl italic shadow-[12px_12px_0px_#7c3aed]"
            >
              AVANÇAR_AO_COMANDO
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
             <h2 className="heavy text-5xl italic leading-tight">ESCOLHA_SUA_TRILHA</h2>
             <div className="grid gap-4">
                {[
                  { id: 'social_media', label: 'SOCIAL MEDIA', icon: 'fa-hashtag' },
                  { id: 'trafego', label: 'GESTOR DE TRÁFEGO', icon: 'fa-bullseye' },
                  { id: 'video', label: 'EDITOR DE VÍDEO', icon: 'fa-video' },
                  { id: 'design', label: 'DESIGNER DIGITAL', icon: 'fa-palette' }
                ].map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setTrail(t.id as TrailId)}
                    className={`brutal-btn py-6 flex items-center justify-start gap-6 ${trail === t.id ? 'bg-purple-600 text-white border-purple-600' : ''}`}
                  >
                    <i className={`fa-solid ${t.icon} text-2xl`}></i>
                    <span className="heavy text-xl italic">{t.label}</span>
                  </button>
                ))}
             </div>
             <button 
              disabled={!trail} 
              onClick={() => {
                const p: UserProfile = { 
                  username: name.toLowerCase().replace(/\s/g, '_'), 
                  name, 
                  neighborhood, 
                  selectedTrail: trail as TrailId,
                  xp: 0, 
                  portfolio: [], 
                  joinedAt: Date.now() 
                };
                onComplete(p);
                triggerVibration('success');
              }}
              className="brutal-btn py-10 text-3xl italic shadow-[12px_12px_0px_#7c3aed]"
            >
              ATIVAR_TERMINAL_V5
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
