
import React, { useState } from 'react';
import { useBarber } from '../store/BarberContext';
import { Search, UserPlus, Phone, Calendar, MessageSquare, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Customers: React.FC = () => {
  const { customers, barbershop } = useBarber();
  const [filter, setFilter] = useState<'ALL' | 'INACTIVE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'ALL') return matchesSearch;
    
    // Inactive: more than 25 days since last visit
    const lastVisit = new Date(c.lastVisit).getTime();
    const now = new Date().getTime();
    const daysSince = (now - lastVisit) / (1000 * 60 * 60 * 24);
    return matchesSearch && daysSince > 25;
  });

  const handleReactivate = (c: any) => {
    const message = encodeURIComponent(`Olá ${c.name}, faz tempo que não te vemos na ${barbershop?.name}! Que tal agendar um horário para esta semana? Estamos com saudades! ✂️`);
    window.open(`https://wa.me/${c.phone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Base de Clientes</h1>
          <p className="text-zinc-500 text-sm">{customers.length} cadastrados</p>
        </div>
        <button className="bg-[#f59e0b] p-3 rounded-xl text-black active:scale-95 shadow-lg shadow-[#f59e0b]/20">
          <UserPlus size={24} />
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className="w-full bg-zinc-900 rounded-xl py-3 pl-12 pr-4 border border-zinc-800 focus:border-[#f59e0b] focus:outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setFilter(filter === 'ALL' ? 'INACTIVE' : 'ALL')}
          className={`px-4 rounded-xl border flex items-center gap-2 transition-all ${
            filter === 'INACTIVE' 
              ? 'bg-red-500/10 border-red-500 text-red-500' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}
        >
          <Filter size={18} />
          <span className="text-xs font-bold uppercase">{filter === 'INACTIVE' ? 'Ausentes' : 'Filtro'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="py-20 text-center text-zinc-600">
            <p>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          filteredCustomers.map(c => {
            const lastVisitDate = new Date(c.lastVisit);
            const diffDays = Math.floor((new Date().getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={c.id} className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
                      {c.photo ? <img src={c.photo} /> : <span className="text-xl font-bold text-zinc-500">{c.name.charAt(0)}</span>}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{c.name}</h4>
                      <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                        <Phone size={12} /> {c.phone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-500 uppercase">Última Visita</p>
                    <p className={`text-sm font-bold ${diffDays > 25 ? 'text-red-500' : 'text-zinc-300'}`}>
                      há {diffDays} dias
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant={diffDays > 25 ? 'danger' : 'outline'} 
                    fullWidth 
                    className="text-xs h-10"
                    onClick={() => handleReactivate(c)}
                  >
                    <MessageSquare size={14} /> {diffDays > 25 ? 'Reativar Cliente' : 'Enviar Mensagem'}
                  </Button>
                  <Button variant="secondary" className="w-12 h-10 p-0">
                    <Calendar size={18} />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
