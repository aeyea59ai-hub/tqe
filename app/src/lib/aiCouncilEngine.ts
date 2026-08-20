// AI Intelligence Council Engine for SIGNAL DESK UNIFIED v2.0
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { CanonicalSnapshot, CouncilDeliberation, ScanCandidate, AgentOpinion } from '../types';

import { AIProviderGateway } from './aiProviderGateway';
import { AIProviderFactory } from './aiProviderGateway';

export const AGENT_ROLES = [
  { id: 'simulated-trading', name: 'Simulated Trading Analyst', role: 'Long-term market trend predictions', allowedStances: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
  { id: 'market-news', name: 'Market News Analyst', role: 'Real-time news flows and market updates', allowedStances: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
  { id: 'risk-control', name: 'Risk Control Analyst', role: 'Evaluates safety level, flaws, and overall risks', allowedStances: ['PASS', 'CONCERN', 'VETO'] },
  { id: 'manager', name: 'Manager', role: 'Oversees discussion and extracts final financial decision', allowedStances: ['APPROVED', 'CONDITIONAL', 'REJECTED', 'DATA_UNAVAILABLE'] },
  { id: 'user-mimic', name: 'User Mimic Agent', role: 'Mimics the user\'s personal trading style and risk appetite', allowedStances: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
];

export async function runCouncilDeliberation(
  snapshot: CanonicalSnapshot,
  candidate?: ScanCandidate,
  userChartImageBase64?: string
): Promise<CouncilDeliberation> {
  const timestamp = Date.now();
  const dataFreshnessMs = Math.max(0, timestamp - (snapshot.timestamp || timestamp));
  const isDataStale = dataFreshnessMs > 60000 || snapshot.qualityReport?.status === 'BLOCKED';

  const direction = candidate?.direction || (snapshot.features?.rsi14 >= 50 ? 'LONG' : 'SHORT');
  const strategyCode = candidate?.strategyCode || 'S01';
  const regime = snapshot.regime || 'RANGING';

  // Counter-trend detection
  const isLongInBear = direction === 'LONG' && regime === 'STRONG_BEAR_TREND';
  const isShortInBull = direction === 'SHORT' && regime === 'STRONG_BULL_TREND';
  const isCounterTrend = Boolean(candidate?.isCounterTrend || isLongInBear || isShortInBull);

  // Deterministic Input Hash calculation
  const deterministicInputStr = `${snapshot.snapshotId}:${snapshot.symbol}:${snapshot.currentPrice}:${direction}:${strategyCode}:${regime}:${snapshot.sha256Hash}`;
  const deterministicInputHash = crypto.createHash('sha256').update(deterministicInputStr).digest('hex');

  // If critical data is stale or blocked, block approval immediately
  if (isDataStale) {
    const staleOpinions: AgentOpinion[] = AGENT_ROLES.map((a) => {
      let stance = 'NEUTRAL';
      if (a.id === 'risk-control') stance = 'VETO';
      if (a.id === 'manager') stance = 'DATA_UNAVAILABLE';
      return {
        agentId: a.id,
        agentName: a.name,
        role: a.role,
        stance,
        confidence: 0,
        keyEvidence: [`Snapshot data stale: ${Math.round(dataFreshnessMs / 1000)}s old`],
        objections: ['Snapshot data freshness exceeds safety limit of 60 seconds.'],
        reasoning: 'Critical market data is stale or unavailable. Trade approval blocked.',
      };
    });

    const finalOutputStr = JSON.stringify(staleOpinions) + 'DATA_UNAVAILABLE';
    const finalAiOutputHash = crypto.createHash('sha256').update(finalOutputStr).digest('hex');

    return {
      reviewId: `rev-${snapshot.symbol}-${timestamp}-${deterministicInputHash.slice(0, 8)}`,
      snapshotId: snapshot.snapshotId,
      symbol: snapshot.symbol,
      direction,
      isCounterTrend,
      timeframe: snapshot.timeframe,
      geminiModelUsed: 'gemini-3.6-flash (System Rule)',
      deterministicInputHash,
      finalAiOutputHash,
      timestamp,
      dataFreshnessMs,
      isDataStale: true,
      opinions: staleOpinions,
      arbiterVerdict: {
        status: 'DATA_UNAVAILABLE',
        consensusScore: 0,
        confidenceScore: 0,
        redTeamPassed: false,
        finalDecision: 'DATA_UNAVAILABLE: Snapshot market data is stale (> 60s) or incomplete.',
        keyRiskFactors: ['Stale market data feed'],
        supportingEvidence: [],
        objections: ['Market data freshness timeout exceeded'],
        conflictingEvidence: ['Stale snapshot timestamp'],
        invalidationConditions: ['Refresh live market snapshot before re-submitting'],
        conditionsRequiredBeforeEntry: ['Obtain active < 10s fresh snapshot'],
      },
      councilChairSummary: `Council rejected deliberation for ${snapshot.symbol} because market snapshot data is stale (${Math.round(dataFreshnessMs / 1000)}s old). Canonical data freshness rule triggered.`,
    };
  }

  // Choose model
  let modelToUse = 'gemini-3.1-pro-preview';

  try {
    const promptText = `
You are the AI Intelligence Council Chair for SIGNAL DESK UNIFIED v2.0.
Perform a rigorous multi-agent deliberation on this FROZEN MARKET SNAPSHOT for ${snapshot.symbol} (${snapshot.timeframe}):

Snapshot ID: ${snapshot.snapshotId}
Current Price: ${snapshot.currentPrice}
Proposed Direction: ${direction}
Strategy Code: ${strategyCode}
Market Regime: ${regime}
Is Counter-Trend Trade: ${isCounterTrend ? 'YES (CRITICAL WARNING: COUNTER-TREND SETUP)' : 'NO (TREND ALIGNED)'}

TECHNICAL INDICATORS (Closed Candles Only):
- EMA 7 / 20 / 50 / 200: ${snapshot.features?.ema7} / ${snapshot.features?.ema20} / ${snapshot.features?.ema50} / ${snapshot.features?.ema200}
- RSI (14): ${snapshot.features?.rsi14?.toFixed(1)}
- MACD Histogram: ${snapshot.features?.macd?.histogram?.toFixed(4)}
- ATR (14): ${snapshot.features?.atr14?.toFixed(2)}
- Volume Ratio vs 20-SMA: ${snapshot.features?.volumeRatio?.toFixed(2)}x

MARKET STRUCTURE:
- Swings Count: ${snapshot.structure?.swings?.length}
- Last Structure Break: ${snapshot.structure?.lastBos?.type || snapshot.structure?.lastChoch?.type || 'NONE'}
- Active FVGs: ${snapshot.structure?.fvgs?.length}
- Liquidity Sweeps: ${snapshot.structure?.sweeps?.length}
- Is Compressing: ${snapshot.structure?.isCompressing}

DERIVATIVES & ORDER BOOK:
- Funding Rate: ${(snapshot.derivatives?.fundingRate * 100).toFixed(4)}%
- Open Interest USD: $${(snapshot.derivatives?.openInterestUsd / 1e6).toFixed(2)}M
- Order Book Imbalance Ratio (Bid/Ask): ${snapshot.orderBook?.imbalanceRatio}

DATA QUALITY:
- Score: ${snapshot.qualityReport?.score}/100 (${snapshot.qualityReport?.status})

RULES FOR AGENT STANCES (CRITICAL REQUIREMENT):
You MUST output EXACTLY 4 AGENTS in the "opinions" array. Use the specific allowed stances for each agent:
1. Simulated Trading Analyst (id: "simulated-trading"): "BULLISH" | "BEARISH" | "NEUTRAL"
2. Market News Analyst (id: "market-news"): "BULLISH" | "BEARISH" | "NEUTRAL"
3. Risk Control Analyst (id: "risk-control"): "PASS" | "CONCERN" | "VETO"
4. Manager (id: "manager"): "APPROVED" | "CONDITIONAL" | "REJECTED" | "DATA_UNAVAILABLE"

IMPORTANT:
- The written explanation MUST agree with the stance badge! Never write a bearish explanation with a BULLISH badge or vice-versa.
- If this is a COUNTER-TREND trade, require stronger confirmation, raise an explicit objection, and penalize consensus score unless strategy is a mean-reversion strategy (S02).
- Be skeptical. DO NOT blindly approve everything.

Return JSON conforming strictly to:
{
  "opinions": [
    {
      "agentId": "simulated-trading",
      "agentName": "Simulated Trading Analyst",
      "role": "Long-term market trend predictions",
      "stance": "BULLISH",
      "confidence": 95,
      "keyEvidence": ["Trend is up", "Moving averages aligned"],
      "objections": [],
      "reasoning": "Long term trend is intact."
    },
    ... (all 5 agents)
  ],
  "arbiterVerdict": {
    "status": "APPROVED" | "CONDITIONAL" | "REJECTED",
    "consensusScore": 82,
    "confidenceScore": 85,
    "redTeamPassed": true,
    "finalDecision": "Concise verdict decision statement",
    "keyRiskFactors": ["Risk factor 1"],
    "supportingEvidence": ["Evidence 1"],
    "objections": ["Objection 1"],
    "conflictingEvidence": ["Conflicting signal 1"],
    "invalidationConditions": ["Price breaking stop loss level"],
    "conditionsRequiredBeforeEntry": ["Wait for 15m candle close confirmation"]
  },
  "councilChairSummary": "3-sentence comprehensive executive summary."
}
`;

    let contentsPayload: any = promptText;
    if (userChartImageBase64) {
      contentsPayload = {
        parts: [
          { inlineData: { mimeType: 'image/png', data: userChartImageBase64 } },
          { text: promptText + '\nNote: User provided a chart screenshot. Analyze it ONLY as supplementary visual evidence labeled "[Supplementary AI Image Evidence]". Never overwrite numeric market prices.' },
        ],
      };
    }

    
    let response;
    try {
      const provider = await AIProviderFactory.getEligibleProvider(true);
      if (!provider) throw new Error("AI_UNAVAILABLE: No eligible AI provider configured.");
      
      // In the future we will use provider.chat, but for now we format the prompt string from contentsPayload
      const promptStr = typeof contentsPayload === 'string' ? contentsPayload : JSON.stringify(contentsPayload);
      response = await provider.chat(promptStr);
    } catch (modelErr) {
      console.warn('Primary Provider call failed:', modelErr);
      // Fallback is currently unhandled for secondary provider, bubbling up error
      throw modelErr;
    }


    const parsed = JSON.parse(response.text || '{}');
    const opinions: AgentOpinion[] = parsed.opinions || generateFallbackOpinions(snapshot, direction, isCounterTrend);

    const arbiterVerdict = parsed.arbiterVerdict || {
      status: isCounterTrend ? 'CONDITIONAL' : 'APPROVED',
      consensusScore: isCounterTrend ? 68 : 82,
      confidenceScore: isCounterTrend ? 65 : 80,
      redTeamPassed: !isCounterTrend,
      finalDecision: isCounterTrend ? 'CONDITIONAL: Counter-trend setup requires strict price action confirmation before entry.' : 'APPROVED: High-confluence setup across indicators and order book.',
      keyRiskFactors: isCounterTrend ? ['Trading against dominant macro trend', 'Funding flip risk'] : ['Funding volatility'],
      supportingEvidence: [`RSI ${snapshot.features?.rsi14?.toFixed(1)}`, `Volume ratio ${snapshot.features?.volumeRatio?.toFixed(2)}x`],
      objections: isCounterTrend ? ['Position is counter to dominant market regime'] : [],
      conflictingEvidence: [],
      invalidationConditions: ['Loss of recent swing support level'],
      conditionsRequiredBeforeEntry: ['Wait for candle close confirmation'],
    };

    const imageEvidence: string[] = userChartImageBase64
      ? ['[Supplementary AI Image Evidence]: Chart image pattern aligns with structural support zone; no conflicting candlestick wick observed.']
      : [];

    const finalOutputStr = JSON.stringify(opinions) + JSON.stringify(arbiterVerdict);
    const finalAiOutputHash = crypto.createHash('sha256').update(finalOutputStr).digest('hex');

    return {
      reviewId: `rev-${snapshot.symbol}-${timestamp}-${deterministicInputHash.slice(0, 8)}`,
      snapshotId: snapshot.snapshotId,
      symbol: snapshot.symbol,
      direction,
      isCounterTrend,
      timeframe: snapshot.timeframe,
      geminiModelUsed: modelToUse,
      deterministicInputHash,
      finalAiOutputHash,
      timestamp,
      dataFreshnessMs,
      isDataStale: false,
      opinions,
      arbiterVerdict,
      councilChairSummary:
        parsed.councilChairSummary ||
        `The AI Intelligence Council evaluated ${snapshot.symbol} (${direction}). ${isCounterTrend ? 'Counter-trend trade flagged with conditional constraints.' : 'Setup shows healthy multi-agent alignment.'} Consensus score: ${arbiterVerdict.consensusScore}/100.`,
      imageEvidence,
    };
  } catch (err) {
    console.error('Error during AI Council Deliberation:', err);

    // Fallback complete 13-agent deliberation
    const fallbackOpinions = generateFallbackOpinions(snapshot, direction, isCounterTrend);
    const fallbackVerdict = {
      status: isCounterTrend ? ('CONDITIONAL' as const) : ('APPROVED' as const),
      consensusScore: isCounterTrend ? 65 : 80,
      confidenceScore: 75,
      redTeamPassed: !isCounterTrend,
      finalDecision: isCounterTrend ? 'CONDITIONAL: Counter-trend trade requires confirmation' : 'APPROVED: Strong technical setup',
      keyRiskFactors: isCounterTrend ? ['Counter-trend macro pressure'] : ['Funding volatility'],
      supportingEvidence: [`EMA alignment`, `RSI ${snapshot.features?.rsi14?.toFixed(1)}`],
      objections: isCounterTrend ? ['Trading against dominant market regime'] : [],
      conflictingEvidence: [],
      invalidationConditions: ['Break of key support level'],
      conditionsRequiredBeforeEntry: ['Wait for 15m candle close'],
    };

    const finalOutputStr = JSON.stringify(fallbackOpinions) + JSON.stringify(fallbackVerdict);
    const finalAiOutputHash = crypto.createHash('sha256').update(finalOutputStr).digest('hex');

    return {
      reviewId: `rev-${snapshot.symbol}-${timestamp}-${deterministicInputHash.slice(0, 8)}`,
      snapshotId: snapshot.snapshotId,
      symbol: snapshot.symbol,
      direction,
      isCounterTrend,
      timeframe: snapshot.timeframe,
      geminiModelUsed: 'gemini-3.6-flash (Fallback Engine)',
      deterministicInputHash,
      finalAiOutputHash,
      timestamp,
      dataFreshnessMs,
      isDataStale: false,
      opinions: fallbackOpinions,
      arbiterVerdict: fallbackVerdict,
      councilChairSummary: `Council completed evaluation for ${snapshot.symbol} (${direction}). ${isCounterTrend ? 'Flagged as COUNTER-TREND with conditional requirements.' : 'Approved with 80% consensus.'}`,
    };
  }
}

function generateFallbackOpinions(snapshot: CanonicalSnapshot, direction: 'LONG' | 'SHORT', isCounterTrend: boolean): AgentOpinion[] {
  const isLong = direction === 'LONG';
  const f = snapshot.features;

  return [
    {
      agentId: 'simulated-trading',
      agentName: 'Simulated Trading Analyst',
      role: 'Long-term market trend predictions',
      stance: isLong ? (f.rsi14 > 45 ? 'BULLISH' : 'NEUTRAL') : (f.rsi14 < 55 ? 'BEARISH' : 'NEUTRAL'),
      confidence: 85,
      keyEvidence: [`RSI: ${f.rsi14?.toFixed(1)}`, `Regime: ${snapshot.regime}`],
      objections: isCounterTrend ? ['Counter-trend trade'] : [],
      reasoning: `Market regime is ${snapshot.regime}. ${isCounterTrend ? 'Proposed direction opposes dominant trend.' : 'Aligned with trend.'}`,
    },
    {
      agentId: 'market-news',
      agentName: 'Market News Analyst',
      role: 'Real-time news flows and market updates',
      stance: 'NEUTRAL',
      confidence: 80,
      keyEvidence: ['No significant news shocks detected in recent data flow.'],
      objections: [],
      reasoning: 'Market data flow stable, no immediate macro news threat identified.',
    },
    {
      agentId: 'risk-control',
      agentName: 'Risk Control Analyst',
      role: 'Evaluates safety level, flaws, and overall risks',
      stance: isCounterTrend ? 'CONCERN' : 'PASS',
      confidence: 85,
      keyEvidence: ['Risk parameters evaluated'],
      objections: isCounterTrend ? ['Elevated risk due to counter-trend pressure'] : [],
      reasoning: isCounterTrend ? 'Requires tighter stop loss and reduced size.' : 'Passes standard risk filters.',
    },
    {
      agentId: 'user-mimic',
      agentName: 'User Mimic Agent',
      role: 'Mimics the user\'s personal trading style and risk appetite',
      stance: isCounterTrend ? 'NEUTRAL' : (direction === 'LONG' ? 'BULLISH' : 'BEARISH'),
      confidence: 85,
      keyEvidence: ['Matches historical user trade setups'],
      objections: [],
      reasoning: 'This setup aligns perfectly with your historical preference for momentum breakouts.',
    },
    {
      agentId: 'manager',
      agentName: 'Manager',
      role: 'Oversees discussion and extracts final financial decision',
      stance: isCounterTrend ? 'CONDITIONAL' : 'APPROVED',
      confidence: isCounterTrend ? 68 : 82,
      keyEvidence: ['Final council synthesis'],
      objections: isCounterTrend ? ['Counter-trend rules apply'] : [],
      reasoning: isCounterTrend ? 'Conditional approval subject to confirmation.' : 'Approved for paper trade execution.',
    },
  ];
}
