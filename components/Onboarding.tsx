
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { generateId, sanitizeText } from '../utils';
import { notifyStudentRegistration } from '../services/notify';

interface OnboardingProps {
  onComplete: (user: UserProfile) => void;
  isDarkMode: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isDarkMode }) => {
  const [step, setStep] = useState<'name' | 'details'>('name');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [turma, setTurma] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNome(sanitizeText(e.target.value, 100));
  };

  const handleStart = async () => {
    if (nome.length >= 2) {
      const user: UserProfile = {
        id: generateId(),
        name: nome,
        email: sanitizeText(email, 200),
        turma: sanitizeText(turma, 100),
        role: 'USER',
        matrix: { Estrategia: 15, Escrita: 15, Analise: 10, Tecnica: 10, Design: 10, Audiovisual: 10 },
        dossier: [],
        level: 1,
        exp: 0,
        status: 'ACTIVE',
        registeredAt: new Date().toISOString(),
      };
      onComplete(user);
      // Notificação não bloqueia a experiência
      notifyStudentRegistration(user).catch(() => {});
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

      {step === 'name' && (
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
            onClick={() => setStep('details')}
            className="w-full h-20 md:h-28 bg-indigo-600 text-white rounded-3xl md:rounded-4xl font-black uppercase text-2xl md:text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-20"
          >
            Próximo
            <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
          </button>
        </div>
      )}

      {step === 'details' && (
        <div className="w-full max-w-md space-y-6 md:space-y-8">
          <p className="text-center text-lg md:text-xl italic opacity-60">
            Vamos por partes, {nome}. Mais dois dados rápidos para te identificar:
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">E-mail (opcional)</label>
              <input 
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="seu@email.com" 
                className={`w-full p-4 md:p-5 rounded-2xl text-lg md:text-xl font-bold outline-none border-4 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-600' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Turma / Grupo (opcional)</label>
              <input 
                value={turma} 
                onChange={e => setTurma(sanitizeText(e.target.value, 100))} 
                placeholder="Ex: Turma 2025.1" 
                className={`w-full p-4 md:p-5 rounded-2xl text-lg md:text-xl font-bold outline-none border-4 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-600' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setStep('name')}
              className={`h-16 md:h-20 px-8 rounded-2xl font-black uppercase text-sm tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'}`}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button 
              onClick={handleStart}
              className="flex-1 h-16 md:h-20 bg-indigo-600 text-white rounded-2xl md:rounded-3xl font-black uppercase text-xl md:text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Iniciar o Corre
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-12 opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">
        Instituto Guia Social • Recife
      </div>
    </div>
  );
};

export default Onboarding;
