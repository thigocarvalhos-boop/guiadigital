
import React from 'react';

interface NavBtnProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const NavBtn: React.FC<NavBtnProps> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center min-w-[65px] md:min-w-[90px] h-16 md:h-20 transition-all rounded-2xl md:rounded-3xl ${active ? 'bg-indigo-600 text-white shadow-2xl scale-105 md:scale-110 translate-y-[-2px]' : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-800/20'}`}>
    <i className={`fa-solid ${icon} text-lg md:text-2xl`}></i>
    <span className="text-[8px] md:text-[10px] font-black uppercase mt-1 md:mt-2 tracking-widest">{label}</span>
  </button>
);

export default NavBtn;
