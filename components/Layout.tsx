
import React from 'react';
import { Home, Users, Wallet, Trophy, Settings, ClipboardList } from 'lucide-react';
import { useBarber } from '../store/BarberContext';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser } = useBarber();

  // Definição de permissões por aba
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Início', roles: [UserRole.OWNER, UserRole.BARBER] },
    { id: 'queue', icon: ClipboardList, label: 'Fila', roles: [UserRole.OWNER] },
    { id: 'customers', icon: Users, label: 'Clientes', roles: [UserRole.OWNER] },
    { id: 'performance', icon: Trophy, label: 'Ranking', roles: [UserRole.OWNER] },
    { id: 'finance', icon: Wallet, label: 'Finanças', roles: [UserRole.OWNER] },
    { id: 'settings', icon: Settings, label: 'Ajustes', roles: [UserRole.OWNER, UserRole.BARBER] },
  ];

  const filteredNavItems = navItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-24">
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-6">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-800 px-2 py-3 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-[#f59e0b]' : 'text-zinc-500'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#f59e0b]/10' : ''}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
