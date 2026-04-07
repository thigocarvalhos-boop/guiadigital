
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Lesson, LessonState, PortfolioItem, AuditResult } from './types';
import { TRACKS, MURAL_ITEMS, MANIFESTO_TEXT } from './constants';
import { saveProfile, getProfile } from './db';
import { sanitizeText } from './utils';
import NavBtn from './components/NavBtn';
import Onboarding from './components/Onboarding';
import MuralView from './components/MuralView';
import ManifestoView from './components/ManifestoView';
import TrilhasView from './components/TrilhasView';
import DossieView from './components/DossieView';
import LessonEngine from './components/LessonEngine';
import OfflineBanner from './components/OfflineBanner';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('trilhas');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonState, setLessonState] = useState<LessonState>('THEORY');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  // Carrega perfil do localStorage na inicialização
  useEffect(() => {
    const saved = getProfile();
    if (saved) {
      setUser(saved);
    }
  }, []);

  // Persiste perfil quando atualizado
  useEffect(() => {
    if (user) {
      saveProfile(user);
    }
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [user, isDarkMode]);

  // IDs das lições concluídas para indicação de progresso
  const completedLessonIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(user.dossier.map(item => item.lessonId));
  }, [user]);

  const handleAudit = async (lesson: Lesson, content: string, imageBase64?: string): Promise<AuditResult> => {
    const sanitizedContent = sanitizeText(content);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: lesson.title,
          clientBriefing: lesson.clientBriefing || '',
          content: sanitizedContent,
          imageBase64,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(error.error || `HTTP ${res.status}`);
      }

      return await res.json();
    } catch (e) {
      return { score: 0, feedback: "Erro na auditoria. Verifique sua conexão com a internet.", aprovado: false, mentor: "Sistema" };
    }
  };

  const handleEditItem = (item: PortfolioItem) => {
    const allLessons = TRACKS.flatMap(t => t.lessons);
    const lesson = allLessons.find(l => l.id === item.lessonId);
    if (lesson) {
      setEditingItem(item);
      setActiveLesson(lesson);
      setLessonState('PRACTICE');
      setActiveTab('trilhas');
    }
  };

  const handleExitLesson = () => {
    setActiveLesson(null);
    setEditingItem(null);
  };

  if (!user) return <Onboarding onComplete={setUser} isDarkMode={isDarkMode} />;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <nav className={`h-24 border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 backdrop-blur-xl ${isDarkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={() => { if (!activeLesson) setActiveTab('trilhas'); else handleExitLesson(); }}>
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
          <LessonEngine lesson={activeLesson} state={lessonState} setState={setLessonState} onAudit={handleAudit} onExit={handleExitLesson} user={user} setUser={setUser} isDarkMode={isDarkMode} editingItem={editingItem} setEditingItem={setEditingItem} />
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'trilhas' && <TrilhasView tracks={TRACKS} onSelect={l => {setActiveLesson(l); setLessonState('THEORY');}} isDarkMode={isDarkMode} completedLessonIds={completedLessonIds} />}
            {activeTab === 'dossie' && <DossieView user={user} setUser={setUser} isDarkMode={isDarkMode} onEditItem={handleEditItem} />}
            {activeTab === 'mural' && <MuralView items={MURAL_ITEMS} isDarkMode={isDarkMode} />}
            {activeTab === 'manifesto' && <ManifestoView text={MANIFESTO_TEXT} isDarkMode={isDarkMode} />}
          </div>
        )}
      </main>

      <OfflineBanner />
    </div>
  );
};

export default App;
