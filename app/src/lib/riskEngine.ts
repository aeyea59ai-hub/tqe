// Deterministic Trade Plan Engine & Risk Engine for SIGNAL DESK UNIFIED v2.0
import { AccountState, CanonicalSnapshot, DeterministicTradePlan, RiskConfig, RiskEvaluation } from '../types';

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  accountBalance: 10000,
  maxRiskPerTradePct: 1.0, // 1%
  maxLeverage: 10, // 10x max
  dailyDrawdownLockPct: 5.0, // 5% daily lock
  weeklyDrawdownLockPct: 10.0, // 10%
  consecutiveLossReducerCount: 3,
  currentConsecutiveLosses: 0,
  maxOpenPortfolioRiskPct: 5.0,
  maxCorrelationExposureCount: 2,
};

export function generateDeterministicTradePlan(
  snapshot: CanonicalSnapshot,
  direction: 'LONG' | 'SHORT',
  strategyCode: string
): DeterministicTradePlan {
  const currentPrice = snapshot.currentPrice;
  const atr = snapshot.features.atr14 || currentPrice * 0.01;

  // Entry Zone: ±0.15% around current price
  const entryBand = currentPrice * 0.0015;
  const entryZone: [number, number] = [
    Number((currentPrice - entryBand).toFixed(snapshot.currentPrice > 100 ? 2 : 4)),
    Number((currentPrice + entryBand).toFixed(snapshot.currentPrice > 100 ? 2 : 4)),
  ];

  let stopLossDistance = atr * 1.8;
  // If swing level available, place SL beyond swing level
  const swings = snapshot.structure.swings;
  if (direction === 'LONG') {
    const recentLow = swings.filter((s) => s.type === 'HL' || s.type === 'LL').pop();
    if (recentLow && recentLow.price < currentPrice) {
      stopLossDistance = Math.max(atr * 1.5, currentPrice - recentLow.price + atr * 0.5);
    }
  } else {
    const recentHigh = swings.filter((s) => s.type === 'HH' || s.type === 'LH').pop();
    if (recentHigh && recentHigh.price > currentPrice) {
      stopLossDistance = Math.max(atr * 1.5, recentHigh.price - currentPrice + atr * 0.5);
    }
  }

  const stopLoss = direction === 'LONG' ? currentPrice - stopLossDistance : currentPrice + stopLossDistance;
  const invalidationPrice = direction === 'LONG' ? stopLoss * 0.998 : stopLoss * 1.002;

  const riskPerUnit = Math.abs(currentPrice - stopLoss);
  
  // Targets based on Risk Multiple
  const tp1 = direction === 'LONG' ? currentPrice + riskPerUnit * 1.5 : currentPrice - riskPerUnit * 1.5;
  const tp2 = direction === 'LONG' ? currentPrice + riskPerUnit * 2.5 : currentPrice - riskPerUnit * 2.5;
  const tp3 = direction === 'LONG' ? currentPrice + riskPerUnit * 4.0 : currentPrice - riskPerUnit * 4.0;

  const grossRR = Number((riskPerUnit * 2.5 / riskPerUnit).toFixed(2)); // Target 2 Gross R:R

  // Fee, Slippage & Funding estimates
  const estimatedTakerFeePct = 0.05; // 0.05% per side = 0.10% roundtrip
  const estimatedSlippagePct = 0.02; // 0.02%
  const estimatedFundingCostPct = Math.abs(snapshot.derivatives.fundingRate * 100 * 2); // 2 funding intervals

  const totalCostPct = estimatedTakerFeePct * 2 + estimatedSlippagePct + estimatedFundingCostPct;
  const slDistancePct = (riskPerUnit / currentPrice) * 100;
  const tp2DistancePct = (Math.abs(tp2 - currentPrice) / currentPrice) * 100;

  const netGainPct = Math.max(0.1, tp2DistancePct - totalCostPct);
  const netLossPct = slDistancePct + totalCostPct;
  const effectiveRR = Number((netGainPct / netLossPct).toFixed(2));

  return {
    id: `plan-${snapshot.symbol}-${direction}-${Date.now()}`,
    snapshotId: snapshot.snapshotId,
    symbol: snapshot.symbol,
    direction,
    entryZone,
    entryPrice: currentPrice,
    invalidationPrice: Number(invalidationPrice.toFixed(currentPrice > 100 ? 2 : 4)),
    stopLoss: Number(stopLoss.toFixed(currentPrice > 100 ? 2 : 4)),
    tp1: Number(tp1.toFixed(currentPrice > 100 ? 2 : 4)),
    tp2: Number(tp2.toFixed(currentPrice > 100 ? 2 : 4)),
    tp3: Number(tp3.toFixed(currentPrice > 100 ? 2 : 4)),
    grossRR,
    effectiveRR,
    estimatedTakerFeePct,
    estimatedSlippagePct,
    estimatedFundingCostPct: Number(estimatedFundingCostPct.toFixed(4)),
    tradePlanCalculatedAt: Date.now(),
  };
}

export function evaluateTradeRisk(
  plan: DeterministicTradePlan,
  riskConfig: RiskConfig,
  accountState: AccountState
): RiskEvaluation {
  const rejections: string[] = [];
  const warnings: string[] = [];

  // Check Daily Lockout
  if (accountState.dailyLockout || accountState.dailyDrawdownPct >= riskConfig.dailyDrawdownLockPct) {
    rejections.push(`Daily drawdown lock active (${accountState.dailyDrawdownPct.toFixed(2)}% >= max ${riskConfig.dailyDrawdownLockPct}%). Trading locked for today.`);
  }

  // Check consecutive loss reducer
  let riskPct = riskConfig.maxRiskPerTradePct;
  let consecutiveLossDiscountApplied = false;
  if (accountState.consecutiveLosses >= riskConfig.consecutiveLossReducerCount) {
    riskPct = riskPct * 0.5; // Cut risk by 50%
    consecutiveLossDiscountApplied = true;
    warnings.push(`Consecutive loss count (${accountState.consecutiveLosses}) triggered 50% risk reduction (Risk reduced to ${riskPct}%).`);
  }

  const riskUsd = (accountState.balance * riskPct) / 100;
  const stopLossDistancePct = Math.abs(plan.entryPrice - plan.stopLoss) / plan.entryPrice;

  if (stopLossDistancePct <= 0) {
    rejections.push('Invalid Stop Loss distance (must be > 0).');
    return {
      status: 'REJECT',
      maxPositionSizeUsd: 0,
      contractQuantity: 0,
      leverageUsed: 1,
      modeledLiquidationPrice: 0,
      safetyBufferPct: 0,
      riskUsd: 0,
      rejections,
      warnings,
      dailyLockActive: accountState.dailyLockout,
      consecutiveLossDiscountApplied,
    };
  }

  // Max Position Size in USD based on risk
  const rawPositionSizeUsd = riskUsd / stopLossDistancePct;
  const availableMargin = accountState.freeMargin !== undefined ? accountState.freeMargin : accountState.balance;
  const maxPositionSizeUsd = Math.min(rawPositionSizeUsd, availableMargin * riskConfig.maxLeverage);
  const contractQuantity = maxPositionSizeUsd / plan.entryPrice;

  // Required Leverage
  const leverageUsed = Math.max(1, Math.min(riskConfig.maxLeverage, Math.ceil(maxPositionSizeUsd / (availableMargin || 1))));

  if (leverageUsed > riskConfig.maxLeverage) {
    rejections.push(`Required leverage (${leverageUsed}x) exceeds account max cap (${riskConfig.maxLeverage}x).`);
  }

  // Modeled Liquidation Price & Safety Buffer
  // Maintenance margin ~0.5%
  const mmPct = 0.005;
  let modeledLiquidationPrice = 0;
  if (plan.direction === 'LONG') {
    modeledLiquidationPrice = plan.entryPrice * (1 - 1 / leverageUsed + mmPct);
  } else {
    modeledLiquidationPrice = plan.entryPrice * (1 + 1 / leverageUsed - mmPct);
  }

  const distanceToStop = Math.abs(plan.entryPrice - plan.stopLoss);
  const distanceToLiq = Math.abs(plan.entryPrice - modeledLiquidationPrice);
  const safetyBufferPct = Number(((distanceToLiq - distanceToStop) / distanceToStop * 100).toFixed(1));

  if (plan.direction === 'LONG' && plan.stopLoss <= modeledLiquidationPrice) {
    rejections.push(`Stop loss ($${plan.stopLoss}) is below modeled liquidation price ($${modeledLiquidationPrice.toFixed(2)}). Risk rejected.`);
  } else if (plan.direction === 'SHORT' && plan.stopLoss >= modeledLiquidationPrice) {
    rejections.push(`Stop loss ($${plan.stopLoss}) is above modeled liquidation price ($${modeledLiquidationPrice.toFixed(2)}). Risk rejected.`);
  }

  if (plan.effectiveRR < 1.2) {
    warnings.push(`Effective R:R (${plan.effectiveRR}) is low (< 1.2 after fees and slippage).`);
  }

  const status = rejections.length > 0 ? 'REJECT' : 'PASS';

  return {
    status,
    maxPositionSizeUsd: Number(maxPositionSizeUsd.toFixed(2)),
    contractQuantity: Number(contractQuantity.toFixed(4)),
    leverageUsed,
    modeledLiquidationPrice: Number(modeledLiquidationPrice.toFixed(plan.entryPrice > 100 ? 2 : 4)),
    safetyBufferPct,
    riskUsd: Number(riskUsd.toFixed(2)),
    rejections,
    warnings,
    dailyLockActive: accountState.dailyLockout,
    consecutiveLossDiscountApplied,
  };
}
