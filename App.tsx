
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Lesson, LessonState, PortfolioItem, AuditResult, Track } from './types';
import { TRACKS, MURAL_ITEMS, MANIFESTO_TEXT } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('trilhas');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonState, setLessonState] = useState<LessonState>('THEORY');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gui_a_digital_v7');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
      localStorage.removeItem('gui_a_digital_v7');
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gui_a_digital_v7', JSON.stringify(user));
    }
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [user, isDarkMode]);

  const handleAudit = async (lesson: Lesson, content: string, imageBase64?: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `Você é um DIRETOR DE ARTE SÊNIOR. 
    Avalie se o trabalho do talento está pronto para o mercado real.
    Dê um score de 0 a 100 e feedback focado em viabilidade comercial.
    Retorne apenas JSON: { score, feedback, aprovado, mentor }.`;

    const parts: any[] = [{ text: `Lição: ${lesson.title}\nBriefing: ${lesson.clientBriefing}\nEntrega: ${content}` }];
    if (imageBase64) {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64.split(',')[1] } });
    }

    try {
      const res = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: { parts }, 
        config: { systemInstruction, responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
              aprovado: { type: Type.BOOLEAN },
              mentor: { type: Type.STRING }
            },
            required: ['score', 'feedback', 'aprovado', 'mentor']
          }
        } 
      });
      return JSON.parse(res.text || '{}');
    } catch (e) { 
      return { score: 0, feedback: "Erro na auditoria.", aprovado: false, mentor: "Sistema" };
    }
  };

  if (!user) return <Onboarding onComplete={setUser} isDarkMode={isDarkMode} />;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <nav className={`h-24 border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 backdrop-blur-xl ${isDarkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={() => setActiveTab('trilhas')}>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white shadow-xl text-xl transition-transform group-hover:scale-110">G</div>
          <div className="leading-none select-none">
            <h1 className="font-brand text-sm md:text-xl tracking-tighter uppercase leading-[0.8] mb-0.5">
              GUI.A<br/>
              <span className="text-indigo-600">DIGITAL</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-1 md:gap-4 overflow-x-auto no-scrollbar py-2 px-2">
          <NavBtn active={activeTab === 'trilhas'} onClick={() => setActiveTab('trilhas')} icon="fa-bolt" label="Trilhas" />
          <NavBtn active={activeTab === 'dossie'} onClick={() => setActiveTab('dossie')} icon="fa-id-badge" label="Dossiê" />
          <NavBtn active={activeTab === 'mural'} onClick={() => setActiveTab('mural')} icon="fa-newspaper" label="Mural" />
          <NavBtn active={activeTab === 'manifesto'} onClick={() => setActiveTab('manifesto')} icon="fa-flag" label="Manifesto" />
        </div>
        
        <button onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Alternar tema" className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center hover:bg-indigo-600/20 transition-colors">
          <i className={`fa-solid ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
        </button>
      </nav>

      <main className="flex-1 p-4 md:p-12 max-w-7xl mx-auto w-full">
        {activeLesson ? (
          <LessonEngine lesson={activeLesson} state={lessonState} setState={setLessonState} onAudit={handleAudit} onExit={() => setActiveLesson(null)} user={user} setUser={setUser} isDarkMode={isDarkMode} />
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'trilhas' && <TrilhasView tracks={TRACKS} onSelect={l => {setActiveLesson(l); setLessonState('THEORY');}} isDarkMode={isDarkMode} />}
            {activeTab === 'dossie' && <DossieView user={user} isDarkMode={isDarkMode} />}
            {activeTab === 'mural' && <MuralView items={MURAL_ITEMS} isDarkMode={isDarkMode} />}
            {activeTab === 'manifesto' && <ManifestoView text={MANIFESTO_TEXT} isDarkMode={isDarkMode} />}
          </div>
        )}
      </main>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center min-w-[65px] md:min-w-[90px] h-16 md:h-20 transition-all rounded-2xl md:rounded-3xl ${active ? 'bg-indigo-600 text-white shadow-2xl scale-105 md:scale-110 translate-y-[-2px]' : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-800/20'}`}>
    <i className={`fa-solid ${icon} text-lg md:text-2xl`}></i>
    <span className="text-[8px] md:text-[10px] font-black uppercase mt-1 md:mt-2 tracking-widest">{label}</span>
  </button>
);

const Onboarding = ({ onComplete, isDarkMode }: any) => {
  const [nome, setNome] = useState('');
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-600 rounded-[30px] md:rounded-[40px] mb-8 flex items-center justify-center text-5xl md:text-6xl font-black shadow-2xl animate-bounce">G</div>
      
      <div className="mb-12 md:mb-16 select-none text-center">
        <h1 className="text-[clamp(3rem,14vw,8.5rem)] font-brand italic uppercase tracking-tighter leading-[0.75]">
          GUI.A<br/>
          <span className="text-indigo-600">DIGITAL _</span>
        </h1>
      </div>

      <div className="w-full max-w-md space-y-10 md:space-y-12">
        <div className="relative group">
          <input 
            autoFocus 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            placeholder="QUAL TEU NOME?" 
            className="w-full bg-transparent border-b-8 border-indigo-600/30 focus:border-indigo-600 p-4 md:p-6 text-center text-3xl md:text-6xl font-black uppercase outline-none transition-all tracking-tighter placeholder:opacity-20" 
          />
        </div>
        
        <button 
          disabled={nome.length < 2}
          onClick={() => nome.length >= 2 && onComplete({ id: Date.now().toString(), name: nome, role: 'USER', email: '', matrix: { Estrategia: 15, Escrita: 15, Analise: 10, Tecnica: 10, Design: 10, Audiovisual: 10 }, dossier: [], level: 1, exp: 0, status: 'ACTIVE' })} 
          className="w-full h-20 md:h-28 bg-indigo-600 text-white rounded-3xl md:rounded-4xl font-black uppercase text-2xl md:text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-20"
        >
          Iniciar o Corre
          <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
        </button>
      </div>
      
      <div className="mt-12 opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">
        Instituto Guia Social • Recife
      </div>
    </div>
  );
};

const MuralView = ({ items, isDarkMode }: any) => (
  <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
    <h2 className="text-4xl md:text-6xl font-brand italic uppercase tracking-tighter border-b-8 border-indigo-600 pb-4 inline-block leading-none">O QUE TÁ <span className="text-indigo-600">ROLANDO _</span></h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {items.map((item: any) => (
        <div key={item.id} className={`p-6 md:p-8 rounded-4xl border-4 transition-all hover:scale-[1.01] shadow-2xl flex flex-col ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl ${isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${item.type === 'INSTITUCIONAL' ? 'bg-indigo-600 text-white' : 'bg-indigo-600/10 text-indigo-600'}`}>{item.type}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black uppercase mb-4 leading-none">{item.title}</h3>
          <p className="text-base md:text-lg opacity-70 italic leading-relaxed mb-8 flex-1">{item.content}</p>
          
          {item.links && (
            <div className="grid grid-cols-2 gap-2 mb-8">
              {item.links.map((link: any, idx: number) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600'}`}
                >
                  <i className={link.icon}></i>
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <div className="pt-6 border-t border-slate-800/20 text-[10px] font-black uppercase opacity-40">{item.date}</div>
        </div>
      ))}
    </div>
  </div>
);

const ManifestoView = ({ text, isDarkMode }: any) => (
  <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 animate-in slide-in-from-left-8">
    <h2 className="text-5xl md:text-7xl font-brand italic uppercase tracking-tighter leading-none">NOSSO <span className="text-indigo-600">MANIFESTO _</span></h2>
    <div className={`p-8 md:p-16 border-l-[16px] md:border-l-[24px] border-indigo-600 rounded-r-4xl md:rounded-r-5xl text-2xl md:text-4xl font-bold leading-tight italic shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white border'}`}>
      {text}
      <div className="mt-8 md:mt-12 pt-8 border-t border-indigo-600/20 text-xs md:text-sm font-black uppercase opacity-50 tracking-[0.3em]">
        Equipe Instituto Guia Social
      </div>
    </div>
  </div>
);

const TrilhasView = ({ tracks, onSelect, isDarkMode }: any) => (
  <div className="space-y-8 md:space-y-12">
    <h2 className="text-4xl md:text-6xl font-brand italic uppercase tracking-tighter leading-none">ESTAÇÕES DE <span className="text-indigo-600">PRODUÇÃO _</span></h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
      {tracks.map((t: Track) => (
        <div key={t.id} className={`p-8 md:p-10 border-4 rounded-4xl md:rounded-5xl group transition-all hover:-translate-y-2 shadow-2xl ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 hover:border-indigo-500'}`}>
          <div className="text-6xl md:text-8xl mb-6 md:mb-8 grayscale group-hover:grayscale-0 transition-all duration-500">{t.icon}</div>
          <h3 className="text-3xl md:text-4xl font-brand uppercase mb-4 tracking-tighter">{t.title}</h3>
          <p className="text-lg md:text-xl opacity-60 mb-8 md:mb-10 italic leading-snug">{t.description}</p>
          <div className="space-y-2 md:space-y-3 mb-8 md:mb-10">
            {t.lessons.map(l => (
              <button key={l.id} onClick={() => onSelect(l)} className={`w-full p-4 rounded-2xl text-left text-[10px] md:text-xs font-black uppercase flex items-center gap-3 transition-all ${isDarkMode ? 'bg-slate-900 hover:bg-indigo-600' : 'bg-slate-100 hover:bg-indigo-600 hover:text-white'}`}>
                <i className="fa-solid fa-play text-[8px] md:text-[10px]"></i> {l.title}
              </button>
            ))}
          </div>
          <button onClick={() => onSelect(t.lessons[0])} className="w-full h-16 md:h-20 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-base md:text-lg shadow-xl hover:bg-indigo-500 transition-all">INICIAR TRILHA</button>
        </div>
      ))}
    </div>
  </div>
);

const DossieView = ({ user, isDarkMode }: any) => (
  <div className="space-y-8 md:space-y-12">
    <h2 className="text-4xl md:text-6xl font-brand italic uppercase tracking-tighter leading-none">SEU <span className="text-indigo-600">DOSSIÊ _</span></h2>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
      <div className="lg:col-span-2 space-y-6 md:space-y-10">
        {user.dossier.length === 0 ? (
          <div className="p-12 md:p-24 border-8 border-dashed border-slate-900 rounded-5xl text-center opacity-10 italic font-black text-2xl md:text-4xl">DOSSIÊ VAZIO. INICIE UM PROJETO.</div>
        ) : (
          user.dossier.map((item: any) => (
            <article key={item.id} className={`p-6 md:p-10 border-4 rounded-4xl md:rounded-5xl shadow-2xl transition-all hover:border-indigo-600 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
                 <div className="space-y-2">
                    <span className="text-[9px] md:text-[10px] font-black uppercase px-4 py-1.5 bg-indigo-600 text-white rounded-full">{item.trackId}</span>
                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">{item.lessonTitle}</h3>
                 </div>
                 <div className="text-left md:text-right">
                    <span className="text-4xl md:text-6xl font-black text-indigo-500 leading-none">{item.audit.score}</span>
                    <p className="text-[9px] md:text-[10px] font-black uppercase opacity-40">MARKET SCORE</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                <p className="text-lg md:text-xl italic opacity-70 leading-relaxed font-medium whitespace-pre-wrap">"{item.writtenResponse}"</p>
                {item.evidenceImage && <img src={item.evidenceImage} className="w-full h-48 md:h-80 object-cover rounded-3xl md:rounded-4xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" />}
              </div>
              <div className="p-6 md:p-10 bg-indigo-600/5 rounded-3xl md:rounded-4xl border-l-[12px] md:border-l-[16px] border-indigo-600">
                 <span className="text-[9px] md:text-[10px] font-black uppercase opacity-50 block mb-3 md:mb-4 tracking-widest flex items-center gap-2"><i className="fa-solid fa-shield-halved"></i> AUDITORIA DO DIRETOR:</span>
                 <p className="text-lg md:text-xl font-bold opacity-90 leading-relaxed italic">{item.audit.feedback}</p>
              </div>
            </article>
          ))
        )}
      </div>
      <aside className={`p-8 md:p-12 border-4 rounded-4xl md:rounded-5xl h-fit sticky top-32 shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border'}`}>
         <h3 className="text-xl md:text-2xl font-black uppercase italic text-indigo-500 mb-8 md:mb-10 tracking-widest border-b-2 border-indigo-600 inline-block pb-2">HABILIDADES</h3>
         {Object.entries(user.matrix).map(([skill, value]: any) => (
           <div key={skill} className="mb-6 md:mb-8">
             <div className="flex justify-between text-[10px] md:text-[11px] font-black uppercase mb-3 tracking-widest"><span>{skill}</span><span>{value}%</span></div>
             <div className="h-3 md:h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner"><div style={{ width: `${value}%` }} className="h-full bg-indigo-600 shadow-[0_0_15px_#4f46e5] transition-all duration-1000"></div></div>
           </div>
         ))}
      </aside>
    </div>
  </div>
);

const LessonEngine = ({ lesson, state, setState, onAudit, onExit, user, setUser, isDarkMode }: any) => {
  const [written, setWritten] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submit = async () => {
    if (written.length < 30) return alert("Seja mais detalhado no seu corre.");
    setLoading(true);
    const result = await onAudit(lesson, written, imageBase64 || undefined);
    setAudit(result);
    setLoading(false);
    if (result.aprovado) {
      const newItem: PortfolioItem = {
        id: Math.random().toString(36).substr(2, 9), lessonId: lesson.id, lessonTitle: lesson.title, trackId: lesson.category,
        writtenResponse: written, evidenceImage: imageBase64 || undefined, audit: result, date: new Date().toLocaleDateString(), versao: 1
      };
      const comp = lesson.competency as keyof typeof user.matrix;
      const newMatrix = { ...user.matrix };
      newMatrix[comp] = Math.min(newMatrix[comp] + 15, 100);
      setUser({ ...user, dossier: [newItem, ...user.dossier], matrix: newMatrix });
      setState('REVIEW');
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in slide-in-from-bottom-12">
      {state === 'THEORY' && (
        <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-7xl font-brand italic uppercase tracking-tighter leading-none">{lesson.title}</h2>
          <div className={`p-8 md:p-16 border-l-[16px] md:border-l-[24px] border-indigo-600 rounded-r-4xl md:rounded-r-5xl text-2xl md:text-4xl leading-relaxed whitespace-pre-wrap shadow-2xl italic font-bold ${isDarkMode ? 'bg-slate-900' : 'bg-white border'}`}>
            {lesson.theoryContent}
          </div>
          <button onClick={() => setState('QUIZ')} className="w-full h-20 md:h-28 bg-indigo-600 text-white rounded-3xl md:rounded-4xl font-black uppercase text-xl md:text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all">VALIDAR FUNDAMENTO</button>
        </div>
      )}

      {state === 'QUIZ' && (
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-10 py-6 md:py-10 text-center">
          <h3 className="text-3xl md:text-5xl font-brand uppercase italic tracking-tighter">TESTE DE <span className="text-indigo-600">CERTIFICAÇÃO _</span></h3>
          <div className={`p-8 md:p-12 rounded-4xl md:rounded-5xl border-4 text-left shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <p className="text-xl md:text-3xl font-bold mb-8 md:mb-10 leading-tight">{lesson.quiz.question}</p>
            <div className="space-y-3 md:space-y-4">
              {lesson.quiz.options.map((opt: string, i: number) => (
                <button key={i} onClick={() => setQuizSelected(i)} className={`w-full p-6 md:p-8 rounded-2xl md:rounded-3xl text-left font-bold transition-all border-4 text-lg md:text-2xl ${quizSelected === i ? 'border-indigo-600 bg-indigo-600/10' : 'border-transparent bg-slate-800/20 hover:bg-slate-800/40'}`}>
                  {opt}
                </button>
              ))}
            </div>
            <button disabled={quizSelected === null} onClick={() => quizSelected === lesson.quiz.answer ? setState('PRACTICE') : alert(lesson.quiz.explanation)} className="w-full h-16 md:h-24 bg-indigo-600 text-white rounded-3xl md:rounded-4xl font-black uppercase text-lg md:text-2xl shadow-xl mt-10 md:mt-12 hover:bg-indigo-500 transition-all">ABRIR ESTAÇÃO DE TRABALHO</button>
          </div>
        </div>
      )}

      {state === 'PRACTICE' && (
        <div className="space-y-8 md:space-y-10 max-w-6xl mx-auto">
          <div className="p-6 md:p-10 bg-amber-500/10 border-4 border-amber-500/30 rounded-4xl italic font-bold text-lg md:text-2xl leading-relaxed shadow-xl">
            <span className="text-[9px] md:text-[10px] font-black uppercase opacity-60 block mb-3 md:mb-4 tracking-widest"><i className="fa-solid fa-briefcase mr-2"></i> BRIEFING DO CLIENTE:</span>
            "{lesson.clientBriefing}"
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <textarea value={written} onChange={e => setWritten(e.target.value)} className={`w-full h-80 md:h-[500px] p-8 md:p-12 rounded-4xl md:rounded-5xl border-4 outline-none text-xl md:text-3xl font-mono leading-relaxed ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-600' : 'bg-white border focus:border-indigo-500 shadow-inner'}`} placeholder="Sua solução profissional..." />
            <div onClick={() => document.getElementById('fileIn')?.click()} className={`h-80 md:h-[500px] border-8 border-dashed rounded-4xl md:rounded-5xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-600/5 transition-all group ${imageBase64 ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-indigo-600'}`}>
               {imageBase64 ? <img src={imageBase64} className="h-full w-full object-cover rounded-3xl md:rounded-4xl p-4 md:p-6" /> : <><i className="fa-solid fa-cloud-arrow-up text-6xl md:text-8xl mb-6 md:mb-8 opacity-10 group-hover:opacity-30"></i><span className="font-black uppercase text-base md:text-xl tracking-widest opacity-30 text-center">UPLOAD DO TRABALHO</span></>}
               <input id="fileIn" type="file" className="hidden" onChange={handleImage} />
            </div>
          </div>
          <button disabled={loading || written.length < 30} onClick={submit} className="w-full h-24 md:h-32 bg-emerald-600 text-white rounded-4xl md:rounded-5xl font-black uppercase text-2xl md:text-4xl shadow-2xl hover:bg-emerald-500 transition-all disabled:opacity-30">
            {loading ? 'AUDITANDO RESULTADO...' : 'ENVIAR PARA O DIRETOR'}
          </button>
        </div>
      )}

      {state === 'REVIEW' && (
        <div className="max-w-3xl mx-auto text-center space-y-8 md:space-y-12 py-10 md:py-12">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto flex items-center justify-center text-5xl md:text-7xl text-white shadow-2xl ${audit?.aprovado ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-red-500 shadow-red-500/40'}`}>
            <i className={`fa-solid ${audit?.aprovado ? 'fa-check' : 'fa-xmark'}`}></i>
          </div>
          <h2 className="text-5xl md:text-8xl font-brand uppercase italic tracking-tighter leading-none">VEREDITO DO <br/><span className={audit?.aprovado ? 'text-emerald-500' : 'text-red-500'}>DIRETOR _</span></h2>
          <div className={`p-8 md:p-16 border-l-[24px] md:border-l-[32px] ${audit?.aprovado ? 'border-emerald-500' : 'border-red-500'} rounded-r-4xl md:rounded-r-5xl text-left shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white border'}`}>
             <p className="text-xl md:text-3xl font-bold italic leading-relaxed mb-10 md:mb-12">"{audit?.feedback}"</p>
             <div className="flex justify-between items-center border-t border-slate-800/20 pt-8 md:pt-10">
                <span className="text-base md:text-xl font-black uppercase opacity-40 tracking-widest">PRONTIDÃO COMERCIAL</span>
                <span className="text-6xl md:text-9xl font-black text-indigo-500 leading-none">{audit?.score}</span>
             </div>
          </div>
          <button onClick={onExit} className="px-12 md:px-24 h-20 md:h-28 bg-indigo-600 text-white rounded-3xl md:rounded-4xl font-black uppercase text-xl md:text-2xl shadow-2xl hover:bg-indigo-500 transition-all">BUSCAR NOVO CORRE</button>
        </div>
      )}
    </div>
  );
};

export default App;
