
import React from 'react';

interface ManifestoViewProps {
  text: string;
  isDarkMode: boolean;
}

const ManifestoView: React.FC<ManifestoViewProps> = ({ text, isDarkMode }) => (
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

export default ManifestoView;
