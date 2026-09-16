import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Diagram seeds.
 *
 * The SVG files next to this module are authored by `scripts/build-diagrams.mjs`.
 * The seeder INSERTS them only when a diagram with that slug does not already
 * exist, so edits made in Admin -> Diagrams are never clobbered by a re-seed.
 * Drop a new .svg in this folder (and add it to manifest.json) to ship another
 * one, or just upload it from the admin panel.
 */

export type DiagramSeed = {
  slug: string;
  title: string;
  description: string;
  category: string;
  mimeType: 'image/svg+xml';
  encoding: 'utf8';
  content: string;
  sizeBytes: number;
};

type ManifestEntry = { slug: string; title: string; category: string; file: string; description?: string };

const HERE = dirname(fileURLToPath(import.meta.url));

function loadManifest(): ManifestEntry[] {
  const manifestPath = join(HERE, 'diagrams', 'manifest.json');
  if (existsSync(manifestPath)) {
    return JSON.parse(readFileSync(manifestPath, 'utf8')) as ManifestEntry[];
  }
  // No manifest: fall back to whatever SVGs are present.
  const dir = join(HERE, 'diagrams');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => {
      const slug = f.replace(/\.svg$/, '');
      const words = slug.replace(/-/g, ' ');
      return { slug, title: words.charAt(0).toUpperCase() + words.slice(1), category: 'general', file: f };
    });
}

export function loadDiagramSeeds(): DiagramSeed[] {
  const out: DiagramSeed[] = [];
  for (const entry of loadManifest()) {
    const path = join(HERE, 'diagrams', entry.file);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, 'utf8');
    out.push({
      slug: entry.slug,
      title: entry.title,
      description: entry.description ?? '',
      category: entry.category,
      mimeType: 'image/svg+xml',
      encoding: 'utf8',
      content,
      sizeBytes: Buffer.byteLength(content, 'utf8'),
    });
  }
  return out;
}
