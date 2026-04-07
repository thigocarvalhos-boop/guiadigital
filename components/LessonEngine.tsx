
import React, { useState, useEffect } from 'react';
import { UserProfile, Lesson, LessonState, PortfolioItem, AuditResult } from '../types';
import { generateId, sanitizeText } from '../utils';

interface LessonEngineProps {
  lesson: Lesson;
  state: LessonState;
  setState: (state: LessonState) => void;
  onAudit: (lesson: Lesson, content: string, imageBase64?: string) => Promise<AuditResult>;
  onExit: () => void;
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  isDarkMode: boolean;
  editingItem: PortfolioItem | null;
  setEditingItem: (item: PortfolioItem | null) => void;
}

const LessonEngine: React.FC<LessonEngineProps> = ({ lesson, state, setState, onAudit, onExit, user, setUser, isDarkMode, editingItem, setEditingItem }) => {
  const [written, setWritten] = useState(editingItem ? editingItem.writtenResponse : '');
  const [imageBase64, setImageBase64] = useState<string | null>(editingItem ? editingItem.evidenceImage || null : null);
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setWritten(editingItem.writtenResponse);
      setImageBase64(editingItem.evidenceImage || null);
    }
  }, [editingItem]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleWrittenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWritten(sanitizeText(e.target.value));
  };

  const handleExit = () => {
    if (state === 'PRACTICE' && written.length > 0 && !editingItem) {
      if (!window.confirm('Você tem trabalho em andamento. Deseja sair sem salvar?')) {
        return;
      }
    }
    onExit();
  };

  const handleQuizSubmit = () => {
    if (quizSelected === null) return;
    setQuizAnswered(true);
    if (quizSelected === lesson.quiz.answer) {
      setTimeout(() => setState('PRACTICE'), 1500);
    }
  };

  const submit = async () => {
    if (written.length < 30) return alert("Seja mais detalhado no seu corre.");
    setLoading(true);
    const result = await onAudit(lesson, written, imageBase64 || undefined);
    setAudit(result);
    setLoading(false);
    if (result.aprovado) {
      const comp = lesson.competency as keyof typeof user.matrix;
      const newMatrix = { ...user.matrix };

      if (editingItem) {
        const updatedDossier = user.dossier.map((item: PortfolioItem) =>
          item.id === editingItem.id
            ? {
                ...item,
                writtenResponse: written,
                evidenceImage: imageBase64 || undefined,
                audit: result,
                date: new Date().toLocaleDateString(),
                versao: item.versao + 1,
              }
            : item
        );
        setUser({ ...user, dossier: updatedDossier, matrix: newMatrix });
        setEditingItem(null);
      } else {
        const existingIndex = user.dossier.findIndex((item: PortfolioItem) => item.lessonId === lesson.id);
        if (existingIndex !== -1) {
          const existing = user.dossier[existingIndex];
          const updatedDossier = user.dossier.map((item: PortfolioItem) =>
            item.id === existing.id
              ? {
                  ...item,
                  writtenResponse: written,
                  evidenceImage: imageBase64 || undefined,
                  audit: result,
                  date: new Date().toLocaleDateString(),
                  versao: item.versao + 1,
                }
              : item
          );
          setUser({ ...user, dossier: updatedDossier, matrix: newMatrix });
        } else {
          newMatrix[comp] = Math.min(newMatrix[comp] + 15, 100);
          const newItem: PortfolioItem = {
            id: generateId(),
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            trackId: lesson.category,
            writtenResponse: written,
            evidenceImage: imageBase64 || undefined,
            audit: result,
            date: new Date().toLocaleDateString(),
            versao: 1,
          };
          setUser({ ...user, dossier: [newItem, ...user.dossier], matrix: newMatrix });
        }
      }
      setState('REVIEW');
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in slide-in-from-bottom-12">
      {/* Botão de voltar */}
      <button onClick={handleExit} className="flex items-center gap-2 text-sm font-black uppercase opacity-40 hover:opacity-100 transition-opacity tracking-widest">
        <i className="fa-solid fa-arrow-left"></i> Voltar às trilhas
      </button>

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
              {lesson.quiz.options.map((opt, i) => {
                let optionStyle = 'border-transparent bg-slate-800/20 hover:bg-slate-800/40';
                if (quizAnswered) {
                  if (i === lesson.quiz.answer) {
                    optionStyle = 'border-emerald-500 bg-emerald-500/10';
                  } else if (i === quizSelected && i !== lesson.quiz.answer) {
                    optionStyle = 'border-red-500 bg-red-500/10';
                  }
                } else if (quizSelected === i) {
                  optionStyle = 'border-indigo-600 bg-indigo-600/10';
                }

                return (
                  <button
                    key={i}
                    onClick={() => !quizAnswered && setQuizSelected(i)}
                    disabled={quizAnswered}
                    className={`w-full p-6 md:p-8 rounded-2xl md:rounded-3xl text-left font-bold transition-all border-4 text-lg md:text-2xl ${optionStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizAnswered && (
              <div className={`mt-6 p-6 rounded-2xl ${quizSelected === lesson.quiz.answer ? 'bg-emerald-500/10 border-2 border-emerald-500/30' : 'bg-amber-500/10 border-2 border-amber-500/30'}`}>
                <p className="font-bold text-lg md:text-xl italic">
                  {quizSelected === lesson.quiz.answer ? '✅ ' : '❌ '}
                  {lesson.quiz.explanation}
                </p>
              </div>
            )}

            {!quizAnswered ? (
              <button
                disabled={quizSelected === null}
                onClick={handleQuizSubmit}
                className="w-full h-16 md:h-24 bg-indigo-600 text-white rounded-3xl md:rounded-4xl font-black uppercase text-lg md:text-2xl shadow-xl mt-10 md:mt-12 hover:bg-indigo-500 transition-all disabled:opacity-30"
              >
                VERIFICAR RESPOSTA
              </button>
            ) : quizSelected !== lesson.quiz.answer ? (
              <button
                onClick={() => { setQuizSelected(null); setQuizAnswered(false); }}
                className="w-full h-16 md:h-24 bg-amber-600 text-white rounded-3xl md:rounded-4xl font-black uppercase text-lg md:text-2xl shadow-xl mt-10 md:mt-12 hover:bg-amber-500 transition-all"
              >
                TENTAR NOVAMENTE
              </button>
            ) : null}
          </div>
        </div>
      )}

      {state === 'PRACTICE' && (
        <div className="space-y-8 md:space-y-10 max-w-6xl mx-auto">
          {editingItem && (
            <div className="p-4 md:p-6 bg-amber-500/10 border-4 border-amber-500/30 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-pen-to-square text-amber-500 text-xl"></i>
                <span className="font-black uppercase text-sm md:text-base tracking-widest text-amber-500">MODO EDIÇÃO — v{editingItem.versao}</span>
              </div>
              <button onClick={onExit} className="text-[10px] md:text-xs font-black uppercase opacity-50 hover:opacity-100 transition-opacity tracking-widest">
                <i className="fa-solid fa-xmark mr-1"></i> Cancelar
              </button>
            </div>
          )}
          <div className="p-6 md:p-10 bg-amber-500/10 border-4 border-amber-500/30 rounded-4xl italic font-bold text-lg md:text-2xl leading-relaxed shadow-xl">
            <span className="text-[9px] md:text-[10px] font-black uppercase opacity-60 block mb-3 md:mb-4 tracking-widest"><i className="fa-solid fa-briefcase mr-2"></i> BRIEFING DO CLIENTE:</span>
            &quot;{lesson.clientBriefing}&quot;
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <textarea value={written} onChange={handleWrittenChange} className={`w-full h-80 md:h-[500px] p-8 md:p-12 rounded-4xl md:rounded-5xl border-4 outline-none text-xl md:text-3xl font-mono leading-relaxed ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-600' : 'bg-white border focus:border-indigo-500 shadow-inner'}`} placeholder="Sua solução profissional..." />
            <div onClick={() => document.getElementById('fileIn')?.click()} className={`h-80 md:h-[500px] border-8 border-dashed rounded-4xl md:rounded-5xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-600/5 transition-all group ${imageBase64 ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-indigo-600'}`}>
               {imageBase64 ? <img src={imageBase64} alt="Preview do trabalho enviado" className="h-full w-full object-cover rounded-3xl md:rounded-4xl p-4 md:p-6" /> : <><i className="fa-solid fa-cloud-arrow-up text-6xl md:text-8xl mb-6 md:mb-8 opacity-10 group-hover:opacity-30"></i><span className="font-black uppercase text-base md:text-xl tracking-widest opacity-30 text-center">UPLOAD DO TRABALHO</span></>}
               <input id="fileIn" type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </div>
          </div>
          <button disabled={loading || written.length < 30} onClick={submit} className="w-full h-24 md:h-32 bg-emerald-600 text-white rounded-4xl md:rounded-5xl font-black uppercase text-2xl md:text-4xl shadow-2xl hover:bg-emerald-500 transition-all disabled:opacity-30">
            {loading ? 'AUDITANDO RESULTADO...' : editingItem ? 'SALVAR ALTERAÇÕES' : 'ENVIAR PARA O DIRETOR'}
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
             <p className="text-xl md:text-3xl font-bold italic leading-relaxed mb-10 md:mb-12">&quot;{audit?.feedback}&quot;</p>
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

export default LessonEngine;
