// Local-First Paper Trading Engine for SIGNAL DESK UNIFIED v2.0
import { AccountState, DeterministicTradePlan, PaperPosition, RiskEvaluation } from '../types';

const PAPER_STORAGE_KEY = 'signal_desk_paper_account_v2';

export const INITIAL_ACCOUNT_STATE: AccountState = {
  initialBalance: 10000,
  balance: 10000,
  equity: 10000,
  marginUsed: 0,
  freeMargin: 10000,
  totalPnlUsd: 0,
  winCount: 0,
  lossCount: 0,
  totalTrades: 0,
  winRatePct: 0,
  profitFactor: 0,
  maxDrawdownPct: 0,
  consecutiveLosses: 0,
  dailyStartingEquity: 10000,
  dailyDrawdownPct: 0,
  positions: [],
  closedPositions: [],
  dailyLockout: false,
};

export function loadPaperAccount(): AccountState {
  try {
    const data = localStorage.getItem(PAPER_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        const state: any = { ...INITIAL_ACCOUNT_STATE };
        for (const key in INITIAL_ACCOUNT_STATE) {
          if (parsed[key] !== undefined && parsed[key] !== null && typeof parsed[key] === typeof (INITIAL_ACCOUNT_STATE as any)[key]) {
            state[key] = parsed[key];
          }
        }
        // Specific backward compatibility fallbacks
        state.equity = parsed.equity ?? parsed.balance ?? INITIAL_ACCOUNT_STATE.equity;
        state.balance = parsed.balance ?? INITIAL_ACCOUNT_STATE.balance;
        state.freeMargin = parsed.freeMargin ?? parsed.availableBalance ?? INITIAL_ACCOUNT_STATE.freeMargin;
        state.totalPnlUsd = parsed.totalPnlUsd ?? INITIAL_ACCOUNT_STATE.totalPnlUsd;
        
        return state as AccountState;
      }
    }
  } catch (err) {
    console.error('Failed to load paper account state from localStorage:', err);
  }
  return INITIAL_ACCOUNT_STATE;
}

export function savePaperAccount(state: AccountState): void {
  try {
    localStorage.setItem(PAPER_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save paper account state to localStorage:', err);
  }
}

export function resetPaperAccount(initialBalance = 10000): AccountState {
  const fresh: AccountState = {
    ...INITIAL_ACCOUNT_STATE,
    initialBalance,
    balance: initialBalance,
    equity: initialBalance,
    freeMargin: initialBalance,
    dailyStartingEquity: initialBalance,
  };
  savePaperAccount(fresh);
  return fresh;
}

export function openPaperPosition(
  account: AccountState,
  plan: DeterministicTradePlan,
  risk: RiskEvaluation
): { updatedAccount: AccountState; error?: string } {
  if (account.dailyLockout) {
    return { updatedAccount: account, error: 'Cannot open trade: Daily drawdown lockout active.' };
  }
  if (risk.status === 'REJECT') {
    return { updatedAccount: account, error: `Risk engine rejected order: ${risk.rejections.join('; ')}` };
  }

  const marginRequired = risk.maxPositionSizeUsd / risk.leverageUsed;
  if (marginRequired > account.freeMargin) {
    return { updatedAccount: account, error: `Insufficient free margin ($${account.freeMargin.toFixed(2)} available, $${marginRequired.toFixed(2)} required).` };
  }

  const newPos: PaperPosition = {
    id: `pos-${plan.symbol}-${Date.now()}`,
    tradePlanId: plan.id,
    symbol: plan.symbol,
    direction: plan.direction,
    entryPrice: plan.entryPrice,
    currentPrice: plan.entryPrice,
    quantity: risk.contractQuantity,
    marginUsd: Number(marginRequired.toFixed(2)),
    leverage: risk.leverageUsed,
    stopLoss: plan.stopLoss,
    tp1: plan.tp1,
    tp2: plan.tp2,
    tp3: plan.tp3,
    tp1Executed: false,
    tp2Executed: false,
    tp3Executed: false,
    pnlUsd: 0,
    pnlPct: 0,
    roePct: 0,
    liquidationPrice: risk.modeledLiquidationPrice,
    status: 'OPEN',
    openedAt: Date.now(),
  };

  const marginUsed = account.marginUsed + marginRequired;
  const balance = account.balance;
  const freeMargin = balance - marginUsed;

  const updated: AccountState = {
    ...account,
    marginUsed: Number(marginUsed.toFixed(2)),
    freeMargin: Number(freeMargin.toFixed(2)),
    positions: [newPos, ...account.positions],
  };

  savePaperAccount(updated);
  return { updatedAccount: updated };
}

export function updatePaperAccountPrices(
  account: AccountState,
  priceMap: Record<string, number>
): AccountState {
  if (account.positions.length === 0) return account;

  let totalUnrealizedPnl = 0;
  let marginUsed = 0;
  const positionsToClose: { positionId: string; reason: string; closePrice: number }[] = [];

  const updatedPositions = account.positions.map((pos) => {
    const markPrice = priceMap[pos.symbol] || pos.currentPrice;
    let pnlUsd = 0;

    if (pos.direction === 'LONG') {
      pnlUsd = (markPrice - pos.entryPrice) * pos.quantity;
    } else {
      pnlUsd = (pos.entryPrice - markPrice) * pos.quantity;
    }

    const pnlPct = (pnlUsd / (pos.entryPrice * pos.quantity)) * 100;
    const roePct = (pnlUsd / pos.marginUsd) * 100;

    marginUsed += pos.marginUsd;
    totalUnrealizedPnl += pnlUsd;

    // Check Liquidation
    let shouldLiquidate = false;
    if (pos.direction === 'LONG' && markPrice <= pos.liquidationPrice) shouldLiquidate = true;
    if (pos.direction === 'SHORT' && markPrice >= pos.liquidationPrice) shouldLiquidate = true;

    if (shouldLiquidate) {
      positionsToClose.push({ positionId: pos.id, reason: 'LIQUIDATED', closePrice: pos.liquidationPrice });
    }

    // Check Stop Loss
    let hitSL = false;
    if (pos.direction === 'LONG' && markPrice <= pos.stopLoss) hitSL = true;
    if (pos.direction === 'SHORT' && markPrice >= pos.stopLoss) hitSL = true;

    if (hitSL && !shouldLiquidate) {
      positionsToClose.push({ positionId: pos.id, reason: 'CLOSED_SL', closePrice: pos.stopLoss });
    }

    // Check Take Profits (TP3 full close or partials)
    let hitTP3 = false;
    if (pos.direction === 'LONG' && markPrice >= pos.tp3) hitTP3 = true;
    if (pos.direction === 'SHORT' && markPrice <= pos.tp3) hitTP3 = true;

    if (hitTP3 && !hitSL && !shouldLiquidate) {
      positionsToClose.push({ positionId: pos.id, reason: 'CLOSED_TP', closePrice: pos.tp3 });
    }

    return {
      ...pos,
      currentPrice: markPrice,
      pnlUsd: Number(pnlUsd.toFixed(2)),
      pnlPct: Number(pnlPct.toFixed(2)),
      roePct: Number(roePct.toFixed(2)),
    };
  });

  const equity = account.balance + totalUnrealizedPnl;
  const freeMargin = equity - marginUsed;

  let state: AccountState = {
    ...account,
    equity: Number(equity.toFixed(2)),
    marginUsed: Number(marginUsed.toFixed(2)),
    freeMargin: Number(freeMargin.toFixed(2)),
    positions: updatedPositions,
  };

  // Process triggered closes
  for (const item of positionsToClose) {
    state = closePaperPosition(state, item.positionId, item.closePrice, item.reason);
  }

  savePaperAccount(state);
  return state;
}

export function closePaperPosition(
  account: AccountState,
  positionId: string,
  closePrice?: number,
  reason = 'CLOSED_MANUAL'
): AccountState {
  const target = account.positions.find((p) => p.id === positionId);
  if (!target) return account;

  const actualClosePrice = closePrice || target.currentPrice;
  let finalPnl = 0;
  if (target.direction === 'LONG') {
    finalPnl = (actualClosePrice - target.entryPrice) * target.quantity;
  } else {
    finalPnl = (target.entryPrice - actualClosePrice) * target.quantity;
  }

  // Taker Fee ~ 0.05%
  const fee = actualClosePrice * target.quantity * 0.0005;
  const netPnl = finalPnl - fee;

  const isWin = netPnl > 0;
  const newBalance = account.balance + netPnl;
  const newTotalPnl = account.totalPnlUsd + netPnl;

  const closedPos: PaperPosition = {
    ...target,
    currentPrice: actualClosePrice,
    closePrice: actualClosePrice,
    pnlUsd: Number(netPnl.toFixed(2)),
    pnlPct: Number(((netPnl / (target.entryPrice * target.quantity)) * 100).toFixed(2)),
    roePct: Number(((netPnl / target.marginUsd) * 100).toFixed(2)),
    status: reason as any,
    closedAt: Date.now(),
    closeReason: reason,
  };

  const remainingPositions = account.positions.filter((p) => p.id !== positionId);
  const newClosedPositions = [closedPos, ...account.closedPositions];

  const totalTrades = account.totalTrades + 1;
  const winCount = account.winCount + (isWin ? 1 : 0);
  const lossCount = account.lossCount + (!isWin ? 1 : 0);
  const winRatePct = Number(((winCount / totalTrades) * 100).toFixed(1));

  const consecutiveLosses = isWin ? 0 : account.consecutiveLosses + 1;

  // Calculate Profit Factor
  let totalGrossWin = 0;
  let totalGrossLoss = 0;
  for (const cp of newClosedPositions) {
    if (cp.pnlUsd > 0) totalGrossWin += cp.pnlUsd;
    else totalGrossLoss += Math.abs(cp.pnlUsd);
  }
  const profitFactor = totalGrossLoss > 0 ? Number((totalGrossWin / totalGrossLoss).toFixed(2)) : totalGrossWin > 0 ? 99.9 : 0;

  // Daily Drawdown calculation
  const dailyDrawdownUsd = account.dailyStartingEquity - newBalance;
  const dailyDrawdownPct = Math.max(0, (dailyDrawdownUsd / account.dailyStartingEquity) * 100);
  const dailyLockout = dailyDrawdownPct >= 5.0; // 5% daily drawdown lock

  const updatedMarginUsed = account.marginUsed - target.marginUsd;

  const updated: AccountState = {
    ...account,
    balance: Number(newBalance.toFixed(2)),
    equity: Number(newBalance.toFixed(2)),
    marginUsed: Math.max(0, Number(updatedMarginUsed.toFixed(2))),
    freeMargin: Number((newBalance - Math.max(0, updatedMarginUsed)).toFixed(2)),
    totalPnlUsd: Number(newTotalPnl.toFixed(2)),
    totalTrades,
    winCount,
    lossCount,
    winRatePct,
    profitFactor,
    consecutiveLosses,
    dailyDrawdownPct: Number(dailyDrawdownPct.toFixed(2)),
    dailyLockout,
    positions: remainingPositions,
    closedPositions: newClosedPositions,
  };

  savePaperAccount(updated);
  return updated;
}
