
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Track, Lesson, AuditResult } from './types.ts';
import { TRACKS } from './constants.tsx';

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dash' | 'tracks' | 'dossier' | 'mural'>('dash');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('guia_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('guia_user', JSON.stringify(user));
  }, [user]);

  const handleAudit = async (lesson: Lesson, delivery: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Você é um Mentor Sênior de Agência no Porto Digital (Recife).
      Avalie a entrega do aluno para a lição: ${lesson.title}.
      Entrega: ${delivery}
      
      Regras:
      1. Use gírias locais (visse, boy, massa, oxente, bronca) de forma profissional.
      2. Dê uma nota de 0 a 10.
      3. Forneça um feedback técnico real e direto.
      4. Retorne APENAS um JSON no formato: {"score": number, "feedback": "string", "mentor": "Nome do Mentor"}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });
      
      const result: AuditResult = JSON.parse(response.text);
      
      if (user) {
        const newMatrix = { ...user.matrix };
        newMatrix[lesson.competency] = Math.min(10, (newMatrix[lesson.competency] + result.score) / (user.dossier.length > 0 ? 1.5 : 1));
        
        setUser({
          ...user,
          exp: user.exp + (result.score * 10),
          matrix: newMatrix,
          dossier: [
            ...user.dossier,
            { 
              lessonId: lesson.id, 
              lessonTitle: lesson.title, 
              assetUrl: delivery, 
              audit: result,
              date: new Date().toLocaleDateString()
            }
          ]
        });
      }
      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  if (!user) return <Onboarding onComplete={setUser} />;

  return (
    <div className="min-h-screen bg-dark pb-24">
      {/* HUD Header */}
      <header className="p-6 glass border-b border-white/5 sticky top-0 z-50 flex justify-between items-center">
        <div>
          <h1 className="font-archivo text-xl text-primary tracking-tighter">GUI.A<span className="text-white">DIGITAL</span></h1>
          <p className="text-[10px] font-mono text-secondary">LVL {user.level} // EXP {user.exp}</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] text-white/40 font-mono">STATUS: ONLINE</p>
            <p className="text-xs font-bold">{user.name.toUpperCase()}</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {activeTab === 'dash' && <Dashboard user={user} />}
        {activeTab === 'tracks' && (
          <div className="space-y-6">
            <h2 className="font-archivo text-2xl mb-8">TRILHAS DE APRENDIZADO</h2>
            {TRACKS.map(track => (
              <div key={track.id} className="glass p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <i className={`fa-solid ${track.icon} text-primary text-xl`}></i>
                    <h3 className="font-bold">{track.title}</h3>
                  </div>
                  <button 
                    onClick={() => setActiveLesson(track.lessons[0])}
                    className="bg-primary text-dark font-bold px-4 py-2 rounded-lg text-xs hover:scale-105 transition-transform"
                  >
                    INICIAR CORRE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'dossier' && <DossierView user={user} />}
        {activeTab === 'mural' && <MuralView />}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass rounded-2xl h-16 flex items-center justify-around px-4 border border-white/10 shadow-2xl z-50">
        {[
          { id: 'dash', icon: 'fa-grid-2', label: 'DASH' },
          { id: 'tracks', icon: 'fa-code-branch', label: 'TRILHAS' },
          { id: 'dossier', icon: 'fa-id-badge', label: 'DOSSIÊ' },
          { id: 'mural', icon: 'fa-rocket', label: 'MURAL' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center transition-all ${activeTab === tab.id ? 'text-primary' : 'text-white/40'}`}
          >
            <i className={`fa-solid ${tab.icon} text-lg`}></i>
            <span className="text-[9px] font-bold mt-1">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Lesson Modal */}
      {activeLesson && (
        <LessonPlayer 
          lesson={activeLesson} 
          onClose={() => setActiveLesson(null)} 
          onAudit={handleAudit}
        />
      )}
    </div>
  );
};

const Dashboard = ({ user }: { user: UserProfile }) => (
  <div className="animate-in fade-in duration-500">
    <div className="grid grid-cols-2 gap-4 mb-8">
      <div className="glass p-6 rounded-2xl border-l-4 border-primary">
        <p className="text-[10px] text-white/40 font-mono mb-2">MAESTRIA MÉDIA</p>
        <p className="text-3xl font-archivo">{(Object.values(user.matrix).reduce((a,b)=>a+b,0)/4).toFixed(1)}</p>
      </div>
      <div className="glass p-6 rounded-2xl border-l-4 border-secondary">
        <p className="text-[10px] text-white/40 font-mono mb-2">ATIVOS AUDITADOS</p>
        <p className="text-3xl font-archivo">{user.dossier.length}</p>
      </div>
    </div>
    
    <section className="glass p-6 rounded-2xl mb-8">
      <h3 className="font-archivo text-sm text-primary mb-6">MATRIZ DE COMPETÊNCIAS</h3>
      <div className="space-y-4 font-mono text-xs">
        {Object.entries(user.matrix).map(([key, val]) => (
          <div key={key}>
            <div className="flex justify-between mb-1">
              <span>{key.toUpperCase()}</span>
              <span>{val.toFixed(1)}/10</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${val * 10}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const LessonPlayer = ({ lesson, onClose, onAudit }: { lesson: Lesson, onClose: () => void, onAudit: any }) => {
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const startAudit = async () => {
    setIsAuditing(true);
    const res = await onAudit(lesson, delivery);
    setResult(res);
    setIsAuditing(false);
    setStep(5);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-dark/95 backdrop-blur-xl p-6 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <span className="text-[10px] font-mono text-primary">LIÇÃO ID: {lesson.id}</span>
        <button onClick={onClose} className="text-white/40 hover:text-white"><i className="fa-solid fa-xmark text-2xl"></i></button>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full">
        <div className="flex gap-2 mb-8">
          {[1,2,3,4,5].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-primary' : 'bg-white/10'}`}></div>
          ))}
        </div>

        {step === 1 && (
          <div className="animate-in slide-in-from-bottom-4">
            <h2 className="font-archivo text-2xl text-primary mb-4 uppercase">{lesson.title}</h2>
            <p className="text-white/80 leading-relaxed mb-8">{lesson.theory}</p>
            <button onClick={() => setStep(2)} className="btn-primary w-full py-4 rounded-xl font-bold bg-primary text-dark">ENTENDIDO, BORA!</button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-bottom-4">
            <h3 className="font-archivo text-xl mb-6">VALIDAÇÃO TÉCNICA</h3>
            <div className="glass p-6 rounded-2xl mb-8">
              <p className="mb-6">{lesson.quiz.question}</p>
              <div className="space-y-3">
                {lesson.quiz.options.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => i === lesson.quiz.answer ? setStep(3) : alert('Errou o passo, boy! Tenta de novo.')}
                    className="w-full p-4 rounded-xl border border-white/10 text-left hover:bg-white/5 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-bottom-4">
            <h3 className="font-archivo text-xl mb-6">LAB DE ESCRITA</h3>
            <p className="text-white/60 mb-6">{lesson.labPrompt}</p>
            <textarea 
              className="w-full h-48 glass p-4 rounded-2xl outline-none focus:ring-2 ring-primary mb-8"
              placeholder="Digite aqui seu raciocínio estratégico..."
            ></textarea>
            <button onClick={() => setStep(4)} className="btn-primary w-full py-4 rounded-xl font-bold bg-primary text-dark">PRONTO PARA ENTREGAR</button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in slide-in-from-bottom-4">
            <h3 className="font-archivo text-xl mb-6">ENTREGA MULTIMODAL</h3>
            <p className="text-white/60 mb-6">Mande o link do seu ativo (Canva/Figma/Drive):</p>
            <input 
              value={delivery}
              onChange={e => setDelivery(e.target.value)}
              className="w-full glass p-4 rounded-2xl outline-none mb-8"
              placeholder="https://..."
            />
            <button 
              disabled={isAuditing}
              onClick={startAudit} 
              className="btn-primary w-full py-4 rounded-xl font-bold bg-primary text-dark flex items-center justify-center gap-4"
            >
              {isAuditing ? <><i className="fa-solid fa-spinner animate-spin"></i> AUDITANDO NO PORTO...</> : 'SUBMETER PARA AUDITORIA'}
            </button>
          </div>
        )}

        {step === 5 && result && (
          <div className="animate-in zoom-in-95">
             <div className="text-center mb-8">
                <div className="inline-block px-8 py-4 glass rounded-3xl border-2 border-primary mb-4">
                   <p className="text-4xl font-archivo">{result.score}</p>
                   <p className="text-[10px] font-mono tracking-widest uppercase">Nota do Mentor</p>
                </div>
                <h3 className="font-archivo text-primary">AUDITORIA CONCLUÍDA!</h3>
             </div>
             
             <div className="glass p-6 rounded-2xl mb-8 font-mono">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-full bg-secondary"></div>
                   <p className="text-xs font-bold">{result.mentor} diz:</p>
                </div>
                <p className="text-sm text-white/80 leading-relaxed italic">"{result.feedback}"</p>
             </div>

             <button onClick={onClose} className="w-full py-4 rounded-xl border border-primary text-primary font-bold">VOLTAR PARA O DASHBOARD</button>
          </div>
        )}
      </div>
    </div>
  );
};

const DossierView = ({ user }: { user: UserProfile }) => (
  <div className="animate-in slide-in-from-bottom-4">
    <h2 className="font-archivo text-2xl mb-8">MEU DOSSIÊ DIGITAL</h2>
    <div className="grid gap-6">
      {user.dossier.map((item, i) => (
        <div key={i} className="glass p-6 rounded-2xl flex gap-6 items-center">
           <div className="w-20 h-20 rounded-xl bg-surface flex items-center justify-center border border-white/10 shrink-0">
              <i className="fa-solid fa-file-signature text-2xl text-primary"></i>
           </div>
           <div>
              <h4 className="font-bold text-primary">{item.lessonTitle}</h4>
              <p className="text-[10px] font-mono text-white/40 mb-2">{item.date} // NOTA: {item.audit.score}</p>
              <p className="text-xs text-white/60 line-clamp-2 italic">"{item.audit.feedback}"</p>
           </div>
        </div>
      ))}
      {user.dossier.length === 0 && (
        <div className="text-center py-20 opacity-20">
          <i className="fa-solid fa-box-open text-6xl mb-4"></i>
          <p className="font-archivo">NADA AUDITADO AINDA, BOY.</p>
        </div>
      )}
    </div>
  </div>
);

const MuralView = () => (
  <div className="animate-in slide-in-from-bottom-4 space-y-8">
    <h2 className="font-archivo text-2xl">MURAL DE ACELERAÇÃO</h2>
    
    <div className="grid gap-4">
      <div className="glass p-6 rounded-2xl border-l-4 border-cyan-400">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <i className="fa-solid fa-building-flag"></i> GO RECIFE
        </h4>
        <p className="text-xs text-white/60 mb-4">Conecte seu perfil diretamente ao portal de empregabilidade da prefeitura.</p>
        <a href="https://gorecife.recife.pe.gov.br" target="_blank" className="text-primary text-xs font-bold uppercase tracking-tighter underline">Conectar agora</a>
      </div>

      <div className="glass p-6 rounded-2xl border-l-4 border-emerald-400">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <i className="fa-solid fa-address-card"></i> FORMALIZAÇÃO MEI
        </h4>
        <p className="text-xs text-white/60 mb-4">Saia da informalidade. Guia prático para emitir sua nota fiscal de serviço.</p>
        <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" target="_blank" className="text-primary text-xs font-bold uppercase tracking-tighter underline">Portal do Empreendedor</a>
      </div>
    </div>

    <section>
      <h3 className="font-archivo text-sm text-primary mb-6">PRÓXIMOS GIGS</h3>
      <div className="space-y-3 opacity-50 grayscale pointer-events-none">
         <div className="glass p-4 rounded-xl border border-white/5 flex justify-between items-center">
            <span className="text-xs font-bold">Social Media JR (Agência B)</span>
            <span className="text-[10px] bg-white/10 px-2 py-1 rounded">REQUISITO: ESTRATÉGIA LVL 8</span>
         </div>
      </div>
    </section>
  </div>
);

const Onboarding = ({ onComplete }: { onComplete: (u: UserProfile) => void }) => {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-dark z-[200] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <h1 className="font-archivo text-4xl text-primary mb-4 tracking-tighter">GUI.A<br/><span className="text-white">DIGITAL</span></h1>
        <p className="text-white/40 font-mono text-xs mb-12 uppercase tracking-[0.2em]">Sua carreira no Porto Digital começa aqui.</p>
        
        <input 
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="COMO TE CHAMAM NO RECHE?"
          className="w-full glass p-5 rounded-2xl font-archivo text-center outline-none focus:ring-2 ring-primary mb-6"
        />
        
        <button 
          disabled={!name}
          onClick={() => onComplete({
            name, level: 1, exp: 0, 
            matrix: { Estrategia: 0, Escrita: 0, Analise: 0, Tecnica: 0 },
            dossier: []
          })}
          className="w-full py-5 bg-primary text-dark font-archivo text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,242,255,0.3)]"
        >
          INICIALIZAR OS
        </button>
      </div>
    </div>
  );
};

export default App;
