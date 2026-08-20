import React from 'react';
import { BarChart3, Home, Menu, Radar, WalletCards } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onNavigateTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  onOpenMoreMenu?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigateTab,
  setActiveTab,
  onOpenMoreMenu,
}) => {
  const navigate = (tab: string) => {
    if (onNavigateTab) onNavigateTab(tab);
    else if (setActiveTab) setActiveTab(tab);
  };
  const items = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'markets', label: 'Markets', icon: BarChart3 },
    { id: 'scanner', label: 'Scanner', icon: Radar },
    { id: 'paper-trading', label: 'Paper', icon: WalletCards },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/90 bg-[#080c14]/96 px-2 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id || (item.id === 'markets' && activeTab === 'workspace');
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg border text-[10px] font-semibold ${
                active ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-transparent text-slate-500 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button onClick={onOpenMoreMenu} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg border border-transparent text-[10px] font-semibold text-slate-500 hover:bg-slate-900 hover:text-slate-200">
          <Menu className="h-4 w-4" /><span>More</span>
        </button>
      </div>
    </nav>
  );
};
