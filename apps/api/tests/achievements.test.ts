import { describe, expect, test } from 'bun:test';
import { criteriaMatches, type AchievementCriteria, type UnlockContext } from '../src/gamification/achievements';

const base: AchievementCriteria = { event: 'lab_solved', metric: 'count', threshold: 10 };

function ctx(overrides: Partial<UnlockContext> = {}): UnlockContext {
  return { userId: 'u1', event: 'lab_solved', ...overrides };
}

describe('achievement criteria evaluation', () => {
  test('matching event passes', () => {
    expect(criteriaMatches(base, ctx())).toBe(true);
  });
  test('different event fails', () => {
    expect(criteriaMatches(base, ctx({ event: 'lesson_completed' }))).toBe(false);
  });
  test('category filter enforces match', () => {
    const c: AchievementCriteria = { ...base, categorySlug: 'web-security' };
    expect(criteriaMatches(c, ctx({ categorySlug: 'web-security' }))).toBe(true);
    expect(criteriaMatches(c, ctx({ categorySlug: 'linux' }))).toBe(false);
    expect(criteriaMatches(c, ctx())).toBe(false); // missing category context
  });
  test('maxHints constraint', () => {
    const c: AchievementCriteria = { ...base, maxHints: 0 };
    expect(criteriaMatches(c, ctx({ hintsUsed: 0 }))).toBe(true);
    expect(criteriaMatches(c, ctx({ hintsUsed: 2 }))).toBe(false);
    expect(criteriaMatches(c, ctx({}))).toBe(true); // no hints context = 0 used
  });
  test('withinMinutes speed constraint', () => {
    const c: AchievementCriteria = { ...base, withinMinutes: 5 };
    expect(criteriaMatches(c, ctx({ durationSeconds: 299 }))).toBe(true);
    expect(criteriaMatches(c, ctx({ durationSeconds: 301 }))).toBe(false);
    expect(criteriaMatches(c, ctx({}))).toBe(false); // unknown duration fails closed
  });
  test('first_attempt_solve metric requires the flag in context', () => {
    const c: AchievementCriteria = { ...base, metric: 'first_attempt_solve' };
    expect(criteriaMatches(c, ctx({ firstAttemptSolve: true }))).toBe(true);
    expect(criteriaMatches(c, ctx({ firstAttemptSolve: false }))).toBe(false);
    expect(criteriaMatches(c, ctx({}))).toBe(false);
  });
});
