
import React, { useState, useRef } from 'react';
import { useBarber } from '../store/BarberContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Building2, UserCircle, Store, Send, Image as ImageIcon, Camera, X, Loader2, MapPin, Scissors } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { createBarbershop, joinBarbershop } = useBarber();
  const [view, setView] = useState<'CHOICE' | 'OWNER' | 'GUEST'>('CHOICE');
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    cep: '',
    address: '',
    whatsapp: '',
    code: '',
    logo: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createBarbershop(formData);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = joinBarbershop(formData.code);
    if (!success) alert('Código inválido ou barbearia inativa.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '').slice(0, 8);
    setFormData({ ...formData, cep });

    if (cep.length === 8) {
      setIsSearchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          const fullAddress = `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`;
          setFormData(prev => ({ ...prev, address: fullAddress }));
        } else {
          console.error("CEP não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({ ...formData, logo: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (view === 'CHOICE') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
        <h2 className="text-2xl font-bold mb-8 text-center tracking-tight">Escolha seu Perfil</h2>
        <div className="grid gap-4 w-full max-w-sm">
          <button 
            onClick={() => setView('OWNER')}
            className="flex flex-col items-center gap-4 p-8 bg-zinc-900 rounded-[2.5rem] border-2 border-transparent hover:border-[#f59e0b] transition-all group shadow-2xl"
          >
            <div className="p-4 bg-[#f59e0b]/10 rounded-full group-hover:scale-110 transition-transform">
              <Store className="text-[#f59e0b]" size={32} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold">Sou Dono</h3>
              <p className="text-sm text-zinc-500">Quero gerenciar minha equipe e barbearia</p>
            </div>
          </button>

          <button 
            onClick={() => setView('GUEST')}
            className="flex flex-col items-center gap-4 p-8 bg-zinc-900 rounded-[2.5rem] border-2 border-transparent hover:border-[#f59e0b] transition-all group shadow-2xl"
          >
            <div className="p-4 bg-[#f59e0b]/10 rounded-full group-hover:scale-110 transition-transform">
              <UserCircle className="text-[#f59e0b]" size={32} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold">Sou Barbeiro</h3>
              <p className="text-sm text-zinc-500">Recebi um convite de uma barbearia</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black p-6 overflow-y-auto no-scrollbar">
      <button onClick={() => setView('CHOICE')} className="text-[#f59e0b] text-sm mb-8 w-fit flex items-center gap-1 font-bold bg-[#f59e0b]/10 px-4 py-2 rounded-full uppercase tracking-wider">
        ← Voltar
      </button>
      
      {view === 'OWNER' ? (
        <form onSubmit={handleCreate} className="space-y-6 max-w-md mx-auto w-full">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Criar sua Barbearia</h2>
            <p className="text-zinc-500 text-sm">Preencha os dados da sua empresa para começar</p>
          </div>

          <div className="flex justify-center py-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-36 h-36 bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#f59e0b] transition-all overflow-hidden group shadow-xl"
            >
              {formData.logo ? (
                <>
                  <img src={formData.logo} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white" size={24} />
                  </div>
                  <button 
                    onClick={removeLogo}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <div className="p-3 bg-zinc-800 rounded-2xl group-hover:bg-[#f59e0b]/20 group-hover:scale-110 transition-all">
                    <Scissors className="text-zinc-500 group-hover:text-[#f59e0b]" size={32} />
                  </div>
                  <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest text-center px-4">Upload da Logo Premium</span>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Input 
              label="Nome da Barbearia" 
              placeholder="Ex: Barbearia Pro"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            
            <div className="relative">
              <Input 
                label="CEP" 
                placeholder="00000-000"
                value={formData.cep}
                onChange={handleCepChange}
                maxLength={9}
                required
              />
              {isSearchingCep && (
                <div className="absolute right-4 bottom-3.5">
                  <Loader2 className="text-[#f59e0b] animate-spin" size={18} />
                </div>
              )}
            </div>

            <div className="relative">
              <Input 
                label="Endereço" 
                placeholder="Rua, Número, Bairro"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
                className="pr-10"
              />
              <MapPin className="absolute right-4 bottom-3.5 text-zinc-600" size={18} />
            </div>

            <Input 
              label="WhatsApp de Contato" 
              placeholder="(00) 00000-0000"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              required
            />
          </div>

          <div className="pt-4">
            <Button fullWidth type="submit" className="h-14 text-lg">
              Finalizar Cadastro
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="space-y-6 max-w-md mx-auto w-full">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Entrar em Equipe</h2>
            <p className="text-zinc-500 text-sm">Cole o código de convite abaixo</p>
          </div>

          <div className="space-y-6">
            <Input 
              label="Código de Convite" 
              placeholder="EX: ABC-123"
              className="text-center font-mono uppercase text-2xl tracking-widest h-20"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
            />
            
            <div className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#f59e0b]/10 rounded-xl flex items-center justify-center text-[#f59e0b]">
                <Send size={20} />
              </div>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                O código de convite é fornecido pelo administrador da barbearia através da dashboard.
              </p>
            </div>

            <Button fullWidth type="submit" className="h-14 text-lg" icon={<Send size={20}/>}>
              Entrar Agora
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
