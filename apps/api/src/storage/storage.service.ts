import type { Context } from 'hono';
import { readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';

/**
 * Object-storage abstraction for lab packages and downloadable assets.
 * V1 uses the local filesystem (safe, zero-cost). The interface is designed
 * so an S3-compatible backend can replace it without touching call sites.
 *
 * Security: paths are resolved inside the storage root; downloads are always
 * served with safe content-disposition headers and never execute.
 */

export function resolveStoragePath(relativePath: string): string {
  const root = resolve(process.cwd(), process.env.STORAGE_DIR ?? './storage');
  const full = resolve(root, relativePath);
  if (!full.startsWith(root)) {
    throw new Error('Storage path traversal rejected');
  }
  return full;
}

const MIME_BY_EXT: Record<string, string> = {
  '.zip': 'application/zip',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};

/** Streams a stored file as an authorized, safe download. */
export function pathToFileStorage(c: Context, absolutePath: string, downloadName: string) {
  const data = readFileSync(absolutePath);
  return bytesToFileDownload(c, data, downloadName);
}

/**
 * Serves already-loaded bytes as a download. Used when the object came from
 * Cloud Storage and never touched this container's filesystem.
 *
 * Always sends an attachment disposition with a sanitised filename and
 * `nosniff`, so an untrusted archive can never be interpreted as anything
 * executable by the browser.
 */
export function bytesToFileDownload(c: Context, data: Buffer | Uint8Array, downloadName: string) {
  const safeName = downloadName.replace(/[^\w.\-]/g, '_');
  const mime = MIME_BY_EXT[extname(safeName).toLowerCase()] ?? 'application/octet-stream';
  const bytes = data instanceof Buffer ? new Uint8Array(data) : data;
  const headers = {
    'Content-Type': mime,
    'Content-Disposition': `attachment; filename="${safeName}"`,
    'Content-Length': String(bytes.byteLength),
    'X-Content-Type-Options': 'nosniff',
  };
  // Returned as a native Response: Hono's c.body() types reject a Uint8Array.
  return new Response(bytes, { status: 200, headers });
}
