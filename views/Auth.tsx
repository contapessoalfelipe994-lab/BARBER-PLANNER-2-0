
import React, { useState } from 'react';
import { useBarber } from '../store/BarberContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Scissors, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const BarbeariaProLogo = () => (
  <div className="relative flex flex-col items-center justify-center mb-8">
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer Circle Ring */}
      <div className="absolute inset-0 border-4 border-[#f59e0b] rounded-full opacity-40"></div>
      <div className="absolute inset-1.5 border-2 border-[#f59e0b] rounded-full"></div>
      
      {/* Laurel Leaves (Simulated with simple SVG) */}
      <div className="absolute -bottom-2 w-24 h-8 flex justify-between px-1">
        <svg viewBox="0 0 100 30" className="w-full h-full text-[#f59e0b] fill-current opacity-80">
          <path d="M10,20 Q20,10 40,20 T70,10" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M90,20 Q80,10 60,20 T30,10" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-[#f59e0b] font-serif text-2xl font-black mb-[-4px]">B</span>
        <div className="text-[#f59e0b]">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M11 17L15 21" />
             <path d="M15 17L11 21" />
             <path d="M8 3h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
             <path d="M10 9v5a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9" />
           </svg>
        </div>
      </div>
    </div>
    
    <div className="text-center mt-6">
      <h1 className="text-3xl font-black tracking-[0.15em] text-[#f59e0b] leading-none uppercase">
        BARBEARIA PRO
      </h1>
      <div className="h-[1px] w-full bg-[#f59e0b] my-2"></div>
      <p className="text-[#f59e0b] text-[10px] font-medium tracking-[0.1em] italic opacity-80 uppercase">
        Qualidade. Tradição. Styilo.
      </p>
    </div>
  </div>
);

export const Auth: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, register } = useBarber();

  // Fix: Make handleSubmit async to await login/register promises which were causing property access errors on Promise types
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!name || !email || !password) {
        setError('Preencha todos os campos.');
        return;
      }
      // Fix: Use await to resolve the promise returned by register()
      const result = await register(name, email, password);
      if (!result.success) setError(result.message);
    } else {
      if (!email || !password) {
        setError('E-mail e senha são obrigatórios.');
        return;
      }
      // Fix: Use await to resolve the promise returned by login()
      const result = await login(email, password);
      if (!result.success) setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <BarbeariaProLogo />

        <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800 shadow-xl">
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 py-2 font-bold text-sm uppercase tracking-wider transition-all border-b-2 ${!isRegistering ? 'text-[#f59e0b] border-[#f59e0b]' : 'text-zinc-500 border-transparent'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 py-2 font-bold text-sm uppercase tracking-wider transition-all border-b-2 ${isRegistering ? 'text-[#f59e0b] border-[#f59e0b]' : 'text-zinc-500 border-transparent'}`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-500 text-xs animate-in slide-in-from-top-1">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {isRegistering && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-[38px] text-zinc-600" size={18} />
                <Input 
                  label="Nome Completo" 
                  placeholder="Seu nome" 
                  className="pl-12"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-[38px] text-zinc-600" size={18} />
              <Input 
                label="E-mail" 
                placeholder="seu@email.com" 
                type="email"
                className="pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-[38px] text-zinc-600" size={18} />
              <Input 
                label="Senha" 
                placeholder="••••••••" 
                type="password"
                className="pl-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="pt-4">
              <Button fullWidth type="submit" className="h-14 text-lg">
                {isRegistering ? 'Criar minha conta' : 'Acessar Painel'}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-[10px] uppercase font-bold tracking-[0.2em]">
          Powered by Barbearia Pro Elite
        </p>
      </div>
    </div>
  );
};
