
import React, { useState } from 'react';
import { X, Calendar, Clock, Scissors, User, Check, DollarSign, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useBarber } from '../store/BarberContext';
import { UserRole } from '../types';

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchedulingModal: React.FC<SchedulingModalProps> = ({ isOpen, onClose }) => {
  const { addAppointment, customers, addCustomer, currentUser } = useBarber();
  const [formData, setFormData] = useState({
    name: '',
    service: 'Corte Degradê',
    price: 50,
    date: new Date().toISOString().split('T')[0],
    time: '14:00'
  });

  if (!isOpen) return null;

  const isBarber = currentUser?.role === UserRole.BARBER;

  // Fix: Make handleSubmit async to correctly await asynchronous operations addCustomer and addAppointment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Tentar encontrar cliente existente pelo nome ou criar um novo
    let customer = customers.find(c => c.name.toLowerCase() === formData.name.toLowerCase());
    let customerId = customer?.id;

    if (!customerId) {
      // Fix: Await the addCustomer call to correctly retrieve the resulting ID from the promise
      customerId = await addCustomer({ name: formData.name, phone: 'N/A' });
    }

    // Fix: Await the addAppointment call to handle the asynchronous creation
    const success = await addAppointment({
      customerId: customerId,
      barberId: currentUser?.id, // Garante que o agendamento seja com o usuário logado
      serviceName: formData.service,
      price: Number(formData.price),
      time: `${formData.date}T${formData.time}:00`,
      status: 'PENDING'
    });

    if (success) {
      onClose();
      setFormData({
        name: '',
        service: 'Corte Degradê',
        price: 50,
        date: new Date().toISOString().split('T')[0],
        time: '14:00'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-[#f59e0b]" size={24} /> 
            Agendar Horário
          </h2>
          <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Confirmação do Barbeiro Responsável */}
        <div className="mb-6 p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
               <User size={16} />
             </div>
             <div>
               <p className="text-[10px] text-zinc-500 uppercase font-bold leading-none">Barbeiro Responsável</p>
               <p className="text-sm font-bold text-white">{currentUser?.name}</p>
             </div>
           </div>
           {isBarber && (
             <span className="flex items-center gap-1 text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-1 rounded-full uppercase">
               <ShieldCheck size={10} /> Meu Agendamento
             </span>
           )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Nome do Cliente" 
            placeholder="Quem vai cortar?" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="text-zinc-400 text-xs font-semibold ml-1 uppercase">Serviço / Corte</label>
              <div className="relative">
                <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <select 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pl-12 text-white focus:border-[#f59e0b] focus:outline-none appearance-none"
                  value={formData.service}
                  onChange={e => setFormData({...formData, service: e.target.value})}
                >
                  <option>Corte Degradê</option>
                  <option>Corte Social</option>
                  <option>Barba Completa</option>
                  <option>Combo (Corte + Barba)</option>
                  <option>Sobrancelha</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <Input 
                label="Preço (R$)" 
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Data" 
              type="date" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              required
            />
            <Input 
              label="Hora" 
              type="time" 
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
              required
            />
          </div>

          <div className="pt-4">
            <Button fullWidth type="submit" className="h-14 text-lg">
              <Check size={20} /> Confirmar Agendamento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
