import { describe, it, expect } from 'vitest';
import { evaluateSnapshotStrategies, STRATEGY_DEFINITIONS } from './strategies';
import { buildSnapshot } from '../../test/fixtures';

describe('Strategy Generation & Rules', () => {
  const mockSnapshot = buildSnapshot();

  it('does not contain G-01 through G-20 strategies', () => {
    const invalidStrategies = STRATEGY_DEFINITIONS.filter(s => s.code.startsWith('G-'));
    expect(invalidStrategies.length).toBe(0);
  });

  it('generates deterministic candidate IDs without Math.random()', () => {
    const candidates1 = evaluateSnapshotStrategies(mockSnapshot);
    const candidates2 = evaluateSnapshotStrategies(mockSnapshot);
    
    expect(candidates1.length).toBeGreaterThan(0);
    expect(candidates1).toEqual(candidates2);
    
    candidates1.forEach(cand => {
      expect(cand.id).toContain(mockSnapshot.snapshotId);
      expect(cand.id).toContain('-v1');
    });
  });

  it('rejects regime-incompatible strategies (penalizes counter-trend)', () => {
    // Modify to bear trend but keep features bullish
    const bearishSnapshot = { ...mockSnapshot, regime: 'STRONG_BEAR_TREND' as const };
    const candidates = evaluateSnapshotStrategies(bearishSnapshot);
    
    // S01 LONG in bear trend should be heavily penalized
    const s01Long = candidates.find(c => c.strategyCode === 'S01' && c.direction === 'LONG');
    expect(s01Long).toBeDefined();
    expect(s01Long!.qualityScore).toBeLessThanOrEqual(75); // Since max penalty drops it
    expect(s01Long!.isCounterTrend).toBe(true);
  });
});
