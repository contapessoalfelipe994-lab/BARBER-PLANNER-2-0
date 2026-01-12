
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-zinc-400 text-xs font-semibold ml-1 uppercase">{label}</label>}
      <input 
        className={`bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#f59e0b] focus:outline-none transition-all placeholder:text-zinc-600 ${className}`}
        {...props}
      />
    </div>
  );
};
