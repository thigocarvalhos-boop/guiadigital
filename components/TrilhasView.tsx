
import React from 'react';
import { Track, Lesson } from '../types';

interface TrilhasViewProps {
  tracks: Track[];
  onSelect: (lesson: Lesson) => void;
  isDarkMode: boolean;
  completedLessonIds: Set<string>;
}

const TrilhasView: React.FC<TrilhasViewProps> = ({ tracks, onSelect, isDarkMode, completedLessonIds }) => (
  <div className="space-y-8 md:space-y-12">
    <h2 className="text-4xl md:text-6xl font-brand italic uppercase tracking-tighter leading-none">ESTAÇÕES DE <span className="text-indigo-600">PRODUÇÃO _</span></h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
      {tracks.map((t) => {
        const completedCount = t.lessons.filter(l => completedLessonIds.has(l.id)).length;
        const totalCount = t.lessons.length;
        const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return (
          <div key={t.id} className={`p-8 md:p-10 border-4 rounded-4xl md:rounded-5xl group transition-all hover:-translate-y-2 shadow-2xl ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 hover:border-indigo-500'}`}>
            <div className="text-6xl md:text-8xl mb-6 md:mb-8 grayscale group-hover:grayscale-0 transition-all duration-500">{t.icon}</div>
            <h3 className="text-3xl md:text-4xl font-brand uppercase mb-4 tracking-tighter">{t.title}</h3>
            <p className="text-lg md:text-xl opacity-60 mb-6 md:mb-8 italic leading-snug">{t.description}</p>

            {/* Barra de progresso da trilha */}
            <div className="mb-6 md:mb-8">
              <div className="flex justify-between text-[10px] md:text-[11px] font-black uppercase mb-2 tracking-widest opacity-50">
                <span>{completedCount}/{totalCount} LIÇÕES</span>
                <span>{progressPercent}%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  style={{ width: `${progressPercent}%` }}
                  className={`h-full transition-all duration-1000 rounded-full ${completedCount === totalCount && totalCount > 0 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-indigo-600 shadow-[0_0_10px_#4f46e5]'}`}
                />
              </div>
            </div>

            <div className="space-y-2 md:space-y-3 mb-8 md:mb-10">
              {t.lessons.map(l => {
                const isCompleted = completedLessonIds.has(l.id);
                return (
                  <button key={l.id} onClick={() => onSelect(l)} className={`w-full p-4 rounded-2xl text-left text-[10px] md:text-xs font-black uppercase flex items-center gap-3 transition-all ${isDarkMode ? 'bg-slate-900 hover:bg-indigo-600' : 'bg-slate-100 hover:bg-indigo-600 hover:text-white'}`}>
                    <i className={`fa-solid ${isCompleted ? 'fa-circle-check text-emerald-500' : 'fa-play'} text-[8px] md:text-[10px]`}></i> {l.title}
                  </button>
                );
              })}
            </div>
            <button onClick={() => onSelect(t.lessons[0])} className="w-full h-16 md:h-20 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-base md:text-lg shadow-xl hover:bg-indigo-500 transition-all">INICIAR TRILHA</button>
          </div>
        );
      })}
    </div>
  </div>
);

export default TrilhasView;
