
import React from 'react';
import { MuralItem } from '../constants';

interface MuralViewProps {
  items: MuralItem[];
  isDarkMode: boolean;
}

const MuralView: React.FC<MuralViewProps> = ({ items, isDarkMode }) => (
  <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
    <h2 className="text-4xl md:text-6xl font-brand italic uppercase tracking-tighter border-b-8 border-indigo-600 pb-4 inline-block leading-none">O QUE TÁ <span className="text-indigo-600">ROLANDO _</span></h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {items.map((item) => (
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
              {item.links.map((link, idx) => (
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

export default MuralView;
