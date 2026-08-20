import React from 'react';
import { ClipboardList, Search, Settings, Sparkles, X } from 'lucide-react';
import { navigationGroups } from './navigation';

interface MobileNavDrawerProps {
  open: boolean;
  activeTab: string;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenAudit: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  open,
  activeTab,
  onClose,
  onNavigate,
  onOpenSearch,
  onOpenAudit,
}) => {
  if (!open) return null;
  const navigate = (tab: string) => {
    onNavigate(tab);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close navigation" />
      <aside className="absolute inset-y-0 left-0 flex w-[86vw] max-w-[330px] flex-col border-r border-slate-800 bg-[#090d16] shadow-2xl">
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <button onClick={() => navigate('dashboard')} className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-300"><Sparkles className="h-4 w-4" /></div>
            <div className="text-left">
              <div className="font-mono text-[13px] font-black tracking-[0.15em] text-slate-50">SIGNAL DESK</div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-slate-500">Command Workspace</div>
            </div>
          </button>
          <button onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-100" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-3">
          <button onClick={() => { onOpenSearch(); onClose(); }} className="flex w-full items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-400">
            <Search className="h-4 w-4 text-cyan-400" /> Search markets & commands
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-5">
            {navigationGroups.map((group) => (
              <div key={group.id}>
                <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">{group.label}</div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.id || (item.id === 'workspace' && activeTab === 'terminal');
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left ${
                          active ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200' : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900 hover:text-slate-100'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold">{item.label}</div>
                          <div className="truncate text-[10px] text-slate-600">{item.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button onClick={onOpenAudit} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-slate-100"><ClipboardList className="h-4 w-4" /> Evidence Audit</button>
          <button onClick={() => navigate('settings')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-slate-100"><Settings className="h-4 w-4" /> Settings</button>
        </div>
      </aside>
    </div>
  );
};
