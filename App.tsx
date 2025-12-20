
import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { MODULES as INITIAL_MODULES, OPPORTUNITIES, IA_TOOLS } from './constants.tsx';
import { Module, Lesson, Opportunity, UserProfile, IATool } from './types.ts';
import { GoogleGenAI } from "@google/genai";
import { initDB, addToSyncQueue } from './db.ts';

const getAI = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : null;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const triggerVibration = (type: 'light' | 'success' | 'warning') => {
  if (!window.navigator.vibrate) return;
  const p = { light: 10, success: [10, 30, 10], warning: 100 };
  window.navigator.vibrate(p[type] as any);
};

// --- Componentes de UI OS ---
const Toast = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-cyan-500';
  return (
    <div className={`fixed top-8 left-6 right-6 z-[30000] p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in ${bg} text-slate-950`}>
      <i className="fa-solid fa-bolt text-sm"></i>
      <p className="text-[10px] font-black uppercase tracking-widest">{message}</p>
    </div>
  );
};

const Onboarding = ({ onComplete }: { onComplete: (p: UserProfile) => void }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', neighborhood: '', skill: '' });

  const finish = () => {
    if (!form.name || !form.neighborhood) return;
    onComplete({ ...form, level: 1, joinedAt: Date.now() });
  };

  return (
    <div className="fixed inset-0 z-[40000] bg-slate-950 flex flex-col p-8 justify-center">
      <div className="mb-12">
        <div className="w-16 h-1 bg-cyan-600 mb-8 flex gap-1">
          {[0, 1, 2].map(s => <div key={s} className={`h-full flex-1 ${step >= s ? 'bg-cyan-500' : 'bg-slate-800'}`} />)}
        </div>
        <p className="text-cyan-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Protocolo de Ativação</p>
        <h2 className="text-3xl font-black italic uppercase text-white leading-none">
          {step === 0 && <>Qual seu <br/><span className="text-cyan-600">Nome?</span></>}
          {step === 1 && <>Onde você <br/><span className="text-cyan-600">Atua?</span></>}
          {step === 2 && <>Qual sua <br/><span className="text-cyan-600">Vocação?</span></>}
        </h2>
      </div>

      <div className="space-y-4">
        {step === 0 && <input autoFocus className="w-full bg-white/5 border-b-2 border-cyan-600 p-4 text-white text-xl font-bold outline-none" placeholder="Ex: João Silva" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />}
        {step === 1 && <input autoFocus className="w-full bg-white/5 border-b-2 border-cyan-600 p-4 text-white text-xl font-bold outline-none" placeholder="Ex: Ipsep, Recife" value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value})} />}
        {step === 2 && (
          <div className="grid grid-cols-1 gap-3">
            {['Vendas', 'Design', 'Organização', 'Comunicação'].map(s => (
              <button key={s} onClick={() => { setForm({...form, skill: s}); setStep(3); }} className={`p-5 rounded-2xl border font-black uppercase tracking-widest text-[10px] ${form.skill === s ? 'bg-cyan-600 border-cyan-400 text-slate-950' : 'bg-white/5 border-white/10 text-white'}`}>{s}</button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-between">
        {step > 0 && <button onClick={() => setStep(s => s-1)} className="text-slate-500 font-black uppercase text-[10px]">Voltar</button>}
        {step < 2 ? (
          <button onClick={() => setStep(s => s+1)} className="ml-auto bg-white text-slate-950 px-8 py-4 rounded-xl font-black uppercase text-[10px]">Próximo</button>
        ) : (
          step === 3 && <button onClick={finish} className="w-full bg-cyan-600 text-slate-950 py-5 rounded-xl font-black uppercase text-[10px] shadow-[0_0_30px_rgba(34,211,238,0.3)]">Ativar Perfil</button>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'learn' | 'tools' | 'jobs' | 'profile'>('learn');
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [totalXP, setTotalXP] = useState(0);
  const [toast, setToast] = useState<{ m: string, t: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [streetMode, setStreetMode] = useState(false);

  // IA Tool State
  const [activeTool, setActiveTool] = useState<IATool | null>(null);
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState('');

  const showToast = (m: string, t: string = 'info') => setToast({ m, t });

  useEffect(() => {
    const saved = localStorage.getItem('guia_v12_state');
    if (saved) {
      const d = JSON.parse(saved);
      setProfile(d.profile);
      setTotalXP(d.totalXP || 0);
      setLessonProgress(d.lessonProgress || {});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) localStorage.setItem('guia_v12_state', JSON.stringify({ profile, totalXP, lessonProgress }));
  }, [profile, totalXP, lessonProgress, loading]);

  const completeLesson = (lesson: Lesson, modId: string) => {
    if (lessonProgress[lesson.id]) return;
    setLessonProgress(prev => ({ ...prev, [lesson.id]: true }));
    setTotalXP(prev => prev + lesson.xpValue);
    triggerVibration('success');
    showToast(`+${lesson.xpValue} XP: ${lesson.title}`, 'success');

    // Lógica de desbloqueio dinâmico
    const mod = modules.find(m => m.id === modId);
    if (mod) {
      const allDone = mod.lessons.every(l => l.id === lesson.id || lessonProgress[l.id]);
      if (allDone) {
        showToast(`Trilha "${mod.title}" Completa!`, 'success');
        const nextIdx = modules.findIndex(m => m.id === modId) + 1;
        if (modules[nextIdx]) {
          const newMods = [...modules];
          newMods[nextIdx].status = 'current';
          setModules(newMods);
        }
      }
    }
  };

  const runIA = async () => {
    if (!activeTool || !toolInput) return;
    setLoading(true);
    try {
      const ai = getAI();
      if (!ai) throw new Error();
      const prompt = activeTool.promptTemplate
        .replace('{business_type}', toolInput)
        .replace('{neighborhood}', profile?.neighborhood || 'local')
        .replace('{input}', toolInput);
      
      const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setToolOutput(res.text || '');
    } catch (e) {
      showToast("Erro na Conexão IA", "error");
    } finally { setLoading(false); }
  };

  if (loading) return null;
  if (!profile) return <Onboarding onComplete={setProfile} />;

  return (
    <div className={`max-w-md mx-auto min-h-screen relative pb-32 transition-colors duration-500 ${streetMode ? 'bg-white text-black' : 'bg-slate-950 text-white'}`}>
      {toast && <Toast message={toast.m} type={toast.t} onClose={() => setToast(null)} />}
      
      {/* Barra de Status do Sistema */}
      <div className="px-6 py-3 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-600">S.O. Guia Ativo</span>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setStreetMode(!streetMode)} className="text-[10px] opacity-40"><i className={`fa-solid ${streetMode ? 'fa-sun' : 'fa-moon'}`}></i></button>
          <span className="text-[10px] font-black text-cyan-500 italic">{totalXP} XP</span>
        </div>
      </div>

      <header className="px-6 pt-10 pb-6">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
          Olá, <span className="text-cyan-600">{profile.name.split(' ')[0]}</span>
        </h1>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{profile.neighborhood} • Nível {Math.floor(totalXP/1000) + 1}</p>
      </header>

      <main className="px-6 space-y-8">
        {activeTab === 'learn' && (
          <div className="space-y-8 animate-in">
            {!selectedModule ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-cyan-600 rounded-3xl text-slate-950 flex flex-col justify-between aspect-square shadow-xl shadow-cyan-900/20" onClick={() => showToast("Módulo GPS Ativado")}>
                    <i className="fa-solid fa-location-arrow text-2xl"></i>
                    <p className="font-black uppercase text-[10px] tracking-widest">Maps <br/>Pro</p>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col justify-between aspect-square" onClick={() => setActiveTab('tools')}>
                    <i className="fa-solid fa-microchip text-2xl text-cyan-600"></i>
                    <p className="font-black uppercase text-[10px] tracking-widest">Ferramentas <br/>IA</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-black italic uppercase tracking-tighter">Minha Jornada</h2>
                  {modules.map(m => (
                    <div key={m.id} onClick={() => m.status !== 'locked' && setSelectedModule(m)} className={`p-6 rounded-3xl border transition-all ${m.status === 'locked' ? 'opacity-20 grayscale' : 'bg-white/5 border-white/10'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-600"><i className={`fa-solid ${m.icon}`}></i></div>
                        <span className="text-[8px] font-black uppercase text-cyan-600 tracking-widest">{m.technicalSkill}</span>
                      </div>
                      <h3 className="text-base font-black uppercase italic leading-tight">{m.title}</h3>
                      <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-600 transition-all" style={{ width: `${(m.lessons.filter(l => lessonProgress[l.id]).length / m.lessons.length) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-6 pb-20">
                <button onClick={() => setSelectedModule(null)} className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><i className="fa-solid fa-arrow-left"></i> Voltar</button>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">{selectedModule.title}</h2>
                {selectedModule.lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black text-cyan-600 uppercase">Módulo 0{idx+1}</span>
                      {lessonProgress[lesson.id] && <i className="fa-solid fa-circle-check text-emerald-500"></i>}
                    </div>
                    <p className="font-bold text-sm mb-4 leading-tight">{lesson.title}</p>
                    {!lessonProgress[lesson.id] ? (
                      <button onClick={() => completeLesson(lesson, selectedModule.id)} className="w-full py-3 bg-white text-slate-950 rounded-xl font-black uppercase text-[9px] tracking-widest">Concluir Lição</button>
                    ) : (
                      <div className="text-[8px] font-black uppercase text-emerald-500 text-center tracking-widest">Habilidade Adquirida</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-8 animate-in">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Toolbox <span className="text-cyan-600">IA</span></h2>
            {!activeTool ? (
              <div className="grid grid-cols-1 gap-4">
                {IA_TOOLS.map(tool => (
                  <button key={tool.id} onClick={() => setActiveTool(tool)} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-6 text-left active:scale-95 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 flex items-center justify-center text-xl text-cyan-600"><i className={`fa-solid ${tool.icon}`}></i></div>
                    <div>
                      <h4 className="font-black uppercase italic text-sm tracking-tight">{tool.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <button onClick={() => {setActiveTool(null); setToolOutput(''); setToolInput('');}} className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><i className="fa-solid fa-arrow-left"></i> Toolbox</button>
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                  <h3 className="font-black uppercase text-xs mb-4 text-cyan-600">{activeTool.name}</h3>
                  <textarea 
                    className="w-full bg-black/40 rounded-2xl p-4 text-white text-sm font-medium outline-none border border-white/5 min-h-[100px]" 
                    placeholder="Ex: Padaria, Pet Shop, Oficina..."
                    value={toolInput}
                    onChange={e => setToolInput(e.target.value)}
                  />
                  <button onClick={runIA} className="w-full mt-4 py-4 bg-cyan-600 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg">Gerar Resultado IA</button>
                </div>
                {toolOutput && (
                  <div className="bg-cyan-600/10 rounded-3xl p-6 border border-cyan-500/30 animate-in">
                    <p className="text-[8px] font-black uppercase text-cyan-600 mb-2 tracking-widest">Resultado IA do Guia:</p>
                    <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{toolOutput}</div>
                    <button onClick={() => { navigator.clipboard.writeText(toolOutput); showToast("Copiado!", "success"); }} className="mt-6 text-[10px] font-black uppercase underline text-cyan-600">Copiar Texto</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-8 animate-in">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Mural de <span className="text-cyan-600">Ganhos</span></h2>
            {OPPORTUNITIES.map(opp => {
              const hasSkill = Object.values(INITIAL_MODULES).some(m => m.technicalSkill === opp.requiredSkill && (m.lessons.every(l => lessonProgress[l.id]) || m.status === 'completed'));
              return (
                <div key={opp.id} className={`p-8 rounded-[32px] border transition-all ${hasSkill ? 'bg-white/5 border-white/10' : 'opacity-40 bg-slate-900 border-transparent'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">{opp.businessName}</p>
                      <h4 className="text-xl font-black italic uppercase tracking-tighter leading-tight mt-1">{opp.title}</h4>
                    </div>
                    <span className="text-green-500 font-black text-lg">{opp.reward}</span>
                  </div>
                  <div className="flex items-center gap-4 py-4 border-t border-white/5">
                    <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full">{opp.requiredSkill}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full">{opp.location}</span>
                  </div>
                  <button 
                    disabled={!hasSkill}
                    onClick={() => showToast("Candidatura Iniciada!", "success")}
                    className={`w-full mt-4 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${hasSkill ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-500'}`}
                  >
                    {hasSkill ? 'Candidatar-se' : 'Skill Bloqueada'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-10 animate-in">
             <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-slate-900 rounded-[32px] mx-auto flex items-center justify-center border-4 border-cyan-600 shadow-2xl relative">
                   <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-slate-950 font-black text-[10px]">JD</div>
                   <i className="fa-solid fa-user-ninja text-4xl text-white opacity-20"></i>
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">{profile.name}</h3>
                <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">Pilar: {profile.skill}</p>
             </div>
             
             <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Nível Atual</span>
                   <span className="font-black text-cyan-500">{Math.floor(totalXP/1000) + 1}</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                   <div className="h-full bg-cyan-600" style={{ width: `${(totalXP % 1000) / 10}%` }}></div>
                </div>
                <p className="text-[8px] font-bold text-center text-slate-500 uppercase">Faltam {1000 - (totalXP % 1000)} XP para o próximo nível</p>
             </div>

             <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 text-rose-500 font-black uppercase text-[10px] tracking-widest opacity-30">Resetar Protocolo</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 p-6 z-[500] pointer-events-none">
        <div className={`max-w-md mx-auto h-20 rounded-[32px] flex justify-around items-center px-4 glass-panel pointer-events-auto shadow-2xl ${streetMode ? 'bg-white' : ''}`}>
          {[
            { id: 'learn', icon: 'fa-graduation-cap', label: 'Trilhas' },
            { id: 'tools', icon: 'fa-bolt', label: 'IA Tools' },
            { id: 'jobs', icon: 'fa-briefcase', label: 'Mural' },
            { id: 'profile', icon: 'fa-id-badge', label: 'Perfil' }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === item.id ? 'text-cyan-600 scale-110' : 'text-slate-500'}`}>
              <i className={`fa-solid ${item.icon} text-lg`}></i>
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {loading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[20000] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default App;
