
import React, { useState } from 'react';
import { useBarber } from '../store/BarberContext';
import { Users, Calendar, TrendingUp, Scissors, Plus, Star, ShieldCheck, User as UserIcon, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SchedulingModal } from '../components/SchedulingModal';
import { UserRole } from '../types';

export const Dashboard: React.FC = () => {
  const { barbershop, currentUser, customers, appointments, allBarbers } = useBarber();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOwner = currentUser?.role === UserRole.OWNER;
  const now = new Date();
  const todayStr = now.toDateString();

  // Filtrar agendamentos da casa ou do barbeiro
  const filteredAppointments = appointments.filter(a => isOwner || a.barberId === currentUser?.id);

  // Agendamentos de Hoje
  const todayAppointments = filteredAppointments
    .filter(a => new Date(a.time).toDateString() === todayStr && a.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  // Próximos Agendamentos (Futuros, excluindo os de hoje já listados acima ou passados)
  const upcomingAppointments = filteredAppointments
    .filter(a => {
      const appDate = new Date(a.time);
      return appDate > now && appDate.toDateString() !== todayStr && a.status !== 'COMPLETED';
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const stats = [
    { 
      label: isOwner ? 'Total Hoje' : 'Meus Cortes', 
      value: todayAppointments.length, 
      icon: Calendar, 
      color: 'text-[#f59e0b]' 
    },
    { 
      label: isOwner ? 'Clientes' : 'Avaliação', 
      value: isOwner ? customers.length : '4.9', 
      icon: isOwner ? Users : Star, 
      color: 'text-blue-400' 
    },
    { 
      label: isOwner ? 'Faturamento' : 'Meu Total', 
      value: `R$ ${todayAppointments.reduce((acc, curr) => acc + curr.price, 0)}`, 
      icon: TrendingUp, 
      color: 'text-green-400' 
    },
  ];

  const renderAppointmentCard = (app: any) => {
    const customer = customers.find(c => c.id === app.customerId);
    const barber = allBarbers.find(b => b.id === app.barberId);
    const appDate = new Date(app.time);
    
    return (
      <div key={app.id} className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800 flex flex-col gap-3 transition-all hover:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-[#f59e0b]">
              {customer?.name.charAt(0) || 'C'}
            </div>
            <div>
              <p className="font-bold text-sm">{customer?.name || 'Cliente Avulso'}</p>
              <p className="text-[10px] text-zinc-500 flex items-center gap-1 italic">
                <Scissors size={10} /> {app.serviceName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#f59e0b] text-sm">R$ {app.price}</p>
            <p className="text-[10px] text-zinc-400 font-medium">
              {appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {appDate.toDateString() !== todayStr && ` - ${appDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' })}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center">
              <UserIcon size={10} className="text-zinc-400" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
              Barbeiro: <span className="text-[#f59e0b]">{barber?.name || 'Não identificado'}</span>
            </span>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full uppercase font-black tracking-widest bg-[#f59e0b]/10 text-[#f59e0b]">
            Confirmado
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-zinc-500 text-sm font-medium flex items-center gap-1">
            {isOwner ? 'Painel Administrativo' : 'Painel do Barbeiro'}
            {!isOwner && <ShieldCheck size={12} className="text-[#f59e0b]" />}
          </h2>
          <h1 className="text-2xl font-bold truncate max-w-[200px]">{currentUser?.name} 👋</h1>
        </div>
        <div className="w-12 h-12 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center overflow-hidden ring-2 ring-zinc-800 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          {barbershop?.logo ? (
            <img src={barbershop.logo} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="bg-black w-full h-full flex items-center justify-center">
              <Scissors className="text-[#f59e0b]" size={20} />
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col items-center gap-1 shadow-lg">
            <stat.icon className={stat.color} size={20} />
            <span className="text-xl font-bold">{stat.value}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold text-center leading-tight">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Agenda de Hoje */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock size={18} className="text-[#f59e0b]" />
            {isOwner ? 'Agenda de Hoje' : 'Meus Atendimentos Hoje'}
          </h3>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="p-8 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800 flex flex-col items-center gap-3">
            <Calendar className="text-zinc-700" size={32} />
            <p className="text-zinc-500 text-sm text-center">Nenhum agendamento para hoje.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map(renderAppointmentCard)}
          </div>
        )}
      </section>

      {/* Próximos Agendamentos */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar size={18} className="text-[#f59e0b]" />
            Próximos Agendamentos
          </h3>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="p-8 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800 flex flex-col items-center gap-3">
            <Clock className="text-zinc-700" size={32} />
            <p className="text-zinc-500 text-sm text-center">Sem agendamentos futuros no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map(renderAppointmentCard)}
          </div>
        )}
      </section>

      {/* Seção do Dono - Convite */}
      {isOwner && (
        <section className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-[#f59e0b]">
            <Star size={80} fill="currentColor" />
          </div>
          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-bold">Gerenciar Equipe</h3>
            <p className="text-sm text-zinc-400">Novo barbeiro? Envie este código para ele entrar na casa:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/50 p-3 rounded-xl border border-zinc-700 font-mono text-[#f59e0b] font-bold text-center select-all tracking-widest uppercase">
                {barbershop?.inviteCode}
              </div>
              <Button onClick={() => {
                navigator.clipboard.writeText(barbershop?.inviteCode || '');
                alert('Código copiado com sucesso!');
              }}>Copiar</Button>
            </div>
          </div>
        </section>
      )}
      
      {/* FAB - Floating Action Button */}
      <div className="fixed bottom-28 right-6 z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-16 h-16 bg-[#f59e0b] rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.5)] flex items-center justify-center text-black active:scale-90 transition-transform hover:rotate-90 duration-300"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      <SchedulingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
