
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { generateId, sanitizeText } from '../utils';

interface OnboardingProps {
  onComplete: (user: UserProfile) => void;
  isDarkMode: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isDarkMode }) => {
  const [nome, setNome] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNome(sanitizeText(e.target.value, 100));
  };

  const handleStart = () => {
    if (nome.length >= 2) {
      onComplete({
        id: generateId(),
        name: nome,
        role: 'USER',
        email: '',
        matrix: { Estrategia: 15, Escrita: 15, Analise: 10, Tecnica: 10, Design: 10, Audiovisual: 10 },
        dossier: [],
        level: 1,
        exp: 0,
        status: 'ACTIVE',
      });
    }
  };

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
            onChange={handleNameChange} 
            placeholder="QUAL TEU NOME?" 
            className="w-full bg-transparent border-b-8 border-indigo-600/30 focus:border-indigo-600 p-4 md:p-6 text-center text-3xl md:text-6xl font-black uppercase outline-none transition-all tracking-tighter placeholder:opacity-20" 
          />
        </div>
        
        <button 
          disabled={nome.length < 2}
          onClick={handleStart} 
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

export default Onboarding;
