import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  REPORT_IMAGE_MAX_BYTES,
  REPORT_VIDEO_MAX_BYTES,
} from '@suraksha/shared';
import { gcsEnabled } from '../config/env';
import { errors } from '../core/errors';
import { gcsDelete, gcsStreamRange, gcsUpload } from './gcs.client';
import { STORAGE_ROOT } from './labs.storage';

/**
 * Report media storage (images and videos attached to public reports).
 *
 * Uses the same two backends as lab packages so there is still exactly one
 * storage story for the platform:
 *  - local filesystem under `<STORAGE_ROOT>/reports/` (dev + Docker Compose,
 *    where STORAGE_ROOT is already a persistent volume), or
 *  - Cloud Storage under `reports/` when `GCS_BUCKET` is set (production).
 *
 * Uploads are untrusted:
 *  - the type is decided from the file's own leading bytes, never from the
 *    client-supplied name or Content-Type;
 *  - only a small allow-list of raster images and web video containers is
 *    accepted (no SVG, HTML, or anything a browser could execute);
 *  - the stored name is a random UUID plus an extension derived from the
 *    verified type, so a filename can never carry a path or a script extension;
 *  - files are served back with the verified MIME type, `nosniff` and a
 *    sandboxing CSP (see reports.routes.ts).
 */

export type ReportMediaKind = 'image' | 'video';

type Sniffed = { kind: ReportMediaKind; mime: string; ext: string };

/** Storage keys we generate: `<uuid>.<ext>`. Anything else is rejected before any I/O. */
export const REPORT_MEDIA_KEY_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif|mp4|webm)$/;

/** ISO-BMFF major brands that browsers play as MP4. HEIC/AVIF/QuickTime share the container and are excluded. */
const MP4_BRANDS = new Set(['isom', 'iso2', 'iso3', 'iso4', 'iso5', 'iso6', 'mp41', 'mp42', 'avc1', 'dash', 'M4V ', 'MSNV', 'mmp4']);

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

/** Identifies an allowed media type from magic bytes. Returns null for anything else. */
export function sniffReportMedia(bytes: Uint8Array): Sniffed | null {
  if (bytes.length < 12) return null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { kind: 'image', mime: 'image/jpeg', ext: 'jpg' };
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return { kind: 'image', mime: 'image/png', ext: 'png' };
  }
  const head6 = ascii(bytes, 0, 6);
  if (head6 === 'GIF87a' || head6 === 'GIF89a') return { kind: 'image', mime: 'image/gif', ext: 'gif' };
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return { kind: 'image', mime: 'image/webp', ext: 'webp' };

  if (ascii(bytes, 4, 4) === 'ftyp' && MP4_BRANDS.has(ascii(bytes, 8, 4))) {
    return { kind: 'video', mime: 'video/mp4', ext: 'mp4' };
  }
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    // EBML container: only the WebM doctype is accepted (not generic Matroska).
    if (ascii(bytes, 0, Math.min(bytes.length, 64)).includes('webm')) return { kind: 'video', mime: 'video/webm', ext: 'webm' };
  }
  return null;
}

const LIMITS: Record<ReportMediaKind, { max: number; label: string; allowed: string }> = {
  image: { max: REPORT_IMAGE_MAX_BYTES, label: 'Image', allowed: 'JPEG, PNG, WebP or GIF' },
  video: { max: REPORT_VIDEO_MAX_BYTES, label: 'Video', allowed: 'MP4 or WebM' },
};

export type ValidatedMedia = { data: Buffer; mime: string; ext: string; sizeBytes: number };

/**
 * Validates an uploaded file for the given field. Throws a 400 AppError with a
 * message that is safe to show the administrator.
 */
export async function validateReportMedia(file: File, kind: ReportMediaKind): Promise<ValidatedMedia> {
  const limit = LIMITS[kind];
  if (file.size === 0) throw errors.badRequest(`${limit.label} file is empty.`);
  // Check the declared size before reading anything into memory.
  if (file.size > limit.max) {
    throw errors.badRequest(`${limit.label} is too large. The limit is ${Math.round(limit.max / (1024 * 1024))} MB.`);
  }

  const data = Buffer.from(await file.arrayBuffer());
  if (data.byteLength > limit.max) {
    throw errors.badRequest(`${limit.label} is too large. The limit is ${Math.round(limit.max / (1024 * 1024))} MB.`);
  }

  const sniffed = sniffReportMedia(data);
  if (!sniffed) throw errors.badRequest(`Unsupported ${kind} type. Upload a ${limit.allowed} file.`);
  if (sniffed.kind !== kind) {
    throw errors.badRequest(
      kind === 'image'
        ? 'That file is a video. Upload it in the video field instead.'
        : 'That file is an image. Upload it in the image field instead.',
    );
  }
  return { data, mime: sniffed.mime, ext: sniffed.ext, sizeBytes: data.byteLength };
}

function objectKey(file: string): string {
  return `reports/${file}`;
}

function localPath(file: string): string {
  return join(STORAGE_ROOT, 'reports', file);
}

/** Persists validated media under a fresh random name. Returns the storage filename. */
export async function saveReportMedia(media: ValidatedMedia): Promise<string> {
  const file = `${randomUUID()}.${media.ext}`;
  if (gcsEnabled) {
    await gcsUpload(objectKey(file), media.data, media.mime);
    return file;
  }
  const dir = join(STORAGE_ROOT, 'reports');
  mkdirSync(dir, { recursive: true });
  writeFileSync(localPath(file), media.data, { mode: 0o640 });
  return file;
}

/**
 * Removes stored media. Best effort: a failure is logged, never thrown, because
 * it runs after the database already stopped referencing the file and must not
 * turn a successful edit/delete into an error for the administrator.
 */
export async function deleteReportMedia(file: string | null | undefined): Promise<void> {
  if (!file || !REPORT_MEDIA_KEY_RE.test(file)) return;
  try {
    if (gcsEnabled) {
      await gcsDelete(objectKey(file));
      return;
    }
    const path = localPath(file);
    if (existsSync(path)) unlinkSync(path);
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', msg: 'report_media_delete_failed', file, err: String(err) }));
  }
}

/**
 * Returns a streaming body for an inclusive byte range, or null if the object
 * is missing. `file` must already have passed REPORT_MEDIA_KEY_RE.
 */
export async function readReportMediaRange(
  file: string,
  start: number,
  end: number,
): Promise<ReadableStream<Uint8Array> | Blob | null> {
  if (!REPORT_MEDIA_KEY_RE.test(file)) return null;
  if (gcsEnabled) return gcsStreamRange(objectKey(file), start, end);
  const handle = Bun.file(localPath(file));
  if (!(await handle.exists())) return null;
  return handle.slice(start, end + 1);
}

/**
 * Parses a single-range `Range` header against a known size.
 * Returns null for "serve the whole file" (no/unsupported header),
 * 'unsatisfiable' for a range outside the file, or the inclusive bounds.
 */
export function parseRange(header: string | undefined, size: number): { start: number; end: number } | null | 'unsatisfiable' {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null; // multi-range or malformed: fall back to a full response (allowed by RFC 9110)
  const [, rawStart, rawEnd] = m;
  if (rawStart === '' && rawEnd === '') return null;

  let start: number;
  let end: number;
  if (rawStart === '') {
    // Suffix range: the last N bytes.
    const suffix = Number(rawEnd);
    if (suffix === 0) return 'unsatisfiable';
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === '' ? size - 1 : Math.min(Number(rawEnd), size - 1);
  }
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) return 'unsatisfiable';
  return { start, end };
}
