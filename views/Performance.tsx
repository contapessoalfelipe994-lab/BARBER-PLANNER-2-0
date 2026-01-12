
import React from 'react';
import { useBarber } from '../store/BarberContext';
import { Trophy, TrendingUp, Scissors, Star, Target } from 'lucide-react';

export const Performance: React.FC = () => {
  const { allBarbers, finances } = useBarber();

  const getBarberStats = (barberId: string) => {
    const barberFinances = finances.filter(f => f.barberId === barberId);
    const revenue = barberFinances.reduce((acc, curr) => acc + curr.amount, 0);
    const count = barberFinances.length;
    return { revenue, count };
  };

  const rankedBarbers = allBarbers
    .map(b => ({ ...b, ...getBarberStats(b.id) }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#f59e0b] rounded-2xl shadow-[0_10px_20px_rgba(245,158,11,0.2)]">
          <Trophy size={24} className="text-black" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Ranking de Performance</h1>
          <p className="text-zinc-500 text-sm">Resultados do faturamento mensal</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2"><Target size={18} className="text-[#f59e0b]" /> Meta Coletiva</h3>
          <span className="text-xs text-zinc-500">75% da meta atingida</span>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#f59e0b] w-3/4 shadow-[0_0_15px_#f59e0b]"></div>
        </div>
      </div>

      <div className="space-y-4">
        {rankedBarbers.map((barber, index) => {
          const isTop = index < 3;
          const medals = ['🥇', '🥈', '🥉'];
          
          return (
            <div 
              key={barber.id}
              className={`bg-zinc-900 p-5 rounded-3xl border transition-all ${
                isTop ? 'border-[#f59e0b]/50 ring-1 ring-[#f59e0b]/20 scale-[1.02]' : 'border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center font-bold overflow-hidden border-2 border-zinc-700">
                      {barber.avatar ? <img src={barber.avatar} alt={barber.name} /> : <Scissors size={24} className="text-zinc-600" />}
                    </div>
                    {isTop && (
                      <div className="absolute -top-2 -left-2 text-2xl drop-shadow-lg">
                        {medals[index]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg">{barber.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Scissors size={12} /> {barber.count} Cortes</span>
                      <span className="flex items-center gap-1"><Star size={12} className="text-[#f59e0b]" /> 4.9</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[#f59e0b] font-black text-xl">R$ {barber.revenue}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Faturamento</p>
                </div>
              </div>

              {isTop && (
                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between text-[11px] font-bold uppercase text-zinc-400 tracking-tighter">
                  <span className="flex items-center gap-1 text-green-400"><TrendingUp size={12} /> +12% vs mês anterior</span>
                  <span>Ver perfil detalhado</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
