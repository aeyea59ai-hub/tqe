import React from 'react';
import { ChevronLeft, ChevronRight, ClipboardList, Search, Settings, Sparkles } from 'lucide-react';
import { navigationGroups } from './navigation';

interface AppSidebarProps {
  activeTab: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenAudit: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  collapsed,
  onToggleCollapsed,
  onNavigate,
  onOpenSearch,
  onOpenAudit,
}) => (
  <aside
    className={`hidden md:flex h-screen sticky top-0 shrink-0 flex-col border-r border-slate-800/90 bg-[#090d16] text-slate-200 transition-[width] duration-200 ${
      collapsed ? 'w-[72px]' : 'w-[248px]'
    }`}
    aria-label="Primary navigation"
  >
    <div className="h-16 flex items-center border-b border-slate-800/90 px-3">
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex min-w-0 items-center gap-3 ${collapsed ? 'justify-center w-full' : 'flex-1'}`}
        aria-label="Open Signal Desk dashboard"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-300">
          <Sparkles className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0 text-left">
            <div className="truncate font-mono text-[13px] font-black tracking-[0.15em] text-slate-50">SIGNAL DESK</div>
            <div className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Futures Intelligence</div>
          </div>
        )}
      </button>
      {!collapsed && (
        <button onClick={onToggleCollapsed} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-100" aria-label="Collapse sidebar">
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
    </div>

    {collapsed && (
      <button onClick={onToggleCollapsed} className="mx-auto mt-3 rounded-md p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-100" aria-label="Expand sidebar">
        <ChevronRight className="h-4 w-4" />
      </button>
    )}

    <div className="px-3 pt-3">
      <button
        onClick={onOpenSearch}
        className={`flex w-full items-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700 hover:text-slate-100 ${
          collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'
        }`}
        title="Global search"
      >
        <Search className="h-4 w-4 shrink-0 text-cyan-400" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-xs font-semibold">Global search</span>
            <kbd className="rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">⌘K</kbd>
          </>
        )}
      </button>
    </div>

    <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
      <div className="space-y-5">
        {navigationGroups.map((group) => (
          <div key={group.id}>
            {!collapsed && <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">{group.label}</div>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id || (item.id === 'workspace' && activeTab === 'terminal');
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`group flex w-full items-center rounded-lg border transition ${
                      collapsed ? 'justify-center p-2.5' : 'gap-3 px-2.5 py-2'
                    } ${
                      active
                        ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'
                        : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/80 hover:text-slate-100'
                    }`}
                    title={collapsed ? item.label : item.description}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    {!collapsed && <span className="truncate text-xs font-semibold">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>

    <div className="space-y-1 border-t border-slate-800/90 p-3">
      <button
        onClick={onOpenAudit}
        className={`flex w-full items-center rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-100 ${
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-2.5 py-2'
        }`}
        title="Evidence Audit"
      >
        <ClipboardList className="h-4 w-4 text-slate-500" />
        {!collapsed && <span className="text-xs font-semibold">Evidence Audit</span>}
      </button>
      <button
        onClick={() => onNavigate('settings')}
        className={`flex w-full items-center rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-100 ${
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-2.5 py-2'
        }`}
        title="Settings"
      >
        <Settings className="h-4 w-4 text-slate-500" />
        {!collapsed && <span className="text-xs font-semibold">Settings</span>}
      </button>
    </div>
  </aside>
);
