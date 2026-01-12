
import React from 'react';
import { useBarber } from '../store/BarberContext';
import { Wallet, PieChart, ArrowUpRight, ArrowDownRight, Scissors, Store } from 'lucide-react';

export const Finance: React.FC = () => {
  const { finances, allBarbers } = useBarber();

  const totalRevenue = finances.reduce((acc, curr) => acc + curr.amount, 0);
  const totalHouse = finances.reduce((acc, curr) => acc + curr.houseAmount, 0);
  const totalBarbers = finances.reduce((acc, curr) => acc + curr.barberAmount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Financeiro Global</h1>
        <p className="text-zinc-500 text-sm">Resumo da casa e comissões</p>
      </div>

      <div className="bg-[#f59e0b] rounded-[2.5rem] p-8 text-black shadow-[0_20px_40px_rgba(245,158,11,0.2)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-widest opacity-60">Faturamento Total</span>
          <Wallet size={20} />
        </div>
        <h2 className="text-4xl font-black mb-6">R$ {totalRevenue.toFixed(2)}</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase mb-1">
              <Store size={12} /> Parte da Casa
            </div>
            <p className="text-xl font-black">R$ {totalHouse.toFixed(2)}</p>
          </div>
          <div className="bg-black/10 backdrop-blur-md p-4 rounded-3xl border border-black/10">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase mb-1">
              <Scissors size={12} /> Barbeiros
            </div>
            <p className="text-xl font-black">R$ {totalBarbers.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2"><PieChart size={18} className="text-[#f59e0b]" /> Detalhes por Profissional</h3>
        <div className="space-y-3">
          {allBarbers.map(barber => {
            const barberStats = finances
              .filter(f => f.barberId === barber.id)
              .reduce((acc, curr) => ({
                rev: acc.rev + curr.amount,
                commission: acc.commission + curr.barberAmount
              }), { rev: 0, commission: 0 });

            return (
              <div key={barber.id} className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center font-bold text-zinc-400">
                    {barber.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{barber.name}</h4>
                    <p className="text-xs text-zinc-500 font-bold uppercase">{barber.commission * 100}% Comissão</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">R$ {barberStats.commission.toFixed(2)}</p>
                  <p className="text-[10px] text-[#f59e0b] font-black uppercase tracking-widest">A Pagar</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 pb-12">
        <h3 className="text-lg font-bold">Últimas Transações</h3>
        {finances.length === 0 ? (
          <p className="text-zinc-600 text-sm italic">Nenhuma transação registrada.</p>
        ) : (
          <div className="space-y-2">
            {finances.slice().reverse().map(f => (
              <div key={f.id} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                    <ArrowUpRight size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{f.description.split('-')[0]}</p>
                    <p className="text-[10px] text-zinc-500">{new Date(f.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="font-black text-white">R$ {f.amount}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
