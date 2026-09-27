/**
 * Unit tests for report media validation and helpers. No database required.
 */
import { describe, expect, test } from 'bun:test';
import { parseRange, REPORT_MEDIA_KEY_RE, sniffReportMedia, validateReportMedia } from '../src/storage/reports.storage';
import { makeExcerpt, slugifyTitle } from '../src/reports/reports.service';
import { AppError } from '../src/core/errors';
import { FIXTURES } from './fixtures/media';

const file = (bytes: Uint8Array, name: string, type = '') => new File([bytes], name, { type });

async function rejection(p: Promise<unknown>): Promise<AppError> {
  try {
    await p;
  } catch (e) {
    return e as AppError;
  }
  throw new Error('expected rejection');
}

describe('sniffReportMedia', () => {
  test('recognises every allowed type from magic bytes', () => {
    expect(sniffReportMedia(FIXTURES.png())?.mime).toBe('image/png');
    expect(sniffReportMedia(FIXTURES.jpeg())?.mime).toBe('image/jpeg');
    expect(sniffReportMedia(FIXTURES.gif())?.mime).toBe('image/gif');
    expect(sniffReportMedia(FIXTURES.webp())?.mime).toBe('image/webp');
    expect(sniffReportMedia(FIXTURES.mp4())?.mime).toBe('video/mp4');
    expect(sniffReportMedia(FIXTURES.webm())?.mime).toBe('video/webm');
  });

  test('rejects SVG, HTML, executables and HEIC/QuickTime lookalikes', () => {
    expect(sniffReportMedia(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBeNull();
    expect(sniffReportMedia(new TextEncoder().encode('<!doctype html><html><script>alert(1)</script></html>'))).toBeNull();
    expect(sniffReportMedia(new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0, 4, 0, 0, 0, 0xff, 0xff]))).toBeNull();
    expect(sniffReportMedia(new Uint8Array([0, 0, 0, 0x18, ...Buffer.from('ftypheic'), 0, 0, 0, 0]))).toBeNull();
    expect(sniffReportMedia(new Uint8Array([0, 0, 0, 0x14, ...Buffer.from('ftypqt  '), 0, 0, 0, 0]))).toBeNull();
    expect(sniffReportMedia(new Uint8Array([1, 2, 3]))).toBeNull();
  });
});

describe('validateReportMedia', () => {
  test('accepts a valid image and derives the type from content, not the name', async () => {
    const v = await validateReportMedia(file(FIXTURES.png(), 'totally.exe', 'application/x-msdownload'), 'image');
    expect(v.mime).toBe('image/png');
    expect(v.ext).toBe('png');
  });

  test('rejects a script renamed to .png', async () => {
    const err = await rejection(validateReportMedia(file(new TextEncoder().encode('#!/bin/sh\nrm -rf /\n'.repeat(3)), 'shell.png', 'image/png'), 'image'));
    expect(err.status).toBe(400);
    expect(err.message).toContain('Unsupported image type');
  });

  test('rejects a video in the image field and vice versa', async () => {
    expect((await rejection(validateReportMedia(file(FIXTURES.mp4(), 'a.mp4'), 'image'))).message).toContain('video field');
    expect((await rejection(validateReportMedia(file(FIXTURES.png(), 'a.png'), 'video'))).message).toContain('image field');
  });

  test('rejects empty and oversized files', async () => {
    expect((await rejection(validateReportMedia(file(new Uint8Array(), 'e.png'), 'image'))).message).toContain('empty');
    const big = new Uint8Array(10 * 1024 * 1024 + 1);
    big.set(FIXTURES.png());
    const err = await rejection(validateReportMedia(file(big, 'big.png'), 'image'));
    expect(err.status).toBe(400);
    expect(err.message).toContain('too large');
  });
});

describe('storage keys', () => {
  test('only generated uuid names are accepted', () => {
    expect(REPORT_MEDIA_KEY_RE.test('3f1c2a4b-1234-4abc-8def-0123456789ab.png')).toBe(true);
    expect(REPORT_MEDIA_KEY_RE.test('../../etc/passwd')).toBe(false);
    expect(REPORT_MEDIA_KEY_RE.test('3f1c2a4b-1234-4abc-8def-0123456789ab.html')).toBe(false);
    expect(REPORT_MEDIA_KEY_RE.test('3f1c2a4b-1234-4abc-8def-0123456789ab.png/..')).toBe(false);
  });
});

describe('parseRange', () => {
  test('full, open, suffix and bounded ranges', () => {
    expect(parseRange(undefined, 100)).toBeNull();
    expect(parseRange('bytes=0-', 100)).toEqual({ start: 0, end: 99 });
    expect(parseRange('bytes=10-19', 100)).toEqual({ start: 10, end: 19 });
    expect(parseRange('bytes=90-500', 100)).toEqual({ start: 90, end: 99 });
    expect(parseRange('bytes=-10', 100)).toEqual({ start: 90, end: 99 });
  });

  test('unsatisfiable and unsupported ranges', () => {
    expect(parseRange('bytes=100-', 100)).toBe('unsatisfiable');
    expect(parseRange('bytes=50-10', 100)).toBe('unsatisfiable');
    expect(parseRange('bytes=0-1,5-6', 100)).toBeNull();
    expect(parseRange('items=0-1', 100)).toBeNull();
  });
});

describe('text helpers', () => {
  test('slugifyTitle builds readable URLs', () => {
    expect(slugifyTitle('Bug in Example Application!')).toBe('bug-in-example-application');
    expect(slugifyTitle('  Café  Crash -- v2.1 ')).toBe('cafe-crash-v2-1');
    expect(slugifyTitle('बग')).toBe('');
  });

  test('makeExcerpt strips markup and truncates on a word boundary', () => {
    expect(makeExcerpt('**Bold** and `code` with [a link](https://x.test).')).toBe('Bold and code with a link.');
    const long = 'word '.repeat(200);
    const ex = makeExcerpt(long, 50);
    expect(ex.length).toBeLessThanOrEqual(51);
    expect(ex.endsWith('…')).toBe(true);
  });
});
