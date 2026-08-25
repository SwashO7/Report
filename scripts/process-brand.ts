/**
 * Brand asset pipeline.
 * Source: white.png (white "S" shield mark on black).
 * Produces in apps/web/public/brand/:
 *   - logo-white.png   (white marks, transparent background — dark surfaces)
 *   - logo-dark.png    (deep navy marks, transparent background — light surfaces)
 *   - logo-white@2x.png / logo-dark@2x.png
 *   - favicon-32.png, apple-touch-icon.png (180)
 *   - og-image.png (1200x630 branded card, logo centered on navy)
 * Run once: bun scripts/process-brand.ts
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dir, '..');
const SRC = join(ROOT, 'white.png');
const OUT = join(ROOT, 'apps', 'web', 'public', 'brand');
mkdirSync(OUT, { recursive: true });

const NAVY = { r: 13, g: 20, b: 36 }; // #0D1424 — deep brand navy
const NAVY_LIGHT = { r: 17, g: 27, b: 48 };

function loadPng(path: string): PNG {
  return PNG.sync.read(readFileSync(path));
}

function savePng(png: PNG, path: string) {
  writeFileSync(path, PNG.sync.write(png));
}

/** Convert black background to transparency; keep white marks, optionally tint. */
function toTransparentAlpha(src: PNG, tint?: { r: number; g: number; b: number }): PNG {
  const out = new PNG({ width: src.width, height: src.height });
  for (let i = 0; i < src.data.length; i += 4) {
    const r = src.data[i];
    const g = src.data[i + 1];
    const b = src.data[i + 2];
    // Luminance drives alpha: white marks stay opaque, black bg disappears.
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const alpha = Math.round(Math.max(0, Math.min(1, (lum - 0.12) / 0.75)) * 255);
    if (tint) {
      out.data[i] = tint.r;
      out.data[i + 1] = tint.g;
      out.data[i + 2] = tint.b;
    } else {
      out.data[i] = r;
      out.data[i + 1] = g;
      out.data[i + 2] = b;
    }
    out.data[i + 3] = alpha;
  }
  return out;
}

function resize(src: PNG, w: number, h: number): PNG {
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.floor((x / w) * src.width);
      const sy = Math.floor((y / h) * src.height);
      const si = (sy * src.width + sx) * 4;
      const di = (y * w + x) * 4;
      out.data[di] = src.data[si];
      out.data[di + 1] = src.data[si + 1];
      out.data[di + 2] = src.data[si + 2];
      out.data[di + 3] = src.data[si + 3];
    }
  }
  return out;
}

function composeCentered(bg: { r: number; g: number; b: number }, mark: PNG, w: number, h: number, markScale: number): PNG {
  const out = new PNG({ width: w, height: h });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = bg.r;
    out.data[i + 1] = bg.g;
    out.data[i + 2] = bg.b;
    out.data[i + 3] = 255;
  }
  const markH = Math.floor(h * markScale);
  const markW = Math.floor((mark.width / mark.height) * markH);
  const scaled = resize(mark, markW, markH);
  const ox = Math.floor((w - markW) / 2);
  const oy = Math.floor((h - markH) / 2);
  for (let y = 0; y < markH; y++) {
    for (let x = 0; x < markW; x++) {
      const si = (y * markW + x) * 4;
      const a = scaled.data[si + 3] / 255;
      if (a === 0) continue;
      const dx = ox + x;
      const dy = oy + y;
      if (dx < 0 || dy < 0 || dx >= w || dy >= h) continue;
      const di = (dy * w + dx) * 4;
      out.data[di] = Math.round(scaled.data[si] * a + out.data[di] * (1 - a));
      out.data[di + 1] = Math.round(scaled.data[si + 1] * a + out.data[di + 1] * (1 - a));
      out.data[di + 2] = Math.round(scaled.data[si + 2] * a + out.data[di + 2] * (1 - a));
    }
  }
  return out;
}

const src = loadPng(SRC);
console.info(`[brand] source ${src.width}x${src.height}`);

const white = toTransparentAlpha(src);
savePng(white, join(OUT, 'logo-white@2x.png'));
savePng(resize(white, Math.round(src.width / 2), Math.round(src.height / 2)), join(OUT, 'logo-white.png'));

const dark = toTransparentAlpha(src, NAVY);
savePng(dark, join(OUT, 'logo-dark@2x.png'));
savePng(resize(dark, Math.round(src.width / 2), Math.round(src.height / 2)), join(OUT, 'logo-dark.png'));

savePng(resize(white, 32, 32), join(OUT, 'favicon-32.png'));
savePng(resize(white, 180, 180), join(OUT, 'apple-touch-icon.png'));

// OG image: logo centered on navy with subtle border vignette.
const og = composeCentered(NAVY_LIGHT, white, 1200, 630, 0.42);
savePng(og, join(OUT, 'og-image.png'));

// Favicon.ico replacement: modern browsers accept PNG favicons.
if (!existsSync(join(OUT, 'favicon-32.png'))) throw new Error('favicon missing');
console.info('[brand] assets written to apps/web/public/brand');
