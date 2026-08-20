import React, { useEffect, useState } from 'react';
import { AICouncilChamber } from './components/AICouncilChamber';
import { AIChatDrawer } from './components/AIChatDrawer';
import { AppSidebar } from './components/shell/AppSidebar';
import { AuditLogModal } from './components/AuditLogModal';
import { BacktestDesk } from './components/BacktestDesk';
import { BatchAIScan } from './components/BatchAIScan';
import { CommandPalette } from './components/CommandPalette';
import { DashboardHome } from './components/DashboardHome';
import { GlobalHeader } from './components/shell/GlobalHeader';
import { MarketPickerModal } from './components/MarketPickerModal';
import { MarketsPage } from './components/MarketsPage';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileNavDrawer } from './components/shell/MobileNavDrawer';
import { MultiStageScanner } from './components/MultiStageScanner';
import { PaperTradingDesk } from './components/PaperTradingDesk';
import { QuantAgentsLive } from './components/QuantAgentsLive';
import { SettingsProviders } from './components/SettingsProviders';
import { AssetWorkspace } from './components/AssetWorkspace';
import { TradePlanDesk } from './components/TradePlanDesk';
import { pageMetadata } from './components/shell/navigation';

import {
  AccountState,
  CanonicalSnapshot,
  CouncilDeliberation,
  DeterministicTradePlan,
  QualityReport,
  RiskEvaluation,
  ScanCandidate,
  SymbolInfo,
} from './types';

import {
  closePaperPosition,
  loadPaperAccount,
  openPaperPosition,
  resetPaperAccount,
  updatePaperAccountPrices,
} from './lib/paperEngine';
import {
  batchUpdateMarketStore,
  getMarketStoreItem,
  NormalizedMarketItem,
} from './lib/marketStore';
import { parseBinanceBookTickerMessage } from './lib/binanceBookTicker';

const SIDEBAR_PREFERENCE_KEY = 'signaldesk.ui.cplus.sidebar-collapsed.v1';

function readSidebarPreference() {
  try {
    return window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY) === 'true';
  } catch {
    return false;
  }
}

const LoadingState: React.FC<{ label: string }> = ({ label }) => (
  <div className="grid min-h-[420px] place-items-center border border-slate-800/90 bg-[#0a0f19] p-8 text-center">
    <div>
      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-800 border-t-cyan-400" />
      <div className="mt-4 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-1 text-[10px] text-slate-600">Waiting for the existing application data source.</div>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);

  const [snapshot, setSnapshot] = useState<CanonicalSnapshot | null>(null);
  const [snapshotMap, setSnapshotMap] = useState<Record<string, CanonicalSnapshot>>({});
  const [scannerCandidates, setScannerCandidates] = useState<ScanCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ScanCandidate | undefined>(undefined);

  const [councilDeliberation, setCouncilDeliberation] = useState<CouncilDeliberation | null>(null);
  const [tradePlan, setTradePlan] = useState<DeterministicTradePlan | null>(null);
  const [riskEval, setRiskEval] = useState<RiskEvaluation | null>(null);
  const [accountState, setAccountState] = useState<AccountState>(() => loadPaperAccount());

  const [isScanning, setIsScanning] = useState(false);
  const [isDeliberating, setIsDeliberating] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMarketPickerOpen, setIsMarketPickerOpen] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarPreference);

  const navigate = (tab: string) => {
    setActiveTab(tab);
    setMobileNavigationOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, String(next));
      } catch {
        // UI preference persistence is optional.
      }
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen((current) => !current);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetch('/api/market/symbols')
      .then((response) => response.json())
      .then((data) => {
        if (!data.success || !data.symbols) return;
        setSymbols(data.symbols);
        const initialItems: NormalizedMarketItem[] = data.symbols.map((symbol: any) => ({
          symbol: symbol.symbol,
          assetName: symbol.name || symbol.symbol.replace('USDT', ''),
          contractType: symbol.type || 'USDT-M Perpetual',
          lastPrice: symbol.currentPrice,
          markPrice: symbol.currentPrice,
          indexPrice: symbol.currentPrice,
          bestBid: symbol.currentPrice * 0.9998,
          bestAsk: symbol.currentPrice * 1.0002,
          change24h: symbol.change24h || Math.random() * 10 - 5,
          volume24h: symbol.volume24h || Math.random() * 100000000,
          fundingRate: symbol.fundingRate || 0.0001,
          openInterest: symbol.openInterest || 0,
          timestamp: Date.now(),
          source: 'Exchange Simulator',
          stale: false,
        }));
        batchUpdateMarketStore(initialItems);
      })
      .catch((error) => console.error('Failed to load symbols:', error));
  }, []);

  const calculateTradePlan = async (
    currentSnapshot = snapshot,
    direction: 'LONG' | 'SHORT' = 'LONG',
  ) => {
    if (!currentSnapshot) return;
    try {
      const response = await fetch('/api/trade-plan/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshot: currentSnapshot,
          direction,
          strategyCode: selectedCandidate?.strategyCode || 'S01',
          accountState,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setTradePlan(data.plan);
        setRiskEval(data.risk);
      }
    } catch (error) {
      console.error('Trade plan calculation failed:', error);
    }
  };

  const fetchSnapshot = async (symbol = selectedSymbol, timeframe = selectedTimeframe) => {
    try {
      const response = await fetch(`/api/market/snapshot?symbol=${symbol}&tf=${timeframe}`);
      const data = await response.json();
      if (!data.success || !data.snapshot) return;
      setSnapshot(data.snapshot);
      setSnapshotMap((current) => ({ ...current, [data.snapshot.symbol]: data.snapshot }));
      await calculateTradePlan(data.snapshot, selectedCandidate?.direction || 'LONG');
    } catch (error) {
      console.error('Failed to fetch snapshot:', error);
    }
  };

  useEffect(() => {
    void fetchSnapshot(selectedSymbol, selectedTimeframe);
    // The existing data flow intentionally reloads when symbol/timeframe changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol, selectedTimeframe]);

  useEffect(() => {
    const socket = new WebSocket('wss://fstream.binance.com/ws/!bookTicker');
    let updateBuffer: Record<string, NormalizedMarketItem> = {};
    const lastUpdateIdBySymbol: Record<string, number> = {};

    socket.onmessage = (event) => {
      try {
        const ticker = parseBinanceBookTickerMessage(JSON.parse(event.data));
        if (!ticker) return;

        const existing = getMarketStoreItem(ticker.symbol);
        if (!existing) return;

        const previousUpdateId = lastUpdateIdBySymbol[ticker.symbol];
        if (previousUpdateId !== undefined && ticker.updateId <= previousUpdateId) return;
        lastUpdateIdBySymbol[ticker.symbol] = ticker.updateId;

        updateBuffer[ticker.symbol] = {
          ...(updateBuffer[ticker.symbol] || existing),
          lastPrice: ticker.midPrice,
          markPrice: ticker.midPrice,
          bestBid: ticker.bestBid,
          bestAsk: ticker.bestAsk,
          timestamp: ticker.transactionTime || ticker.eventTime,
          source: 'Binance bookTicker',
          stale: false,
        };
      } catch {
        // Preserve the existing runtime behavior: ignore malformed stream updates.
      }
    };

    const interval = window.setInterval(() => {
      const items = Object.values(updateBuffer);
      if (!items.length) return;
      batchUpdateMarketStore(items);

      const priceMap: Record<string, number> = {};
      items.forEach((item) => {
        priceMap[item.symbol] = item.lastPrice;
      });
      setAccountState((current) => updatePaperAccountPrices(current, priceMap));
      updateBuffer = {};
    }, 1000);

    return () => {
      socket.close();
      window.clearInterval(interval);
    };
  }, []);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/scanner/run');
      const data = await response.json();
      if (!data.success || !data.candidates) return;
      setScannerCandidates(data.candidates);
      if (data.candidates.length) setSelectedCandidate(data.candidates[0]);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTriggerCouncil = async () => {
    if (!snapshot) return;
    setIsDeliberating(true);
    try {
      const response = await fetch('/api/ai/council-deliberate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot, candidate: selectedCandidate }),
      });
      const data = await response.json();
      if (data.success && data.deliberation) setCouncilDeliberation(data.deliberation);
    } catch (error) {
      console.error('AI Council failed:', error);
    } finally {
      setIsDeliberating(false);
    }
  };

  const handleExecutePaperTrade = () => {
    if (!tradePlan || !riskEval) return;
    const result = openPaperPosition(accountState, tradePlan, riskEval);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    setAccountState(result.updatedAccount);
    navigate('paper-trading');
  };

  const handleClosePosition = (positionId: string) => {
    setAccountState(closePaperPosition(accountState, positionId));
  };

  const handleResetAccount = () => {
    if (!window.confirm('Are you sure you want to reset your paper account balance to $10,000?')) return;
    setAccountState(resetPaperAccount(10000));
  };

  const handleSelectCandidate = (candidate: ScanCandidate) => {
    setSelectedCandidate(candidate);
    setSelectedSymbol(candidate.symbol);
    void fetchSnapshot(candidate.symbol, candidate.tf);
    navigate('council');
  };

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    void fetchSnapshot(symbol, selectedTimeframe);
  };

  const defaultQualityReport: QualityReport = snapshot?.qualityReport || {
    status: 'INSUFFICIENT',
    score: 0,
    freshnessMs: Number.POSITIVE_INFINITY,
    latencyMs: 0,
    missingCandles: 0,
    schemaValid: false,
    timestampValid: false,
    continuityValid: false,
    providerAgreed: false,
    warnings: ['No current snapshot loaded'],
  };

  const metadata = pageMetadata[activeTab] || pageMetadata.dashboard;
  const contextualTabs = new Set(['workspace', 'terminal', 'council', 'trade-plan']);
  const contextSymbol = contextualTabs.has(activeTab) ? selectedSymbol : undefined;

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return snapshot ? (
        <DashboardHome
          snapshot={snapshot}
          candidates={scannerCandidates}
          accountState={accountState}
          symbols={symbols}
          onSelectSymbol={(symbol) => {
            handleSelectSymbol(symbol);
            navigate('workspace');
          }}
          onNavigateTab={navigate}
          onRunScanner={handleRunScan}
        />
      ) : (
        <LoadingState label="Loading market overview" />
      );
    }

    if (activeTab === 'markets') {
      return (
        <MarketsPage
          symbols={symbols}
          candidates={scannerCandidates}
          snapshotMap={snapshotMap}
          onSelectSymbol={(symbol) => {
            handleSelectSymbol(symbol);
            navigate('workspace');
          }}
          onNavigateTab={navigate}
        />
      );
    }

    if (activeTab === 'workspace' || activeTab === 'terminal') {
      return snapshot ? (
        <AssetWorkspace
          snapshot={snapshot}
          candidate={selectedCandidate}
          deliberation={councilDeliberation}
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
          onSelectCandidate={(candidate) => {
            setSelectedCandidate(candidate);
            navigate('council');
          }}
          onExecutePaperTrade={handleExecutePaperTrade}
          accountState={accountState}
          onNavigateTab={navigate}
        />
      ) : (
        <LoadingState label={`Loading ${selectedSymbol} workspace`} />
      );
    }

    if (activeTab === 'scanner') {
      return (
        <MultiStageScanner
          candidates={scannerCandidates}
          onSelectCandidate={handleSelectCandidate}
          onRunScan={handleRunScan}
          isLoading={isScanning}
          onBatchAIScan={() => navigate('opportunities')}
        />
      );
    }

    if (activeTab === 'opportunities') {
      return (
        <BatchAIScan
          candidates={scannerCandidates}
          snapshotMap={snapshot ? { [snapshot.symbol]: snapshot } : {}}
          onSelectSymbol={(symbol) => {
            handleSelectSymbol(symbol);
            navigate('workspace');
          }}
          onNavigateTab={navigate}
          onDeliberateAll={handleTriggerCouncil}
          onSelectCandidate={(candidate) => {
            handleSelectCandidate(candidate);
            navigate('council');
          }}
          isLoading={isDeliberating}
        />
      );
    }

    if (activeTab === 'council') {
      return snapshot ? (
        <AICouncilChamber
          deliberation={councilDeliberation}
          snapshot={snapshot}
          candidate={selectedCandidate}
          onDeliberate={handleTriggerCouncil}
          isLoading={isDeliberating}
        />
      ) : (
        <LoadingState label="Loading evidence context" />
      );
    }

    if (activeTab === 'trade-plan') {
      return (
        <TradePlanDesk
          plan={tradePlan}
          risk={riskEval}
          accountState={accountState}
          onExecutePaperTrade={handleExecutePaperTrade}
          onCalculatePlan={() => snapshot && calculateTradePlan(snapshot, 'LONG')}
          isLoading={false}
        />
      );
    }

    if (activeTab === 'agents-live') {
      return <QuantAgentsLive accountState={accountState} setAccountState={setAccountState} />;
    }

    if (activeTab === 'paper-trading') {
      return (
        <PaperTradingDesk
          accountState={accountState}
          onClosePosition={handleClosePosition}
          onResetAccount={handleResetAccount}
        />
      );
    }

    if (activeTab === 'replay') {
      return snapshot ? (
        <BacktestDesk symbols={symbols} currentSnapshot={snapshot} />
      ) : (
        <LoadingState label="Loading strategy lab" />
      );
    }

    if (activeTab === 'settings') {
      return <SettingsProviders />;
    }

    return (
      <div className="grid min-h-[420px] place-items-center border border-slate-800 bg-[#0a0f19] p-8 text-center">
        <div>
          <div className="font-mono text-xs font-black text-slate-300">Workspace unavailable</div>
          <button onClick={() => navigate('dashboard')} className="mt-3 text-[10px] font-bold text-cyan-400">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#060a11] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <div className="flex min-h-screen">
        <AppSidebar
          activeTab={activeTab}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebar}
          onNavigate={navigate}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          onOpenAudit={() => setShowAuditModal(true)}
        />

        <MobileNavDrawer
          open={mobileNavigationOpen}
          activeTab={activeTab}
          onClose={() => setMobileNavigationOpen(false)}
          onNavigate={navigate}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          onOpenAudit={() => {
            setShowAuditModal(true);
            setMobileNavigationOpen(false);
          }}
        />

        <div className="min-w-0 flex-1 pb-20 md:pb-0">
          <GlobalHeader
            title={contextSymbol ? `${contextSymbol} · ${metadata.title}` : metadata.title}
            description={metadata.description}
            qualityReport={defaultQualityReport}
            accountState={accountState}
            contextSymbol={contextSymbol}
            onOpenMobileMenu={() => setMobileNavigationOpen(true)}
            onOpenSearch={() => setIsCommandPaletteOpen(true)}
            onRefresh={() => fetchSnapshot(selectedSymbol, selectedTimeframe)}
            onOpenMarketPicker={() => setIsMarketPickerOpen(true)}
          />

          <main className="mx-auto w-full max-w-[1900px] p-3 sm:p-4 lg:p-5">
            {renderContent()}
          </main>
        </div>
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        onNavigateTab={navigate}
        onOpenMoreMenu={() => setMobileNavigationOpen(true)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        symbols={symbols}
        onSelectSymbol={(symbol) => {
          handleSelectSymbol(symbol);
          navigate('workspace');
        }}
        onNavigateTab={navigate}
        onNavigate={navigate}
        onRunScan={handleRunScan}
      />

      <MarketPickerModal
        isOpen={isMarketPickerOpen}
        onClose={() => setIsMarketPickerOpen(false)}
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={(symbol) => {
          handleSelectSymbol(symbol);
          setIsMarketPickerOpen(false);
          navigate('workspace');
        }}
      />

      {showAuditModal && snapshot && (
        <AuditLogModal snapshot={snapshot} onClose={() => setShowAuditModal(false)} />
      )}

      <AIChatDrawer
        selectedSymbol={selectedSymbol}
        snapshot={snapshot}
        candidate={selectedCandidate}
        deliberation={councilDeliberation}
        tradePlan={tradePlan}
        riskEval={riskEval}
        accountState={accountState}
      />
    </div>
  );
}
