
import React, { useState } from 'react';
import { useBarber } from '../store/BarberContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Clock, Scissors, CheckCircle2, UserPlus, Phone } from 'lucide-react';

export const Queue: React.FC = () => {
  const { appointments, customers, addAppointment, completeAppointment } = useBarber();
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: '', price: 50 });

  const queueList = appointments.filter(a => a.status === 'QUEUE');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app we'd search for customer or create new
    addAppointment({
      serviceName: 'Corte Rápido',
      price: Number(newEntry.price),
      status: 'QUEUE'
    });
    setShowAdd(false);
    setNewEntry({ name: '', price: 50 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fila de Espera</h1>
          <p className="text-zinc-500 text-sm">Controle de atendimento rápido</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-[#f59e0b]"
        >
          <UserPlus size={24} />
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleQuickAdd} className="bg-zinc-900 p-6 rounded-2xl border border-[#f59e0b]/30 space-y-4 animate-in slide-in-from-top-2">
          <h3 className="font-bold flex items-center gap-2"><Scissors size={18} /> Novo Check-in</h3>
          <Input 
            label="Nome do Cliente" 
            placeholder="Nome Completo"
            value={newEntry.name}
            onChange={e => setNewEntry({...newEntry, name: e.target.value})}
            required
          />
          <Input 
            label="Valor do Serviço" 
            type="number"
            value={newEntry.price}
            onChange={e => setNewEntry({...newEntry, price: Number(e.target.value)})}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" fullWidth>Adicionar à Fila</Button>
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {queueList.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-600">
          <Clock size={64} opacity={0.3} />
          <p className="font-medium">Ninguém na fila no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queueList.map((entry, index) => {
            const customer = customers.find(c => c.id === entry.customerId);
            return (
              <div key={entry.id} className="relative bg-zinc-900 rounded-3xl border border-zinc-800 p-5 overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#f59e0b]"></div>
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl font-black text-zinc-600">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{customer?.name || 'Cliente Avulso'}</h4>
                      <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <Clock size={14} />
                        <span>Chegou às {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-1 rounded-md">
                      Em Espera
                    </span>
                    <p className="text-xl font-bold mt-1">R$ {entry.price}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={() => completeAppointment(entry.id)}
                  >
                    <CheckCircle2 size={18} /> Finalizar
                  </Button>
                  <button className="bg-green-600/10 text-green-500 p-3 rounded-xl border border-green-600/20 active:scale-90 transition-all">
                    <Phone size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
