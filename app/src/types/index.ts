// SIGNAL DESK UNIFIED v2.0 - Core Types Definition

export type MarketRegime = 'STRONG_BULL_TREND' | 'WEAK_BULL_TREND' | 'RANGING' | 'WEAK_BEAR_TREND' | 'STRONG_BEAR_TREND' | 'HIGH_VOLATILITY' | 'COMPRESSION';

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  pricePrecision: number;
  quantityPrecision: number;
  maxLeverage: number;
  minNotional: number;
  status: string;
}

export interface DerivativesData {
  markPrice: number;
  indexPrice: number;
  fundingRate: number; // e.g. 0.0001 = +0.01%
  nextFundingTime: number;
  openInterest: number;
  openInterestUsd: number;
  longShortRatio: number;
  topTraderLongShortRatio: number;
  takerBuySellVolume: number;
  takerBuyRatio: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  spreadPct: number;
  bidDepthUsd: number;
  askDepthUsd: number;
  imbalanceRatio: number; // >1 means bid heavy, <1 ask heavy
}

export interface MarketContext {
  btcDominance: number; // e.g. 56.4
  fearAndGreedIndex: number; // 0-100
  fearAndGreedLabel: string;
  stablecoinLiquidityCapUsd: number; // e.g. 160B
  macroCalendarEvents: { title: string; impact: 'HIGH' | 'MEDIUM' | 'LOW'; time: string }[];
  newsSentimentScore: number; // -1 to +1
  newsItems: { headline: string; source: string; time: string; sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' }[];
}

export type QualityGateStatus = 'HEALTHY' | 'DEGRADED' | 'INSUFFICIENT' | 'BLOCKED';

export interface QualityReport {
  status: QualityGateStatus;
  score: number; // 0-100
  freshnessMs: number;
  latencyMs: number;
  missingCandles: number;
  schemaValid: boolean;
  timestampValid: boolean;
  continuityValid: boolean;
  providerAgreed: boolean;
  rejectionReason?: string;
  warnings: string[];
}

export interface SwingPoint {
  price: number;
  timestamp: number;
  index: number;
  type: 'HH' | 'HL' | 'LH' | 'LL';
}

export interface StructureBreak {
  price: number;
  timestamp: number;
  type: 'BULLISH_BOS' | 'BEARISH_BOS' | 'BULLISH_CHOCH' | 'BEARISH_CHOCH';
}

export interface SRZone {
  id: string;
  priceMin: number;
  priceMax: number;
  strength: number; // 1-5
  type: 'SUPPORT' | 'RESISTANCE';
  touches: number;
}

export interface FairValueGap {
  id: string;
  top: number;
  bottom: number;
  type: 'BULLISH_FVG' | 'BEARISH_FVG';
  timestamp: number;
  filled: boolean;
}

export interface LiquiditySweep {
  id: string;
  price: number;
  sweptLevel: number;
  type: 'HIGH_SWEEP' | 'LOW_SWEEP';
  timestamp: number;
}

export interface BreakerBlock {
  id: string;
  top: number;
  bottom: number;
  type: 'BULLISH_BREAKER' | 'BEARISH_BREAKER';
  timestamp: number;
}

export interface TechnicalFeatures {
  ema7: number;
  ema9: number;
  ema20: number;
  ema21: number;
  ema25: number;
  ema50: number;
  ema99: number;
  ema200: number;
  rsi14: number;
  macd: { macd: number; signal: number; histogram: number };
  atr14: number;
  vwap: number;
  bollinger: { upper: number; middle: number; lower: number; bandwidth: number };
  volumeBaseline20: number;
  volumeRatio: number; // current volume / baseline
  realizedVolatility: number;
}

export interface MarketStructure {
  swings: SwingPoint[];
  lastBos?: StructureBreak;
  lastChoch?: StructureBreak;
  srZones: SRZone[];
  fvgs: FairValueGap[];
  sweeps: LiquiditySweep[];
  breakerBlocks: BreakerBlock[];
  isRanging: boolean;
  rangeBounds?: { low: number; high: number; mid: number };
  isCompressing: boolean;
  candlePatterns: string[];
}

export interface CanonicalSnapshot {
  snapshotId: string;
  symbol: string;
  timeframe: string; // e.g. '15m'
  currentPrice: number;
  closedCandles: Candle[];
  derivatives: DerivativesData;
  orderBook: OrderBook;
  context: MarketContext;
  features: TechnicalFeatures;
  structure: MarketStructure;
  regime: MarketRegime;
  qualityReport: QualityReport;
  providerProvenance: string;
  timestamp: number;
  sha256Hash: string;
}

export type StrategyCategory = 'PUBLISHABLE' | 'RESEARCH';
export type StrategyLifecycle = 'RESEARCH_ONLY' | 'BACKTESTED' | 'REPLAY_VERIFIED' | 'SHADOW' | 'PAPER_CANDIDATE' | 'PAPER_PUBLISHABLE';

export interface StrategyDefinition {
  id: string;
  code: string; // e.g. S01, S02, S03, S07, S14, SC01
  name: string;
  category: StrategyCategory;
  lifecycle: StrategyLifecycle;
  description: string;
  preferredTimeframe: string;
  winRateHistorical: number; // e.g. 68.5
  profitFactorHistorical: number; // e.g. 2.15
  rulesSummary: string[];
}

export interface ScanCandidate {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  strategyCode: string;
  strategyName: string;
  qualityScore: number; // 0-100
  marketRegime: MarketRegime;
  price: number;
  tf: string;
  derivativesScore: number;
  structureScore: number;
  isCounterTrend?: boolean;
  aiReview?: CouncilDeliberation;
  stageResults: {
    eligibility: boolean;
    liquidity: boolean;
    dataQuality: boolean;
    volatility: boolean;
    marketRegime: boolean;
    strategyCompatibility: boolean;
    derivativesAlignment: boolean;
    preliminaryRisk: boolean;
  };
  snapshot: CanonicalSnapshot;
  timestamp: number;
}

export interface FrozenEvidenceBundle {
  snapshotId: string;
  symbol: string;
  timestamp: number;
  timeframe: string;
  indicators: TechnicalFeatures;
  marketStructureSummary: {
    swingsCount: number;
    lastStructureBreak?: string;
    fvgCount: number;
    sweepCount: number;
    srZonesCount: number;
    isCompressing: boolean;
  };
  strategyMatch: {
    code: string;
    name: string;
    direction: 'LONG' | 'SHORT';
    confidenceScore: number;
  };
  fundingRate: number;
  openInterestUsd: number;
  orderBookImbalance: number;
  marketContext: {
    btcDominance: number;
    fearAndGreed: number;
    regime: MarketRegime;
  };
  dataQualityScore: number;
  providerIds: string[];
  sha256Hash: string;
}

export interface AgentOpinion {
  agentId: string;
  agentName: string;
  role: string;
  stance: string; // e.g. HEALTHY|DEGRADED|FAILED or PASS|CONCERN|VETO or BULLISH|BEARISH|NEUTRAL or STRONG_MATCH...
  confidence: number; // 0-100
  keyEvidence: string[];
  objections: string[];
  reasoning: string;
}

export interface CouncilDeliberation {
  reviewId: string;
  snapshotId: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  isCounterTrend: boolean;
  timeframe: string;
  geminiModelUsed: string;
  deterministicInputHash: string;
  finalAiOutputHash: string;
  timestamp: number;
  dataFreshnessMs: number;
  isDataStale: boolean;

  opinions: AgentOpinion[]; // All 5 agents

  arbiterVerdict: {
    status: 'APPROVED' | 'CONDITIONAL' | 'REJECTED' | 'DATA_UNAVAILABLE';
    consensusScore: number; // 0-100
    confidenceScore: number; // 0-100
    redTeamPassed: boolean;
    finalDecision: string;
    keyRiskFactors: string[];
    supportingEvidence: string[];
    objections: string[];
    conflictingEvidence: string[];
    invalidationConditions: string[];
    conditionsRequiredBeforeEntry: string[];
  };
  councilChairSummary: string;
  imageEvidence?: string[]; // Supplementary observations from user uploaded chart images
}

export interface DeterministicTradePlan {
  id: string;
  snapshotId: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryZone: [number, number];
  entryPrice: number;
  invalidationPrice: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  grossRR: number;
  effectiveRR: number;
  estimatedTakerFeePct: number;
  estimatedSlippagePct: number;
  estimatedFundingCostPct: number;
  tradePlanCalculatedAt: number;
}

export interface RiskConfig {
  accountBalance: number;
  maxRiskPerTradePct: number; // default 1.0%
  maxLeverage: number; // default 10x
  dailyDrawdownLockPct: number; // default 5%
  weeklyDrawdownLockPct: number; // default 10%
  consecutiveLossReducerCount: number; // default 3
  currentConsecutiveLosses: number;
  maxOpenPortfolioRiskPct: number; // default 5%
  maxCorrelationExposureCount: number; // default 2 per base asset sector
}

export interface RiskEvaluation {
  status: 'PASS' | 'REJECT';
  maxPositionSizeUsd: number;
  contractQuantity: number;
  leverageUsed: number;
  modeledLiquidationPrice: number;
  safetyBufferPct: number;
  riskUsd: number;
  rejections: string[];
  warnings: string[];
  dailyLockActive: boolean;
  consecutiveLossDiscountApplied: boolean;
}

export interface PaperPosition {
  id: string;
  tradePlanId: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  marginUsd: number;
  leverage: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp1Executed: boolean;
  tp2Executed: boolean;
  tp3Executed: boolean;
  pnlUsd: number;
  pnlPct: number;
  roePct: number;
  liquidationPrice: number;
  status: 'OPEN' | 'CLOSED_TP' | 'CLOSED_SL' | 'CLOSED_MANUAL' | 'LIQUIDATED';
  openedAt: number;
  closedAt?: number;
  closePrice?: number;
  closeReason?: string;
}

export interface AccountState {
  initialBalance: number;
  balance: number;
  equity: number;
  marginUsed: number;
  freeMargin: number;
  totalPnlUsd: number;
  winCount: number;
  lossCount: number;
  totalTrades: number;
  winRatePct: number;
  profitFactor: number;
  maxDrawdownPct: number;
  consecutiveLosses: number;
  dailyStartingEquity: number;
  dailyDrawdownPct: number;
  positions: PaperPosition[];
  closedPositions: PaperPosition[];
  dailyLockout: boolean;
  lockoutReason?: string;
}

export type ProviderType = 'OLLAMA_LOCAL' | 'LLAMACPP_LOCAL' | 'OLLAMA_CLOUD' | 'KIMI_CLOUD' | 'OPENAI' | 'GEMINI' | 'ANTHROPIC' | 'CUSTOM_OPENAI' | 'MOCK';
export type RoutingMode = 'AUTO' | 'MANUAL' | 'LOCAL_ONLY' | 'CLOUD_ONLY' | 'PRIVACY_FIRST' | 'QUALITY_FIRST' | 'SPEED_FIRST' | 'COST_FIRST';
export type PrivacyClass = 'LOCAL' | 'CLOUD';
export type ProviderHealth = 'HEALTHY' | 'UNHEALTHY' | 'UNREACHABLE_FROM_CURRENT_RUNTIME' | 'UNKNOWN';

export interface AIProvider {
  id: string;
  provider_type: ProviderType;
  display_name: string;
  enabled: boolean;
  priority: number;
  base_url?: string;
  model: string;
  secret_ref?: string;
  routing_eligibility: string;
  privacy_class: PrivacyClass;
  timeout_seconds: number;
  max_retries: number;
  streaming_enabled: boolean;
  supports_chat: boolean;
  supports_tools: boolean;
  supports_json_schema: boolean;
  supports_vision: boolean;
  supports_embeddings: boolean;
  context_window?: number;
  max_output_tokens?: number;
  health_status: ProviderHealth;
  last_health_check_utc?: string;
  last_error_code?: string;
  last_error_message_redacted?: string;
  average_latency_ms: number;
  created_at_utc: string;
  updated_at_utc: string;
  version: number;
}

export interface AIProviderResponse {
  provider_id: string;
  model: string;
  request_id: string;
  output_text: string;
  structured_output?: any;
  input_tokens?: number;
  output_tokens?: number;
  latency_ms: number;
  finish_reason: string;
  routing_reason: string;
  warnings?: string[];
  provider_error_code?: string;
}
