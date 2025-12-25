
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { UserProfile, Lesson, LessonState, PortfolioItem, AuditResult } from './types';
import { TRACKS } from './constants';

// Auxiliares para Decodificação de Áudio (Raw PCM)
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'trilhas' | 'portfolio' | 'manifesto'>('trilhas');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonState, setLessonState] = useState<LessonState>('THEORY');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [announcement, setAnnouncement] = useState(''); // Para ARIA live regions

  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); setAnnouncement('Conexão restabelecida. Sincronização ativa.'); };
    const handleOffline = () => { setIsOffline(true); setAnnouncement('Você está offline. Algumas funcionalidades de IA estão limitadas.'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const saved = localStorage.getItem('guia_digital_os_v3');
    if (saved) setUser(JSON.parse(saved));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('guia_digital_os_v3', JSON.stringify(user));
  }, [user]);

  const auditContent = async (lesson: Lesson, type: 'PRACTICE' | 'SUBMISSION', content: any): Promise<AuditResult> => {
    if (isOffline) {
      return { score: 0, feedback: "Operação bloqueada: offline. O GUI.A precisa de conexão para auditar seu ativo.", mentor: "GUI.A_OFFLINE", aprovado: false };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `[SISTEMA::GUI.A_MENTOR_SOCIAL_RECIFE]
    PERSONA: Você é o GUI.A, um mentor de Marketing Digital focado em impacto social do Porto Digital. Direto, técnico e empático.
    OBJETIVO: Auditar trabalho de jovens de territórios periféricos. Valorize o esforço, mas exija rigor profissional.
    TIPO: ${type === 'PRACTICE' ? 'Escrita Técnica' : 'Entrega de Ativo'}
    LIÇÃO: ${lesson.title}
    CONTEÚDO: ${JSON.stringify(content)}
    
    RUBRICA:
    - Execução Prática (0-3)
    - Qualidade Técnica (0-3)
    - Estratégia e Clareza (0-2)
    - Profissionalismo (0-2)
    
    REGRAS DE LINGUAGEM:
    - Use termos técnicos corretamente (CAC, LTV, ROI).
    - Use regionalismos pernambucanos (visse, boy, vambora, massa).
    - Mínimo para aprovação: Score >= 7.
    
    SAÍDA JSON:
    {
      "score": number,
      "feedback": "string",
      "mentor": "GUI.A_V3_RECIFE",
      "rubrica": { "execucao_pratica": 0-3, "qualidade_tecnica": 0-3, "estrategia_clareza": 0-2, "profissionalismo": 0-2 },
      "aprovado": boolean
    }`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return { score: 0, feedback: "O servidor de IA está ocupado. Tente novamente em breve, boy.", mentor: "SISTEMA", aprovado: false };
    }
  };

  const speakTheory = async (text: string) => {
    if (isOffline) {
      alert("Áudio indisponível offline, boy. Leia o texto ou conecte-se.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Diga com clareza e um leve sotaque pernambucano: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
        setAnnouncement('Lendo conteúdo da lição em voz alta.');
      }
    } catch (err) {
      console.error("TTS_ERROR:", err);
    }
  };

  if (!user) return <IniciarSessao onComplete={setUser} />;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Aria Live Region para acessibilidade */}
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* Sidebar - Menu de Comando */}
      <aside className="w-72 border-r border-slate-800 bg-black/40 backdrop-blur-xl z-50 flex flex-col" role="navigation" aria-label="Menu Principal">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 flex items-center justify-center font-black rotate-12 shadow-[4px_4px_0_#10b981] text-white">G</div>
            <h1 className="text-xs font-black tracking-widest uppercase">GUI.A DIGITAL<br/><span className="text-indigo-400">CAREER OS v3</span></h1>
          </div>
          
          <nav className="space-y-3">
            <NavItem active={activeTab === 'trilhas'} onClick={() => setActiveTab('trilhas')} icon="fa-bolt" label="TRILHAS" ariaLabel="Ver Trilhas de Aprendizado" />
            <NavItem active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon="fa-briefcase" label="PORTFÓLIO" ariaLabel="Ver Meu Portfólio" />
            <NavItem active={activeTab === 'manifesto'} onClick={() => setActiveTab('manifesto')} icon="fa-fingerprint" label="MANIFESTO" ariaLabel="Ler Manifesto da Comunidade" />
          </nav>
        </div>

        <div className="mt-auto p-6 bg-indigo-950/20 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-slate-900 border-2 border-indigo-500/30 p-1 -rotate-3 overflow-hidden rounded-lg">
               <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`} alt={`Avatar de ${user.name}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Nível {user.level}</p>
              <p className="text-sm font-black uppercase truncate w-36" title={user.name}>{user.name}</p>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={(user.exp % 1000) / 10} aria-valuemin={0} aria-valuemax={100}>
             <div className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-500" style={{ width: `${(user.exp % 1000) / 10}%` }}></div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden" id="main-content">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-10 bg-slate-950/50 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
             <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
             <span className="text-[11px] font-mono tracking-widest uppercase opacity-60 font-bold">
               {isOffline ? 'MODO_OFFLINE_ATIVO' : 'SISTEMA_ONLINE_RECIFE'}
             </span>
          </div>
          {activeLesson && (
            <button 
              onClick={() => { setActiveLesson(null); setLessonState('THEORY'); setAnnouncement('Retornando ao painel de trilhas.'); }} 
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-indigo-500 transition-all focus:ring-2 ring-indigo-500"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i> SAIR DA LIÇÃO
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
          {activeLesson ? (
            <LessonFlow 
              lesson={activeLesson} 
              state={lessonState} 
              setState={setLessonState} 
              setActiveLesson={setActiveLesson}
              onAudit={auditContent}
              onSpeak={speakTheory}
              user={user}
              setUser={setUser}
              isOffline={isOffline}
            />
          ) : (
            <div className="max-w-6xl mx-auto">
              {activeTab === 'trilhas' && <TrilhasView onSelect={setActiveLesson} />}
              {activeTab === 'portfolio' && <PortfolioView dossier={user.dossier} setActiveLesson={setActiveLesson} setLessonState={setLessonState} />}
              {activeTab === 'manifesto' && <ManifestoView />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, ariaLabel }: any) => (
  <button 
    onClick={onClick}
    aria-label={ariaLabel}
    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all outline-none focus:ring-2 ring-indigo-500 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
  >
    <i className={`fa-solid ${icon} text-lg w-6`}></i>
    <span className="font-black text-[11px] tracking-[0.2em] uppercase">{label}</span>
  </button>
);

const TrilhasView = ({ onSelect }: any) => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="space-y-4">
      <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none font-archivo">
        DOMINE OS<br/><span className="text-indigo-500">ATIVOS DIGITAIS.</span>
      </h2>
      <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm">Educação técnica para o mercado real.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {TRACKS.map(track => (
        <div 
          key={track.id} 
          tabIndex={0}
          role="button"
          onClick={() => onSelect(track.lessons[0])}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(track.lessons[0])}
          className="p-8 bg-slate-900/30 border-2 border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col justify-between min-h-[350px] rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 text-indigo-500/10 text-9xl font-black font-archivo italic select-none pointer-events-none">
            {track.icon}
          </div>
          <div className="relative z-10">
            <span className="text-5xl mb-6 block drop-shadow-lg">{track.icon}</span>
            <h3 className="text-3xl font-black uppercase font-archivo leading-tight mb-3 group-hover:text-indigo-400 transition-colors">{track.title}</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">Lições desenhadas para transformar esforço em portfólio de alta densidade técnica.</p>
          </div>
          <button className="relative z-10 w-full bg-indigo-600 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] group-hover:bg-indigo-500 transition-all group-hover:scale-[1.02] shadow-xl">INICIAR MISSÃO</button>
        </div>
      ))}
    </div>
  </div>
);

const LessonFlow = ({ lesson, state, setState, setActiveLesson, onAudit, onSpeak, user, setUser, isOffline }: any) => {
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [writtenResponse, setWrittenResponse] = useState('');
  const [submission, setSubmission] = useState({ objetivo: '', metodo: '', entregavel: '', resultado: '', autoavaliacao: '' });
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const handleQuiz = () => {
    if (quizAnswer === lesson.quiz.answer) {
      setState('PRACTICE');
      window.scrollTo(0,0);
    } else {
      alert(`ERRADO: ${lesson.quiz.explanation}`);
      setState('THEORY');
      setQuizAnswer(null);
    }
  };

  const handleTechnicalAudit = async () => {
    setLoading(true);
    const result = await onAudit(lesson, 'PRACTICE', { response: writtenResponse });
    setAuditResult(result);
    setLoading(false);
    if (result.aprovado) {
      setState('SUBMISSION');
      window.scrollTo(0,0);
    }
  };

  const handleFinalSubmission = async () => {
    setLoading(true);
    const result = await onAudit(lesson, 'SUBMISSION', submission);
    setAuditResult(result);
    setLoading(false);
    if (result.aprovado) {
      const newItem: PortfolioItem = {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        writtenResponse,
        deliveryEvidence: submission,
        audit: result,
        date: new Date().toLocaleDateString('pt-BR'),
        versao: 1
      };
      setUser({
        ...user,
        level: Math.floor((user.exp + (result.score * 150)) / 1000) + 1,
        exp: user.exp + (result.score * 150),
        dossier: [newItem, ...user.dossier]
      });
      setState('REVIEW');
      window.scrollTo(0,0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      {/* Indicador de Progresso Acessível */}
      <nav className="flex justify-between items-center mb-16 px-4" aria-label="Progresso da Lição">
        {['Teoria', 'Desafio', 'Prática', 'Entrega', 'Finalizado'].map((s, i) => {
          const stepStates = ['THEORY', 'QUIZ', 'PRACTICE', 'SUBMISSION', 'REVIEW'];
          const activeIndex = stepStates.indexOf(state);
          const isCompleted = activeIndex > i;
          const isActive = activeIndex === i;
          
          return (
            <div key={s} className="flex-1 flex flex-col items-center gap-2 relative">
              <div className={`h-2 w-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-indigo-500' : isActive ? 'bg-indigo-400' : 'bg-slate-800'}`}></div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>{s}</span>
            </div>
          );
        })}
      </nav>

      {state === 'THEORY' && (
        <article className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1 className="text-4xl md:text-6xl font-black uppercase font-archivo italic leading-none">{lesson.title}</h1>
            <button 
              onClick={() => onSpeak(lesson.theoryContent)}
              disabled={isOffline}
              className="flex items-center gap-3 px-6 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold disabled:opacity-30"
              aria-label="Ouvir conteúdo técnico"
            >
              <i className="fa-solid fa-volume-high"></i> OUVIR GUIA
            </button>
          </header>
          
          <div className="p-8 md:p-12 bg-slate-900/30 border-l-8 border-indigo-500 text-lg md:text-xl leading-relaxed text-slate-300 whitespace-pre-wrap font-medium rounded-r-2xl readable-text shadow-2xl">
            {lesson.theoryContent}
          </div>

          <button 
            onClick={() => { setState('QUIZ'); window.scrollTo(0,0); }} 
            className="w-full bg-indigo-600 py-8 rounded-2xl text-xl font-black uppercase hover:bg-indigo-500 hover:scale-[1.01] active:scale-95 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center justify-center gap-4"
          >
            AVANÇAR PARA DESAFIO <i className="fa-solid fa-chevron-right"></i>
          </button>
        </article>
      )}

      {state === 'QUIZ' && (
        <section className="animate-in fade-in duration-500 space-y-10 py-10">
          <div className="text-center space-y-4">
            <span className="text-indigo-500 font-black tracking-[0.5em] text-xs uppercase">Validação de Conhecimento</span>
            <h2 className="text-3xl md:text-4xl font-black uppercase font-archivo">TESTE DE NÍVEL</h2>
          </div>
          
          <div className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 shadow-inner">
            <p className="text-xl md:text-2xl font-bold mb-12 text-center text-slate-200">{lesson.quiz.question}</p>
            <div className="space-y-4 max-w-2xl mx-auto">
              {lesson.quiz.options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => setQuizAnswer(i)}
                  className={`w-full p-6 text-left font-bold border-2 transition-all rounded-2xl text-lg flex items-center justify-between ${quizAnswer === i ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                  aria-pressed={quizAnswer === i}
                >
                  <span>{opt}</span>
                  {quizAnswer === i && <i className="fa-solid fa-circle-check"></i>}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleQuiz} 
            disabled={quizAnswer === null} 
            className="w-full max-w-2xl mx-auto block bg-indigo-600 py-6 rounded-2xl text-xl font-black uppercase disabled:opacity-20 transition-all shadow-xl"
          >
            CONFIRMAR RESPOSTA
          </button>
        </section>
      )}

      {state === 'PRACTICE' && (
        <section className="animate-in fade-in duration-500 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase font-archivo text-indigo-400">LABORATÓRIO TÉCNICO</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Desenvolva seu raciocínio estratégico abaixo.</p>
          </div>
          
          <div className="p-8 bg-indigo-950/20 border-l-4 border-indigo-500 text-indigo-200 italic rounded-r-xl text-lg font-medium leading-relaxed">
            <i className="fa-solid fa-quote-left mb-4 opacity-50 block text-2xl"></i>
            {lesson.practicePrompt}
          </div>

          <div className="space-y-4">
            <label htmlFor="technical-response" className="sr-only">Resposta técnica</label>
            <textarea 
              id="technical-response"
              value={writtenResponse}
              onChange={e => setWrittenResponse(e.target.value)}
              disabled={loading}
              className="w-full h-96 bg-slate-950 border-4 border-slate-900 p-8 rounded-3xl text-xl font-mono text-emerald-400 outline-none focus:border-indigo-500 focus:ring-4 ring-indigo-500/10 resize-none transition-all placeholder:opacity-20"
              placeholder="// Insira sua análise aqui. Use termos técnicos. O GUI.A está de olho, visse?"
            />
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-4 text-slate-600">
               <span>Progresso da Escrita: {writtenResponse.length} / 50 mín</span>
               {isOffline && <span className="text-amber-500"><i className="fa-solid fa-triangle-exclamation mr-1"></i> Auditoria indisponível offline</span>}
            </div>
          </div>

          <button 
            onClick={handleTechnicalAudit} 
            disabled={loading || writtenResponse.length < 50 || isOffline} 
            className="w-full bg-emerald-600 py-8 rounded-2xl text-xl font-black uppercase hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 shadow-[0_15px_40px_rgba(16,185,129,0.2)] disabled:grayscale disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-robot"></i>}
            {loading ? 'AUDITANDO QUALIDADE...' : 'ENVIAR PARA MENTORIA IA'}
          </button>
          
          {auditResult && !auditResult.aprovado && (
            <div className="p-8 bg-red-950/30 border-2 border-red-500/40 text-red-100 rounded-3xl animate-in slide-in-from-top-4">
               <div className="flex items-center gap-3 mb-4">
                 <i className="fa-solid fa-triangle-exclamation text-red-500 text-xl"></i>
                 <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">FEEDBACK DO MENTOR:</p>
               </div>
               <p className="text-lg italic font-medium leading-relaxed">"{auditResult.feedback}"</p>
            </div>
          )}
        </section>
      )}

      {state === 'SUBMISSION' && (
        <section className="animate-in fade-in duration-500 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-4xl md:text-5xl font-black uppercase font-archivo text-emerald-500">CONSTRUÇÃO DE ATIVO</h2>
            <p className="text-slate-500 font-bold tracking-widest text-sm">Documente o que você criou hoje para o seu dossiê.</p>
          </div>
          
          <div className="space-y-6 bg-slate-900/20 p-8 rounded-3xl border border-slate-800">
            <InputField label="A) O QUE EU FIZ (OBJETIVO)" value={submission.objetivo} onChange={v => setSubmission({...submission, objetivo: v})} placeholder="Ex: Criei uma estratégia de tráfego pago..." />
            <InputField label="B) COMO EU FIZ (FERRAMENTAS + MÉTODO)" value={submission.metodo} onChange={v => setSubmission({...submission, metodo: v})} placeholder="Ex: Usei Gerenciador de Anúncios e Funil AIDA..." />
            <InputField label="C) ENTREGÁVEL (LINK/PRINT/ARQUIVO)" value={submission.entregavel} onChange={v => setSubmission({...submission, entregavel: v})} placeholder="Link do Notion, Google Drive ou Print..." />
            <InputField label="D) RESULTADO OU APRENDIZADO" value={submission.resultado} onChange={v => setSubmission({...submission, resultado: v})} placeholder="Qual o principal KPI ou insight gerado?" />
            <InputField label="E) AUTOAVALIAÇÃO CRÍTICA" value={submission.autoavaliacao} onChange={v => setSubmission({...submission, autoavaliacao: v})} placeholder="O que você faria melhor na próxima vez?" />
          </div>

          <button 
            onClick={handleFinalSubmission} 
            disabled={loading || isOffline} 
            className="w-full bg-emerald-600 py-8 rounded-2xl text-xl font-black uppercase flex items-center justify-center gap-4 shadow-xl disabled:opacity-30"
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-stamp"></i>}
            {loading ? 'VALIDANDO ATIVO...' : 'REGISTRAR NO MEU DOSSIÊ'}
          </button>
        </section>
      )}

      {state === 'REVIEW' && (
        <section className="animate-in zoom-in-95 duration-500 space-y-12 text-center py-10">
          <div className="w-48 h-48 bg-emerald-500 mx-auto rounded-full flex items-center justify-center text-6xl shadow-[0_0_80px_rgba(16,185,129,0.4)] text-white relative">
            <i className="fa-solid fa-check"></i>
            <div className="absolute inset-0 rounded-full border-8 border-white/20 animate-ping"></div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black uppercase font-archivo leading-none">ATIVO<br/><span className="text-emerald-500">VALIDADO.</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-sm">Seu valor de mercado aumentou, visse?</p>
          </div>

          <div className="p-10 bg-slate-900 border-l-8 border-emerald-500 text-left rounded-r-2xl shadow-2xl">
            <p className="text-xs font-black text-emerald-500 mb-4 tracking-widest uppercase">MENSAGEM DO GUI.A:</p>
            <p className="text-2xl font-bold font-mono text-slate-100 italic leading-relaxed">"{auditResult?.feedback}"</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <RubricScore label="Prática" val={auditResult?.rubrica?.execucao_pratica} max={3} />
            <RubricScore label="Técnica" val={auditResult?.rubrica?.qualidade_tecnica} max={3} />
            <RubricScore label="Estratégia" val={auditResult?.rubrica?.estrategia_clareza} max={2} />
            <RubricScore label="Pro" val={auditResult?.rubrica?.profissionalismo} max={2} />
          </div>

          <button 
            onClick={() => { setActiveLesson(null); setState('THEORY'); setAuditResult(null); window.scrollTo(0,0); }} 
            className="w-full bg-indigo-600 py-8 rounded-2xl text-2xl font-black uppercase shadow-2xl hover:scale-[1.01] active:scale-95 transition-all"
          >
            VOLTAR PARA O COMANDO
          </button>
        </section>
      )}
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder }: any) => {
  const id = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase block px-1">{label}</label>
      <input 
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-5 text-white outline-none focus:border-indigo-500 focus:ring-4 ring-indigo-500/10 transition-all font-mono text-sm placeholder:opacity-20"
        placeholder={placeholder || "Digite aqui..."}
      />
    </div>
  );
};

const RubricScore = ({ label, val, max }: any) => (
  <div className="p-6 bg-slate-900/50 border-2 border-slate-800 rounded-2xl group hover:border-indigo-500/50 transition-all">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-4xl font-black text-white group-hover:text-indigo-400 transition-colors">{val}<span className="text-sm opacity-20 font-bold ml-1">/{max}</span></p>
  </div>
);

const PortfolioView = ({ dossier, setActiveLesson, setLessonState }: any) => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <header className="space-y-4">
      <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none font-archivo">MEU<br/><span className="text-indigo-500">DOSSIÊ TÉCNICO.</span></h2>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Seu currículo é o que você entrega, não o que você diz.</p>
    </header>

    <div className="grid gap-6">
      {dossier.map((item: any, i: number) => (
        <div key={i} className="group p-8 md:p-10 bg-slate-900/30 border border-slate-800 hover:border-indigo-500/40 rounded-3xl transition-all flex flex-col md:flex-row justify-between items-start gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-indigo-500/5 text-8xl font-black font-archivo italic select-none">
            #{dossier.length - i}
          </div>
          <div className="flex-1 space-y-5 relative z-10">
             <div>
                <h4 className="text-3xl font-black uppercase font-archivo text-white mb-2">{item.lessonTitle}</h4>
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Score: {item.audit.score}/10</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{item.date}</span>
                </div>
             </div>
             <p className="text-slate-400 italic text-lg line-clamp-2 max-w-2xl font-medium leading-relaxed">"{item.writtenResponse}"</p>
             <div className="flex items-center gap-4">
                <a 
                  href={item.deliveryEvidence.entregavel} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-3"
                >
                  <i className="fa-solid fa-link"></i> VER ATIVO ENTREGUE
                </a>
             </div>
          </div>
        </div>
      ))}
      
      {dossier.length === 0 && (
        <div className="border-4 border-dashed border-slate-900/50 py-40 rounded-3xl text-center opacity-30 flex flex-col items-center gap-6">
           <i className="fa-solid fa-briefcase text-7xl"></i>
           <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-sm">O mercado ainda não te vê, boy. Comece sua trilha.</p>
        </div>
      )}
    </div>
  </div>
);

const ManifestoView = () => (
  <article className="max-w-4xl mx-auto space-y-16 py-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
    <h2 className="text-6xl md:text-8xl font-black italic text-center font-archivo tracking-tighter uppercase leading-none">MANIFESTO<br/>GUI.A DIGITAL</h2>
    
    <div className="space-y-12 border-l-8 border-indigo-500 pl-8 md:pl-16 text-2xl md:text-3xl font-bold italic text-slate-300 leading-relaxed font-outfit">
       <p className="readable-text">"O Marketing Digital profissional não é sobre posts bonitos. É sobre construir ativos reais, dominar dados e entender a psicologia da conversão."</p>
       <p className="readable-text">"Aqui não existe atalho. O progresso é fruto de esforço cognitivo, escrita técnica e entrega prática. Se você não está disposto a pensar, não está pronto para o Porto Digital."</p>
       <p className="readable-text">"Nós somos o código-fonte da nova economia. Do Recife para o mundo, visse?"</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
      <ManifestoPillar icon="fa-brain" title="ESFORÇO" desc="Sem atalhos cognitivos. Pensar dói, mas constrói." />
      <ManifestoPillar icon="fa-code" title="TÉCNICA" desc="Fale a língua dos dados e da estratégia." />
      <ManifestoPillar icon="fa-earth-americas" title="IMPACTO" desc="Da periferia para o topo do mercado." />
    </div>
  </article>
);

const ManifestoPillar = ({ icon, title, desc }: any) => (
  <div className="p-8 bg-slate-900/20 border border-slate-800 rounded-3xl text-center space-y-4 group hover:border-indigo-500/50 transition-all">
    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-2xl text-indigo-400 group-hover:scale-110 transition-transform">
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <h4 className="text-xl font-black font-archivo">{title}</h4>
    <p className="text-slate-500 text-sm font-medium">{desc}</p>
  </div>
);

const IniciarSessao = ({ onComplete }: any) => {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 md:p-10 text-center relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
        <div className="text-[400px] font-black font-archivo italic absolute -top-40 -left-20 text-indigo-500/20 select-none">GUI.A</div>
      </div>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        <div className="w-24 h-24 bg-indigo-600 mb-12 flex items-center justify-center font-black text-6xl rotate-12 shadow-[20px_20px_0_#10b981] text-white">G</div>
        <h1 className="text-6xl md:text-9xl font-black uppercase font-archivo leading-[0.85] mb-12 tracking-tighter">GUI.A<br/><span className="text-indigo-500">DIGITAL</span></h1>
        
        <div className="w-full space-y-12">
          <div className="space-y-4">
            <label htmlFor="user-name" className="text-indigo-400 font-black text-[12px] tracking-[0.5em] uppercase">IDENTIFICAÇÃO DO OPERADOR:</label>
            <input 
              id="user-name"
              autoFocus
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full bg-transparent border-b-8 border-slate-900 py-6 text-center text-4xl md:text-5xl font-black text-white outline-none focus:border-indigo-600 uppercase italic placeholder:text-slate-900/40 transition-all font-archivo"
              placeholder="SEU NOME"
            />
          </div>
          
          <button 
            disabled={!nome || loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => onComplete({
                name: nome, level: 1, exp: 0, 
                matrix: { Estrategia: 0, Escrita: 0, Analise: 0, Tecnica: 0, Design: 0, Audiovisual: 0 },
                dossier: []
              }), 1200);
            }}
            className="w-full bg-indigo-600 py-8 rounded-3xl text-2xl font-black uppercase hover:bg-indigo-500 transition-all shadow-2xl disabled:opacity-5 transform hover:scale-[1.02] active:scale-95 tracking-widest text-white"
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin mr-3"></i> : null}
            {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
          </button>
          
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto">
            Ao entrar, você concorda em construir ativos reais para o seu futuro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
