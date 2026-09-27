import { env } from '../config/env';

/**
 * Minimal Google Cloud Storage client.
 *
 * Deliberately dependency-free: it speaks the JSON API over `fetch` and gets its
 * credentials from the metadata server that Cloud Run provides. That avoids
 * pulling in `@google-cloud/storage` (large, and it drags in gRPC), and more
 * importantly it means there is NO service-account key file anywhere - the
 * runtime identity is issued by the platform and rotates itself.
 *
 * Locally there is no metadata server, so `GOOGLE_ACCESS_TOKEN` is honoured as
 * an escape hatch (`gcloud auth print-access-token`) for one-off testing. In
 * normal local development `GCS_BUCKET` is unset and none of this runs.
 */

const METADATA_TOKEN_URL =
  'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';

let cached: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  const override = process.env.GOOGLE_ACCESS_TOKEN;
  if (override) return override;

  // Reuse until a minute before expiry.
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const res = await fetch(METADATA_TOKEN_URL, {
    headers: { 'Metadata-Flavor': 'Google' },
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) {
    throw new Error(`metadata token ${res.status}: not running on GCP, or the service account is missing`);
  }
  const body = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return cached.token;
}

function bucket(): string {
  if (!env.GCS_BUCKET) throw new Error('GCS_BUCKET is not configured');
  return env.GCS_BUCKET;
}

/** Object paths are keys, not filesystem paths - reject traversal and absolutes. */
function assertSafeKey(key: string): string {
  if (!key || key.startsWith('/') || key.includes('..') || key.includes('\\')) {
    throw new Error(`unsafe object key: ${key}`);
  }
  return key;
}

export async function gcsUpload(key: string, data: Buffer, contentType: string): Promise<number> {
  assertSafeKey(key);
  const url =
    `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket())}/o` +
    `?uploadType=media&name=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      'Content-Type': contentType,
      'Content-Length': String(data.byteLength),
    },
    body: new Uint8Array(data),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    throw new Error(`gcs upload ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`);
  }
  return data.byteLength;
}

export async function gcsDownload(key: string): Promise<Buffer | null> {
  assertSafeKey(key);
  const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket())}/o/${encodeURIComponent(key)}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
    signal: AbortSignal.timeout(120_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`gcs download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Streams an inclusive byte range of an object without buffering it.
 * Used for media playback, where browsers seek with HTTP Range requests and a
 * full download of a large video per request would waste memory and egress.
 */
export async function gcsStreamRange(key: string, start: number, end: number): Promise<ReadableStream<Uint8Array> | null> {
  assertSafeKey(key);
  const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket())}/o/${encodeURIComponent(key)}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${await accessToken()}`, Range: `bytes=${start}-${end}` },
    signal: AbortSignal.timeout(120_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`gcs range download ${res.status}`);
  return res.body;
}

/** Object size in bytes, or null when the object does not exist. */
export async function gcsSize(key: string): Promise<number | null> {
  assertSafeKey(key);
  const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket())}/o/${encodeURIComponent(key)}?fields=size`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`gcs stat ${res.status}`);
  const body = (await res.json()) as { size?: string };
  return body.size ? Number(body.size) : null;
}

export async function gcsDelete(key: string): Promise<void> {
  assertSafeKey(key);
  const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket())}/o/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${await accessToken()}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok && res.status !== 404) throw new Error(`gcs delete ${res.status}`);
}
