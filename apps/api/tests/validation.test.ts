import { describe, expect, test } from 'bun:test';
import { rateLimit } from '../src/core/rate-limit';
import { youtubeEmbedUrl } from '@suraksha/shared';
import { signupSchema, passwordSchema, usernameSchema } from '@suraksha/shared';

describe('rate limiter', () => {
  test('allows within budget and blocks beyond', () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60_000).allowed).toBe(true);
    }
    const blocked = rateLimit(key, 5, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
  test('independent keys have independent budgets', () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    rateLimit(a, 1, 60_000);
    expect(rateLimit(a, 1, 60_000).allowed).toBe(false);
    expect(rateLimit(b, 1, 60_000).allowed).toBe(true);
  });
});

describe('youtube embed parsing', () => {
  test('parses standard watch URLs', () => {
    expect(youtubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });
  test('parses short URLs', () => {
    expect(youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });
  test('parses shorts and embed URLs', () => {
    expect(youtubeEmbedUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toContain('embed/dQw4w9WgXcQ');
    expect(youtubeEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toContain('embed/dQw4w9WgXcQ');
  });
  test('adds start time', () => {
    expect(youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ', 90)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=90');
  });
  test('rejects non-youtube URLs', () => {
    expect(youtubeEmbedUrl('https://evil.example.com/watch?v=dQw4w9WgXcQ')).toBeNull();
  });
});

describe('validation schemas', () => {
  test('strong passwords accepted', () => {
    expect(passwordSchema.safeParse('Str0ngPassphrase').success).toBe(true);
  });
  test('weak passwords rejected', () => {
    expect(passwordSchema.safeParse('short1A').success).toBe(false);
    expect(passwordSchema.safeParse('alllowercase1').success).toBe(false);
    expect(passwordSchema.safeParse('NOLOWERCASE1').success).toBe(false);
    expect(passwordSchema.safeParse('NoDigitsHere').success).toBe(false);
  });
  test('usernames constrained', () => {
    expect(usernameSchema.safeParse('good-name_1').success).toBe(true);
    expect(usernameSchema.safeParse('ab').success).toBe(false);
    expect(usernameSchema.safeParse('-starts-wrong').success).toBe(false);
    expect(usernameSchema.safeParse('has spaces').success).toBe(false);
  });
  test('signup normalizes email', () => {
    const parsed = signupSchema.parse({ name: 'Test', username: 'tester', email: '  USER@Example.COM ', password: 'Str0ngPassphrase' });
    expect(parsed.email).toBe('user@example.com');
  });
});
