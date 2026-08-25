import { describe, expect, test } from 'bun:test';
import { resolveLevel, computeXpProgress, type LevelRow } from '../src/gamification/xp';

const levels: LevelRow[] = [
  { id: 1, order: 0, name: 'Initiate', title: 'Level 0 — Initiate', xpThreshold: 0 },
  { id: 2, order: 1, name: 'Apprentice', title: 'Level 1 — Apprentice', xpThreshold: 500 },
  { id: 3, order: 2, name: 'Practitioner', title: 'Level 2 — Practitioner', xpThreshold: 1500 },
  { id: 4, order: 3, name: 'Operator', title: 'Level 3 — Operator', xpThreshold: 3000 },
];

describe('resolveLevel', () => {
  test('zero xp resolves to first level', () => {
    expect(resolveLevel(0, levels)?.order).toBe(0);
  });
  test('xp exactly at threshold resolves to that level', () => {
    expect(resolveLevel(500, levels)?.order).toBe(1);
  });
  test('xp between thresholds resolves to lower level', () => {
    expect(resolveLevel(499, levels)?.order).toBe(0);
    expect(resolveLevel(1499, levels)?.order).toBe(1);
  });
  test('very high xp resolves to last level', () => {
    expect(resolveLevel(999999, levels)?.order).toBe(3);
  });
  test('unordered input still resolves correctly', () => {
    const shuffled = [levels[2], levels[0], levels[3], levels[1]];
    expect(resolveLevel(600, shuffled)?.order).toBe(1);
  });
});

describe('computeXpProgress', () => {
  test('start of journey', () => {
    const p = computeXpProgress(0, levels);
    expect(p.level?.order).toBe(0);
    expect(p.nextLevel?.order).toBe(1);
    expect(p.progressPercent).toBe(0);
    expect(p.xpToNextLevel).toBe(500);
  });
  test('mid-level progress math', () => {
    const p = computeXpProgress(250, levels);
    expect(p.progressPercent).toBe(50);
    expect(p.xpToNextLevel).toBe(250);
  });
  test('max level reports complete', () => {
    const p = computeXpProgress(5000, levels);
    expect(p.level?.order).toBe(3);
    expect(p.nextLevel).toBeNull();
    expect(p.progressPercent).toBe(100);
    expect(p.xpToNextLevel).toBeNull();
  });
});
