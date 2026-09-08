import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { env } from '../config/env';

/**
 * Lab package storage. Packages are untrusted archives: they are stored
 * verbatim outside the application runtime, never extracted or executed on
 * the server, and only served back to authorized learners as downloads.
 */

export const STORAGE_ROOT = resolve(process.cwd(), process.env.STORAGE_DIR ?? env.STORAGE_DIR);

/** Canonical on-disk name for a lab package. Single source of truth. */
export function labPackageFilename(slug: string, version: string): string {
  return `${slug}-v${version}.zip`;
}

/** Conventional absolute location of a lab package under the current storage root. */
export function labPackagePath(slug: string, version: string): string {
  return join(STORAGE_ROOT, 'labs', labPackageFilename(slug, version));
}

/**
 * Locates a lab package on disk.
 *
 * `storedPath` is the absolute path recorded when the package was uploaded. It
 * can go stale — the API's working directory or STORAGE_DIR changes between
 * deploys, or the row was seeded on a host whose layout differs from the
 * container's. When it no longer resolves we fall back to the conventional
 * `<STORAGE_ROOT>/labs/<slug>-v<version>.zip`, which is where both the upload
 * path and the package build script write. Returns null when neither exists.
 */
export function resolveLabPackage(slug: string, version: string, storedPath?: string | null): string | null {
  if (storedPath && existsSync(storedPath)) return storedPath;
  const conventional = labPackagePath(slug, version);
  if (existsSync(conventional)) return conventional;
  return null;
}

/** Size in bytes of a package on disk, or null when it is missing. */
export function labPackageSize(absolutePath: string): number | null {
  try {
    return statSync(absolutePath).size;
  } catch {
    return null;
  }
}

export async function saveLabPackage(slug: string, version: string, data: Buffer): Promise<{ absolutePath: string; sizeBytes: number }> {
  const dir = join(STORAGE_ROOT, 'labs');
  mkdirSync(dir, { recursive: true });
  const absolutePath = join(dir, labPackageFilename(slug, version));
  writeFileSync(absolutePath, data, { mode: 0o640 });
  return { absolutePath, sizeBytes: data.byteLength };
}
