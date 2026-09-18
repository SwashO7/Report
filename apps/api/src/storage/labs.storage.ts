import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { env, gcsEnabled } from '../config/env';
import { gcsDelete, gcsDownload, gcsSize, gcsUpload } from './gcs.client';

/**
 * Lab package storage. Packages are untrusted archives: they are stored
 * verbatim outside the application runtime, never extracted or executed on
 * the server, and only served back to authorized learners as downloads.
 *
 * Two backends:
 *  - **Local filesystem** (default) for development and the Docker Compose stack.
 *  - **Cloud Storage** when `GCS_BUCKET` is set, which production requires -
 *    Cloud Run replaces the container filesystem on every deploy, so a package
 *    written locally there would silently disappear.
 *
 * Call sites use the async `load*` / `save*` functions so the backend can swap
 * without them caring. The synchronous filesystem helpers remain for the seeder
 * and the package build script, which only ever run locally.
 */

export const STORAGE_ROOT = resolve(process.cwd(), process.env.STORAGE_DIR ?? env.STORAGE_DIR);

/** Canonical name for a lab package. Single source of truth for both backends. */
export function labPackageFilename(slug: string, version: string): string {
  return `${slug}-v${version}.zip`;
}

/** Conventional absolute location of a lab package under the current storage root. */
export function labPackagePath(slug: string, version: string): string {
  return join(STORAGE_ROOT, 'labs', labPackageFilename(slug, version));
}

/** Object key used in the bucket. Mirrors the on-disk layout. */
export function labPackageKey(slug: string, version: string): string {
  return `labs/${labPackageFilename(slug, version)}`;
}

/** True when packages live in a bucket rather than on this container's disk. */
export const usingObjectStorage = gcsEnabled;

/**
 * Locates a lab package on the LOCAL filesystem.
 *
 * `storedPath` is the absolute path recorded when the package was uploaded. It
 * can go stale - the API's working directory or STORAGE_DIR changes between
 * deploys, or the row was seeded on a host whose layout differs from the
 * container's. When it no longer resolves we fall back to the conventional
 * `<STORAGE_ROOT>/labs/<slug>-v<version>.zip`. Returns null when neither exists.
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

export type StoredPackage = {
  /** Absolute path for the filesystem backend, or `gs://bucket/key` for GCS. */
  locator: string;
  sizeBytes: number;
};

/** Persists an uploaded package to whichever backend is configured. */
export async function saveLabPackage(slug: string, version: string, data: Buffer): Promise<StoredPackage> {
  if (gcsEnabled) {
    const key = labPackageKey(slug, version);
    const sizeBytes = await gcsUpload(key, data, 'application/zip');
    return { locator: `gs://${env.GCS_BUCKET}/${key}`, sizeBytes };
  }

  const dir = join(STORAGE_ROOT, 'labs');
  mkdirSync(dir, { recursive: true });
  const absolutePath = join(dir, labPackageFilename(slug, version));
  writeFileSync(absolutePath, data, { mode: 0o640 });
  return { locator: absolutePath, sizeBytes: data.byteLength };
}

/**
 * Reads a package back for download, from either backend.
 *
 * Downloads are streamed through the API rather than handed out as signed
 * bucket URLs on purpose: the existing route already checks the learner is
 * authorized, applies the download rate limit, and records the download for
 * analytics. A signed URL would bypass all three and could be shared freely.
 */
export async function loadLabPackage(
  slug: string,
  version: string,
  storedLocator?: string | null,
): Promise<Buffer | null> {
  if (gcsEnabled) {
    // Prefer the recorded key when it points at a bucket, else the convention.
    const key = storedLocator?.startsWith('gs://')
      ? storedLocator.split('/').slice(3).join('/')
      : labPackageKey(slug, version);
    return gcsDownload(key);
  }

  const path = resolveLabPackage(slug, version, storedLocator);
  if (!path) return null;
  try {
    return readFileSync(path);
  } catch {
    return null;
  }
}

/** Size of a stored package without transferring it. */
export async function statLabPackage(
  slug: string,
  version: string,
  storedLocator?: string | null,
): Promise<number | null> {
  if (gcsEnabled) {
    const key = storedLocator?.startsWith('gs://')
      ? storedLocator.split('/').slice(3).join('/')
      : labPackageKey(slug, version);
    return gcsSize(key);
  }
  const path = resolveLabPackage(slug, version, storedLocator);
  return path ? labPackageSize(path) : null;
}

/** Removes a stored package. Used when a lab version is replaced. */
export async function deleteLabPackage(slug: string, version: string): Promise<void> {
  if (gcsEnabled) {
    await gcsDelete(labPackageKey(slug, version));
  }
  // Local packages are intentionally left in place: they are cheap, and the
  // build script regenerates them anyway.
}
