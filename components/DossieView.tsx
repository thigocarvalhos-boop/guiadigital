
import React, { useState } from 'react';
import { UserProfile, PortfolioItem, MasteryMatrix } from '../types';
import { exportDossier } from '../utils';

interface DossieViewProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  isDarkMode: boolean;
  onEditItem: (item: PortfolioItem) => void;
}

const DossieView: React.FC<DossieViewProps> = ({ user, setUser, isDarkMode, onEditItem }) => {
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState(user.name);

  const handleSaveName = () => {
    if (newName.trim().length >= 2) {
      setUser({ ...user, name: newName.trim() });
      setShowEditName(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item do dossiê?')) {
      const updatedDossier = user.dossier.filter((item) => item.id !== itemId);
      setUser({ ...user, dossier: updatedDossier });
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-4xl md:text-6xl font-brand italic uppercase tracking-tighter leading-none">SEU <span className="text-indigo-600">DOSSIÊ _</span></h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportDossier(user)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-400 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
          >
            <i className="fa-solid fa-download"></i> Exportar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-6 md:space-y-10">
          {user.dossier.length === 0 ? (
            <div className="p-12 md:p-24 border-8 border-dashed border-slate-900 rounded-5xl text-center opacity-10 italic font-black text-2xl md:text-4xl">DOSSIÊ VAZIO. INICIE UM PROJETO.</div>
          ) : (
            user.dossier.map((item) => (
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
                  <p className="text-lg md:text-xl italic opacity-70 leading-relaxed font-medium whitespace-pre-wrap">&quot;{item.writtenResponse}&quot;</p>
                  {item.evidenceImage && <img src={item.evidenceImage} alt={`Evidência do trabalho: ${item.lessonTitle}`} className="w-full h-48 md:h-80 object-cover rounded-3xl md:rounded-4xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" />}
                </div>
                <div className="p-6 md:p-10 bg-indigo-600/5 rounded-3xl md:rounded-4xl border-l-[12px] md:border-l-[16px] border-indigo-600">
                   <span className="text-[9px] md:text-[10px] font-black uppercase opacity-50 block mb-3 md:mb-4 tracking-widest flex items-center gap-2"><i className="fa-solid fa-shield-halved"></i> AUDITORIA DO DIRETOR:</span>
                   <p className="text-lg md:text-xl font-bold opacity-90 leading-relaxed italic">{item.audit.feedback}</p>
                </div>
                <div className="flex items-center justify-between mt-6 md:mt-8">
                  <span className="text-[9px] md:text-[10px] font-black uppercase opacity-30 tracking-widest">v{item.versao} • {item.date}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex items-center gap-2 px-4 py-3 bg-red-600/10 text-red-400 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                    <button
                      onClick={() => onEditItem(item)}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Editar
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
        <aside className={`p-8 md:p-12 border-4 rounded-4xl md:rounded-5xl h-fit sticky top-32 shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border'}`}>
           {/* Nome do usuário editável */}
           <div className="mb-8 md:mb-10">
             {showEditName ? (
               <div className="flex flex-col gap-2">
                 <input
                   value={newName}
                   onChange={(e) => setNewName(e.target.value)}
                   className={`w-full p-3 rounded-xl text-lg font-black uppercase outline-none border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-600' : 'bg-slate-100 border-slate-200 focus:border-indigo-500'}`}
                 />
                 <div className="flex gap-2">
                   <button onClick={handleSaveName} className="flex-1 p-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase">Salvar</button>
                   <button onClick={() => { setShowEditName(false); setNewName(user.name); }} className="flex-1 p-2 bg-slate-700 text-white rounded-lg text-[10px] font-black uppercase">Cancelar</button>
                 </div>
               </div>
             ) : (
               <button onClick={() => setShowEditName(true)} className="flex items-center gap-2 group w-full">
                 <span className="text-xl md:text-2xl font-black uppercase tracking-tighter">{user.name}</span>
                 <i className="fa-solid fa-pen text-[10px] opacity-0 group-hover:opacity-50 transition-opacity"></i>
               </button>
             )}
           </div>

           <h3 className="text-xl md:text-2xl font-black uppercase italic text-indigo-500 mb-8 md:mb-10 tracking-widest border-b-2 border-indigo-600 inline-block pb-2">HABILIDADES</h3>
           {Object.entries(user.matrix).map(([skill, value]) => (
             <div key={skill} className="mb-6 md:mb-8">
               <div className="flex justify-between text-[10px] md:text-[11px] font-black uppercase mb-3 tracking-widest"><span>{skill}</span><span>{value as number}%</span></div>
               <div className="h-3 md:h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner"><div style={{ width: `${value as number}%` }} className="h-full bg-indigo-600 shadow-[0_0_15px_#4f46e5] transition-all duration-1000"></div></div>
             </div>
           ))}
        </aside>
      </div>
    </div>
  );
};

export default DossieView;
