import {
  Activity,
  BarChart3,
  BrainCircuit,
  ChartCandlestick,
  ClipboardList,
  Cpu,
  History,
  LayoutDashboard,
  Radar,
  SearchCheck,
  Settings,
  Target,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Market-wide command overview' },
      { id: 'agents-live', label: 'Daily Research', icon: Activity, description: 'Quant research and simulated analysis' },
    ],
  },
  {
    id: 'markets',
    label: 'Markets',
    items: [
      { id: 'markets', label: 'Markets', icon: BarChart3, description: 'Search, favorites and market discovery' },
      { id: 'scanner', label: 'Scanner', icon: Radar, description: 'Ranked deterministic candidates' },
      { id: 'workspace', label: 'Asset Workspace', icon: ChartCandlestick, description: 'Single-symbol chart and context' },
    ],
  },
  {
    id: 'decisions',
    label: 'Decisions',
    items: [
      { id: 'opportunities', label: 'Decision Board', icon: SearchCheck, description: 'Review candidate evidence' },
      { id: 'trade-plan', label: 'Trade Plan', icon: Target, description: 'Entry, stop, targets and risk' },
    ],
  },
  {
    id: 'paper',
    label: 'Paper Trading',
    items: [
      { id: 'paper-trading', label: 'Paper Desk', icon: WalletCards, description: 'Simulation account, positions and journal' },
    ],
  },
  {
    id: 'strategies',
    label: 'Strategies',
    items: [
      { id: 'replay', label: 'Replay / Backtest', icon: History, description: 'Historical validation and replay' },
    ],
  },
  {
    id: 'ai',
    label: 'AI Desk',
    items: [
      { id: 'council', label: 'Agent Council', icon: BrainCircuit, description: 'Evidence review and objections' },
      { id: 'settings', label: 'AI Providers', icon: Cpu, description: 'Local and cloud model routing' },
    ],
  },
];

export const pageMetadata: Record<string, { title: string; description: string }> = {
  dashboard: { title: 'Command Center', description: 'Market-wide overview, scanner state, alerts and system health.' },
  markets: { title: 'Market Discovery', description: 'Browse the futures universe, search symbols and manage favorites.' },
  workspace: { title: 'Asset Workspace', description: 'Focused chart, market structure and derivatives context.' },
  terminal: { title: 'Asset Workspace', description: 'Focused chart, market structure and derivatives context.' },
  scanner: { title: 'Multi-Stage Scanner', description: 'Filter, rank and inspect market candidates without losing context.' },
  opportunities: { title: 'Decision Board', description: 'Review candidate evidence, AI analysis and alternative matches.' },
  council: { title: 'Agent Council', description: 'Structured evidence review, disagreement and Red-Team objections.' },
  'trade-plan': { title: 'Trade Plan', description: 'Review deterministic entry, invalidation, targets and risk checks.' },
  'agents-live': { title: 'Quant Research', description: 'Simulated research workflows and controlled analyst collaboration.' },
  'paper-trading': { title: 'Paper Trading', description: 'Paper-only account, positions, orders and journal.' },
  replay: { title: 'Strategy Lab', description: 'Backtest and replay strategy behavior across historical data.' },
  settings: { title: 'AI Providers', description: 'Configure local and cloud model providers without changing agent logic.' },
};
