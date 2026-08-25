import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { env } from '../config/env';

/**
 * Lab package storage. Packages are untrusted archives: they are stored
 * verbatim outside the application runtime, never extracted or executed on
 * the server, and only served back to authorized learners as downloads.
 */

export const STORAGE_ROOT = resolve(process.cwd(), process.env.STORAGE_DIR ?? './storage');

export async function saveLabPackage(slug: string, version: string, data: Buffer): Promise<{ absolutePath: string; sizeBytes: number }> {
  const dir = join(STORAGE_ROOT, 'labs');
  mkdirSync(dir, { recursive: true });
  const filename = `${slug}-v${version}.zip`;
  const absolutePath = join(dir, filename);
  writeFileSync(absolutePath, data, { mode: 0o640 });
  return { absolutePath, sizeBytes: data.byteLength };
}
