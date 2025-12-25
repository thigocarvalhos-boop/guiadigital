
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { UserProfile, Lesson, LessonState, PortfolioItem, AuditResult, Track } from './types';
import { TRACKS, MURAL_ITEMS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<'USER' | 'ADMIN'>('USER');
  const [activeTab, setActiveTab] = useState<string>('trilhas');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonState, setLessonState] = useState<LessonState>('THEORY');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const saved = localStorage.getItem('guia_digital_v5');
    if (saved) {
      const parsedUser = JSON.parse(saved);
      setUser(parsedUser);
      // Se o usuário for ADMIN, ele pode escolher começar no modo admin
      if (parsedUser.role === 'ADMIN') {
        setViewMode('ADMIN');
        setActiveTab('admin-dash');
      }
    }
    
    const updateStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('guia_digital_v5', JSON.stringify(user));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [user, isDarkMode]);

  const toggleAdminMode = () => {
    if (user?.role === 'ADMIN') {
      const target = viewMode === 'USER' ? 'ADMIN' : 'USER';
      setViewMode(target);
      setActiveTab(target === 'ADMIN' ? 'admin-dash' : 'trilhas');
      setActiveLesson(null);
    }
  };

  const handleAudit = async (lesson: Lesson, content: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const res = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: `Audite este protocolo técnico: "${lesson.title}". Resposta do aluno: "${content}"`, 
        config: { 
          responseMimeType: 'application/json',
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
    } catch (error) { return { score: 0, feedback: "Falha na auditoria técnica.", aprovado: false }; }
  };

  if (!user) return <Onboarding onComplete={setUser} isDarkMode={isDarkMode} />;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER DINÂMICO */}
      <nav className={`h-24 border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 backdrop-blur-lg ${isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-white/95'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">G</div>
          <div className="hidden sm:block">
            <span className="font-black text-sm uppercase tracking-widest block leading-tight">GUI.A DIGITAL</span>
            <div className="flex items-center gap-2">
               <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${viewMode === 'ADMIN' ? 'text-indigo-400' : 'text-slate-500'}`}>
                {viewMode === 'ADMIN' ? 'Modo Administrativo' : 'Jornada de Inclusão'}
              </span>
              {user.role === 'ADMIN' && viewMode === 'USER' && (
                <span className="bg-indigo-600/20 text-indigo-400 text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-indigo-600/30">Logado como Admin</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-1 h-full items-center">
          {viewMode === 'USER' ? (
            <>
              <NavBtn active={activeTab === 'trilhas'} onClick={() => setActiveTab('trilhas')} icon="fa-bolt" label="Trilhas" />
              <NavBtn active={activeTab === 'dossie'} onClick={() => setActiveTab('dossie')} icon="fa-briefcase" label="Dossiê" />
              <NavBtn active={activeTab === 'mural'} onClick={() => setActiveTab('mural')} icon="fa-bullhorn" label="Mural" />
              <NavBtn active={activeTab === 'manifesto'} onClick={() => setActiveTab('manifesto')} icon="fa-fingerprint" label="Manifesto" />
            </>
          ) : (
            <>
              <NavBtn active={activeTab === 'admin-dash'} onClick={() => setActiveTab('admin-dash')} icon="fa-chart-pie" label="Painel" />
              <NavBtn active={activeTab === 'admin-content'} onClick={() => setActiveTab('admin-content')} icon="fa-layer-group" label="Aulas" />
              <NavBtn active={activeTab === 'admin-users'} onClick={() => setActiveTab('admin-users')} icon="fa-users" label="Jovens" />
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'ADMIN' && (
            <button 
              onClick={toggleAdminMode} 
              className={`flex items-center gap-2 px-3 h-10 rounded-xl transition-all font-black uppercase text-[9px] tracking-widest ${viewMode === 'ADMIN' ? 'bg-indigo-600 text-white shadow-indigo-500/40 shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              title={viewMode === 'ADMIN' ? "Voltar para Modo Aluno" : "Entrar no Modo Admin"}
            >
              <i className={`fa-solid ${viewMode === 'ADMIN' ? 'fa-user-graduate' : 'fa-gear'}`}></i>
              <span className="hidden md:block">{viewMode === 'ADMIN' ? 'Ver como Aluno' : 'Painel ADM'}</span>
            </button>
          )}
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-white text-indigo-600 shadow-sm border'}`}>
            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-16">
          {viewMode === 'USER' ? (
            activeLesson ? (
              <LessonEngine 
                lesson={activeLesson} state={lessonState} setState={setLessonState} onAudit={handleAudit}
                onExit={() => setActiveLesson(null)} user={user} setUser={setUser} isDarkMode={isDarkMode}
              />
            ) : (
              <>
                {activeTab === 'trilhas' && <TrilhasView onSelect={(l) => { setActiveLesson(l); setLessonState('THEORY'); }} isDarkMode={isDarkMode} />}
                {activeTab === 'dossie' && <DossieView dossier={user.dossier} matrix={user.matrix} isDarkMode={isDarkMode} />}
                {activeTab === 'mural' && <MuralView isDarkMode={isDarkMode} />}
                {activeTab === 'manifesto' && <ManifestoView isDarkMode={isDarkMode} />}
              </>
            )
          ) : (
            <>
              {activeTab === 'admin-dash' && <AdminDashboard isDarkMode={isDarkMode} />}
              {activeTab === 'admin-content' && <AdminContentManager isDarkMode={isDarkMode} />}
              {activeTab === 'admin-users' && <AdminUserManager isDarkMode={isDarkMode} />}
            </>
          )}
        </div>
      </main>

      <footer className={`p-8 border-t text-center text-[9px] font-black tracking-[0.4em] uppercase ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
        GUI.A DIGITAL / INSTITUTO GUIA SOCIAL
      </footer>
    </div>
  );
};

/* --- COMPONENTES DO MODO ADMIN --- */

const AdminDashboard = ({ isDarkMode }: any) => {
  const stats = [
    { label: 'Jovens Ativos', value: '142', icon: 'fa-user-check', color: 'text-emerald-500' },
    { label: 'Protocolos Concluídos', value: '389', icon: 'fa-check-double', color: 'text-indigo-500' },
    { label: 'Engajamento Semanal', value: '+12%', icon: 'fa-arrow-up', color: 'text-indigo-400' },
    { label: 'Alertas no Mural', value: '3', icon: 'fa-bell', color: 'text-amber-500' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">Painel de<br/><span className="text-indigo-600">CONTROLE _</span></h1>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className={`p-8 border-2 rounded-4xl transition-all hover:border-indigo-500/50 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl'}`}>
            <i className={`fa-solid ${s.icon} text-2xl ${s.color} mb-4`}></i>
            <div className="text-4xl font-black mb-1 tracking-tighter">{s.value}</div>
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-8 border-2 rounded-4xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black uppercase italic">Logs de Auditoria</h3>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Tempo Real</span>
          </div>
          <div className="space-y-4 font-mono text-[10px]">
            <p className="flex items-center gap-3"><span className="text-indigo-500 font-bold opacity-100">[14:20]</span> <span className="opacity-60">Admin editou Aula "Copywriting"</span></p>
            <p className="flex items-center gap-3"><span className="text-indigo-500 font-bold opacity-100">[13:05]</span> <span className="opacity-60">Monitor resetou senha de João S.</span></p>
            <p className="flex items-center gap-3"><span className="text-indigo-500 font-bold opacity-100">[09:12]</span> <span className="opacity-60">Sistema disparou aviso no Mural</span></p>
          </div>
        </div>
        <div className={`p-8 border-2 rounded-4xl bg-indigo-600 flex flex-col items-center justify-center text-center text-white shadow-2xl shadow-indigo-600/30`}>
          <i className="fa-solid fa-file-csv text-5xl mb-4"></i>
          <h3 className="text-xl font-black uppercase italic mb-4">Relatório Completo</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-6">Dados estruturados para análise institucional</p>
          <button className="px-8 h-14 bg-white text-indigo-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg">Baixar Excel (CSV)</button>
        </div>
      </div>
    </div>
  );
};

const AdminUserManager = ({ isDarkMode }: any) => {
  const users = [
    { name: 'Ricardo Melo', email: 'ric@email.com', level: 14, status: 'ACTIVE' },
    { name: 'Bia Rocha', email: 'bia@email.com', level: 9, status: 'ACTIVE' },
    { name: 'Douglas Lima', email: 'doug@email.com', level: 1, status: 'BLOCKED' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-4xl font-black uppercase italic">Comunidade<br/><span className="text-indigo-600">GUIA _</span></h2>
        <div className="flex w-full md:w-auto gap-2">
            <input className={`flex-1 md:flex-none px-6 h-14 rounded-2xl border-2 outline-none focus:border-indigo-600 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'}`} placeholder="Buscar jovem..." />
            <button className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center"><i className="fa-solid fa-user-plus"></i></button>
        </div>
      </header>
      <div className={`border-2 rounded-4xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-sm'}`}>
        <table className="w-full text-left">
          <thead className={`text-[10px] font-black uppercase tracking-widest border-b-2 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'bg-slate-50 border-slate-100'}`}>
            <tr><th className="p-6">Jovem</th><th className="p-6">Nível</th><th className="p-6">Status</th><th className="p-6 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 dark:divide-slate-800">
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-indigo-500/5 transition-colors">
                <td className="p-6"><div className="font-black uppercase text-sm tracking-tight">{u.name}</div><div className="text-[10px] opacity-50 font-mono">{u.email}</div></td>
                <td className="p-6 font-black text-indigo-500">{u.level}</td>
                <td className="p-6"><span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>{u.status}</span></td>
                <td className="p-6 text-right space-x-2">
                   <button className="w-9 h-9 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all border border-slate-700/50"><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                   <button className="w-9 h-9 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-red-600 hover:text-white transition-all border border-slate-700/50"><i className={`fa-solid ${u.status === 'ACTIVE' ? 'fa-lock' : 'fa-lock-open'} text-xs`}></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminContentManager = ({ isDarkMode }: any) => (
  <div className="space-y-8 animate-in fade-in">
    <header className="flex justify-between items-center">
      <h2 className="text-4xl font-black uppercase italic">Gestão de<br/><span className="text-indigo-600">CONTEÚDO _</span></h2>
      <button className="h-14 px-8 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-600/30">Nova Trilha</button>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {TRACKS.map(t => (
        <article key={t.id} className={`p-8 border-2 rounded-4xl flex justify-between items-center group transition-all hover:border-indigo-500/50 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl'}`}>
          <div className="flex gap-6 items-center">
            <span className="text-4xl group-hover:scale-110 transition-transform">{t.icon}</span>
            <div>
              <h3 className="text-xl font-black uppercase italic leading-none mb-1">{t.title}</h3>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{t.lessons.length} Aulas Ativas</p>
            </div>
          </div>
          <button className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-indigo-600 text-slate-400 hover:text-white transition-all border border-slate-700/50"><i className="fa-solid fa-edit"></i></button>
        </article>
      ))}
    </div>
  </div>
);

/* --- ONBOARDING COM DIFERENCIAÇÃO DE LOGIN --- */

const Onboarding = ({ onComplete, isDarkMode }: any) => {
  const [nome, setNome] = useState('');
  const [pin, setPin] = useState('');
  const [roleSelection, setRoleSelection] = useState<'USER' | 'ADMIN' | null>(null);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!nome) {
      setError('Teu nome é fundamental, boy!');
      return;
    }

    if (roleSelection === 'ADMIN') {
      if (pin === '1234') { // PIN Padrão para demonstração
        onComplete({ 
          id: 'admin-' + Date.now(), name: nome, email: 'admin@guiadigital.org', role: 'ADMIN', status: 'ACTIVE', level: 99, exp: 0, 
          matrix: { Estrategia: 100, Escrita: 100, Analise: 100, Tecnica: 100, Design: 100, Audiovisual: 100 }, dossier: [] 
        });
      } else {
        setError('PIN incorreto. Acesso restrito à equipe.');
      }
    } else {
      onComplete({ 
        id: 'user-' + Date.now(), name: nome, email: '', role: 'USER', status: 'ACTIVE', level: 1, exp: 0, 
        matrix: { Estrategia: 10, Escrita: 10, Analise: 10, Tecnica: 10, Design: 10, Audiovisual: 10 }, dossier: [] 
      });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
      <div className="w-20 h-20 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-4xl font-black mb-12 animate-bounce shadow-2xl shadow-indigo-600/50">G</div>
      <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-8 leading-none">GUI.A<br/><span className="text-indigo-600">DIGITAL</span></h1>
      
      {!roleSelection ? (
        <div className="w-full max-w-md space-y-6">
          <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-12">Escolha seu passaporte de entrada</p>
          <button 
            onClick={() => setRoleSelection('USER')}
            className="w-full h-24 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xl shadow-xl flex items-center justify-between px-8 hover:scale-105 transition-all"
          >
            <span>Sou Aluno</span>
            <i className="fa-solid fa-graduation-cap"></i>
          </button>
          <button 
            onClick={() => setRoleSelection('ADMIN')}
            className={`w-full h-24 border-4 rounded-3xl font-black uppercase text-xl flex items-center justify-between px-8 hover:scale-105 transition-all ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}
          >
            <span>Sou Gestor</span>
            <i className="fa-solid fa-user-tie"></i>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-4">
          <button onClick={() => {setRoleSelection(null); setError('');}} className="text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all mb-4">
            <i className="fa-solid fa-arrow-left mr-2"></i> Voltar Seleção
          </button>

          <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 block">Teu Nome</label>
                <input autoFocus value={nome} onChange={e => setNome(e.target.value)} className={`w-full bg-transparent border-b-4 py-4 text-center text-4xl font-black uppercase outline-none transition-all ${isDarkMode ? 'border-slate-800 focus:border-indigo-600' : 'border-slate-300 focus:border-indigo-500'}`} placeholder="QUAL É?" />
            </div>

            {roleSelection === 'ADMIN' && (
              <div className="space-y-2 animate-in fade-in duration-500">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 block">PIN de Gestor</label>
                  <input type="password" value={pin} onChange={e => setPin(e.target.value)} className={`w-full bg-transparent border-b-4 py-4 text-center text-4xl font-black uppercase outline-none transition-all ${isDarkMode ? 'border-slate-800 focus:border-indigo-600' : 'border-slate-300 focus:border-indigo-500'}`} placeholder="****" maxLength={4} />
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

          <button onClick={handleLogin} className="w-full h-20 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xl shadow-2xl shadow-indigo-600/30 hover:scale-105 transition-all">
            {roleSelection === 'ADMIN' ? 'Acessar Central' : 'Começar Corre'}
          </button>
        </div>
      )}
    </div>
  );
};

/* --- COMPONENTES DA JORNADA DO USUÁRIO --- */

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center min-w-[64px] h-20 transition-all rounded-xl ${active ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-indigo-500'}`}>
    <i className={`fa-solid ${icon} text-lg md:text-xl`}></i>
    <span className="text-[8px] font-black uppercase mt-1 hidden sm:block tracking-widest">{label}</span>
  </button>
);

const LessonEngine = ({ lesson, state, setState, onAudit, onExit, user, setUser, isDarkMode }: any) => {
  const [written, setWritten] = useState('');
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<AuditResult | null>(null);

  const finish = async () => {
    if (written.length < 50) return;
    setLoading(true);
    const result = await onAudit(lesson, written);
    setAudit(result);
    setLoading(false);
    if (result.aprovado) {
      const newItem: PortfolioItem = {
        lessonId: lesson.id, lessonTitle: lesson.title, trackId: lesson.category,
        writtenResponse: written, deliveryEvidence: { objetivo: '', metodo: '', entregavel: '', resultado: '', autoavaliacao: '' },
        audit: result, date: new Date().toLocaleDateString(), versao: 1
      };
      const comp = lesson.competency as keyof typeof user.matrix;
      const newMatrix = { ...user.matrix };
      newMatrix[comp] = Math.min(newMatrix[comp] + 15, 100);
      setUser({ ...user, level: user.level + 1, exp: user.exp + 100, matrix: newMatrix, dossier: [newItem, ...user.dossier] });
      setState('REVIEW');
    }
  };

  return (
    <article className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <button onClick={onExit} className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-black text-xs uppercase hover:bg-indigo-600 hover:text-white transition-all">Sair</button>
      </header>
      {state === 'THEORY' && (
        <section className="space-y-8">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none">{lesson.title}</h1>
          <div className={`p-8 border-l-[8px] border-indigo-600 rounded-r-4xl text-xl md:text-2xl leading-relaxed shadow-xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <p className="readable-text italic">{lesson.theoryContent}</p>
          </div>
          <button onClick={() => setState('PRACTICE')} className="w-full h-20 bg-indigo-600 text-white rounded-2xl text-xl font-black uppercase shadow-xl hover:bg-indigo-500 transition-all">Praticar Agora</button>
        </section>
      )}
      {state === 'PRACTICE' && (
        <section className="space-y-6">
          <div className="p-8 border-2 border-dashed border-indigo-500/30 rounded-3xl bg-indigo-500/5 italic text-lg leading-snug">"{lesson.practicePrompt}"</div>
          <textarea 
            value={written} onChange={e => setWritten(e.target.value)}
            className={`w-full h-80 border-2 rounded-3xl p-8 text-xl font-mono outline-none focus:border-indigo-600 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-900 text-indigo-400' : 'bg-white text-slate-800'}`}
            placeholder="Documente seu corre aqui..."
          />
          <button disabled={loading || written.length < 50} onClick={finish} className="w-full h-20 bg-emerald-600 text-white rounded-2xl text-xl font-black uppercase shadow-xl hover:bg-emerald-500 transition-all">
            {loading ? 'Validando Protocolo...' : 'Entregar e Auditar'}
          </button>
        </section>
      )}
      {state === 'REVIEW' && (
        <section className="text-center py-12 space-y-8">
          <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-4xl text-white shadow-xl animate-bounce">
            <i className="fa-solid fa-check"></i>
          </div>
          <h1 className="text-4xl font-black uppercase italic">Protocolo Aprovado</h1>
          <div className={`p-8 border-l-8 border-emerald-500 rounded-r-3xl text-left max-w-2xl mx-auto shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white border'}`}>
            <p className="text-xl italic font-bold leading-relaxed">"{audit?.feedback}"</p>
          </div>
          <button onClick={onExit} className="px-12 h-16 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-xl hover:bg-indigo-500 transition-all">Continuar</button>
        </section>
      )}
    </article>
  );
};

const TrilhasView = ({ onSelect, isDarkMode }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700">
    <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Protocolos<br/><span className="text-indigo-600">ATIVOS _</span></h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {TRACKS.map(track => (
        <article key={track.id} className={`p-8 border-4 rounded-4xl flex flex-col justify-between group min-h-[320px] transition-all hover:-translate-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-600/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-white shadow-xl'}`}>
          <div className="space-y-4">
            <span className="text-6xl block group-hover:scale-110 transition-transform duration-500">{track.icon}</span>
            <h2 className="text-3xl font-black uppercase leading-none">{track.title}</h2>
            <p className="text-lg opacity-70 italic leading-snug">{track.description}</p>
          </div>
          <button onClick={() => onSelect(track.lessons[0])} className="mt-8 h-16 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl hover:bg-indigo-500 transition-all">Executar Módulo</button>
        </article>
      ))}
    </div>
  </div>
);

const DossieView = ({ dossier, matrix, isDarkMode }: any) => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Dossiê<br/><span className="text-indigo-500">Patrimonial.</span></h1>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {dossier.length === 0 ? <div className={`p-12 border-2 border-dashed rounded-4xl text-center italic font-bold opacity-30 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>Inicie um protocolo técnico para compor seu dossiê patrimonial.</div> : 
          dossier.map((item: any, i: number) => (
            <article key={i} className={`p-8 border-2 rounded-4xl transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-[8px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">{item.trackId}</span>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{item.lessonTitle}</h3>
                  <p className="text-sm italic opacity-70 leading-relaxed">"{item.writtenResponse.substring(0, 100)}..."</p>
                </div>
                <div className="text-5xl font-black text-indigo-500 tracking-tighter">{item.audit.score}</div>
              </div>
            </article>
          ))
        }
      </div>
      <div className={`p-8 border-4 rounded-4xl h-fit sticky top-32 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white shadow-xl'}`}>
        <h3 className="text-xl font-black uppercase italic text-indigo-500 mb-6 tracking-widest">Maestria Técnica</h3>
        {Object.entries(matrix).map(([skill, value]: any) => (
          <div key={skill} className="mb-4">
            <div className="flex justify-between text-[10px] font-black uppercase mb-1"><span>{skill}</span><span>{value}%</span></div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"><div style={{ width: `${value}%` }} className="h-full bg-indigo-500 shadow-[0_0_10px_#4f46e5]"></div></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MuralView = ({ isDarkMode }: any) => {
  const [expandedMEI, setExpandedMEI] = useState(false);
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Mural do<br/><span className="text-indigo-600">CORRE _</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MURAL_ITEMS.map(item => {
          if (item.type === 'MEI') {
            return (
              <article key={item.id} className={`md:col-span-2 p-8 border-4 rounded-4xl transition-all ${isDarkMode ? 'bg-slate-900 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100 shadow-xl'}`}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-2xl"><i className={`fa-solid ${item.icon}`}></i></div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.date}</span>
                  </div>
                  <h2 className="text-3xl font-black uppercase italic leading-none">{item.title}</h2>
                  <p className="text-lg opacity-80 leading-relaxed">{item.content}</p>
                  <button onClick={() => setExpandedMEI(!expandedMEI)} className="text-[10px] font-black uppercase text-emerald-600 border-b-2 border-emerald-600 pb-1 transition-all hover:opacity-70">
                    {expandedMEI ? 'Recolher Protocolo' : 'Abrir Protocolo Completo'}
                  </button>
                  {expandedMEI && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-6 animate-in slide-in-from-top-2">
                      {item.links?.map((link, idx) => (
                        <a key={idx} href={link.url} target="_blank" rel="noopener" className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all hover:bg-emerald-600 hover:text-white ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white'}`}>
                          <i className={`fa-solid ${link.icon}`}></i>
                          <span className="text-[9px] font-black uppercase tracking-widest">{link.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          }
          return (
            <article key={item.id} className={`p-8 border-2 rounded-4xl flex flex-col justify-between transition-all hover:border-indigo-500/50 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white shadow-xl'}`}>
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl text-white ${item.type === 'INSTITUCIONAL' ? 'bg-indigo-600' : 'bg-slate-700'}`}><i className={`fa-solid ${item.icon}`}></i></div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.date}</span>
                </div>
                <h3 className="text-2xl font-black uppercase leading-tight">{item.title}</h3>
                <p className="text-lg opacity-80 leading-relaxed">{item.content}</p>
                {item.links && (
                  <div className="grid grid-cols-1 gap-2 pt-4">
                    {item.links.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all text-indigo-500">
                        <i className={`fa-solid ${link.icon}`}></i>
                        <span className="text-[9px] font-black uppercase tracking-widest">{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

const ManifestoView = ({ isDarkMode }: any) => (
  <article className="py-12 space-y-16 animate-in fade-in duration-700">
    <h1 className="text-5xl md:text-8xl font-black italic uppercase leading-none tracking-tighter">Manifesto<br/><span className="text-indigo-600">GUIA DIGITAL _</span></h1>
    <div className={`space-y-8 text-2xl md:text-4xl font-black italic leading-tight border-l-8 border-indigo-600 pl-8 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      <p>Este não é apenas um app. É uma ponte de acessibilidade econômica.</p>
      <p className="text-indigo-600">"Dignidade é ter o domínio da técnica. Inclusão é remover a barreira entre o talento e a oportunidade."</p>
      <p>Em cada esquina da periferia, há um potencial tecnológico esperando para ser validado. Nós fornecemos o selo de qualidade para o seu corre.</p>
    </div>
  </article>
);

export default App;
