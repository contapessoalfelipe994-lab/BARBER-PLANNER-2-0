
import React, { useState, useEffect } from 'react';
import { BarberProvider, useBarber } from './store/BarberContext';
import { Layout } from './components/Layout';
import { Auth } from './views/Auth';
import { Onboarding } from './views/Onboarding';
import { Dashboard } from './views/Dashboard';
import { Queue } from './views/Queue';
import { Customers } from './views/Customers';
import { Finance } from './views/Finance';
import { Performance } from './views/Performance';
import { UserRole } from './types';
import { LogOut, RefreshCcw, Users, Percent, ShieldCheck, X, CheckCircle, AlertCircle } from 'lucide-react';

const Toast: React.FC = () => {
  const { notification, setNotification } = useBarber();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  if (!notification) return null;

  return (
    <div className={`fixed bottom-24 left-4 right-4 p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-full duration-300 z-[200] ${
      notification.type === 'error' ? 'bg-red-600' : 'bg-[#f59e0b]'
    } text-black font-bold`}>
      <div className="flex items-center gap-3">
        {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
        <span className="text-sm">{notification.message}</span>
      </div>
      <button onClick={() => setNotification(null)} className="p-1">
        <X size={18} />
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, barbershop, isLoading, allBarbers, updateBarberCommission, logout } = useBarber();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#f59e0b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  if (!barbershop) {
    return <Onboarding />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'queue': return <Queue />;
      case 'customers': return <Customers />;
      case 'finance': return <Finance />;
      case 'performance': return <Performance />;
      case 'settings': return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <h1 className="text-2xl font-bold">Ajustes & Gestão</h1>
            <p className="text-zinc-500 text-sm">Configurações da conta e barbearia</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-[#f59e0b] font-black text-xl">
                 {currentUser.name.charAt(0)}
               </div>
               <div>
                 <p className="text-white font-bold">{currentUser.name}</p>
                 <p className="text-zinc-500 text-xs">{currentUser.email}</p>
                 <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                   <ShieldCheck size={10}/> {currentUser.role === UserRole.OWNER ? 'Proprietário' : 'Barbeiro Profissional'}
                 </span>
               </div>
            </div>
            
            <div className="pt-4 space-y-2">
              <button 
                onClick={() => window.location.reload()}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 transition-colors font-bold text-sm"
              >
                <RefreshCcw size={18} /> Recarregar Sistema
              </button>
              <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-bold text-sm"
              >
                <LogOut size={18} /> Sair da Conta
              </button>
            </div>
          </div>

          {currentUser.role === UserRole.OWNER && (
            <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users size={20} className="text-[#f59e0b]" /> Equipe & Comissões
              </h3>
              
              <div className="space-y-4">
                {allBarbers.filter(b => b.role === UserRole.BARBER).length === 0 ? (
                  <p className="text-zinc-500 text-sm italic py-4 text-center">Nenhum barbeiro vinculado ainda.</p>
                ) : (
                  allBarbers.filter(b => b.role === UserRole.BARBER).map(barber => (
                    <div key={barber.id} className="p-4 bg-black/40 rounded-3xl border border-zinc-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{barber.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-black">Comissão Atual: {barber.commission * 100}%</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="relative">
                           <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                           <input 
                             type="number" 
                             defaultValue={barber.commission * 100}
                             onBlur={(e) => {
                               const val = parseFloat(e.target.value);
                               if (!isNaN(val) && val >= 0 && val <= 100) {
                                 updateBarberCommission(barber.id, val / 100);
                               }
                             }}
                             className="w-20 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-[#f59e0b] font-bold focus:outline-none focus:border-[#f59e0b]"
                           />
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 bg-[#f59e0b]/5 rounded-2xl border border-[#f59e0b]/20">
                 <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                   * Altere o valor numérico acima para atualizar a parte do barbeiro em cada serviço finalizado.
                 </p>
              </div>
            </div>
          )}
        </div>
      );
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTab()}
      <Toast />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <BarberProvider>
      <AppContent />
    </BarberProvider>
  );
};

export default App;
