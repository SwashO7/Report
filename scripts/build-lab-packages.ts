import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { zipSync, strToU8 } from "fflate";

const repoRoot = join(import.meta.dir, "..");
const packagesDir = join(repoRoot, "labs", "packages");
// Default output is the API's local storage dir. Overridable so the container
// image can stage packages outside the storage volume mount point.
const labsDir = process.env.LAB_PACKAGE_OUT
  ? resolve(process.env.LAB_PACKAGE_OUT)
  : join(repoRoot, "apps", "api", "storage", "labs");
const storageDir = join(labsDir, "..");

function collectFiles(dir: string, base: string, out: Record<string, Uint8Array> = {}): Record<string, Uint8Array> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, base, out);
    } else if (entry.isFile()) {
      const rel = relative(base, full).split(sep).join("/");
      out[rel] = new Uint8Array(readFileSync(full));
    }
  }
  return out;
}

mkdirSync(labsDir, { recursive: true });

const gitkeepPath = join(storageDir, ".gitkeep");
if (!existsSync(gitkeepPath)) {
  writeFileSync(gitkeepPath, "");
  console.log(`created ${relative(repoRoot, gitkeepPath)}`);
}

let slugs: string[] = [];
try {
  slugs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
} catch {
  console.error(`error: packages directory not found at ${packagesDir}`);
  process.exit(1);
}

if (slugs.length === 0) {
  console.error("error: no lab packages found in labs/packages/*");
  process.exit(1);
}

const results: string[] = [];

for (const slug of slugs) {
  const pkgDir = join(packagesDir, slug);
  const manifestPath = join(pkgDir, "manifest.yaml");

  if (!existsSync(manifestPath)) {
    console.error(`warning: skipping ${slug} (no manifest.yaml)`);
    continue;
  }

  const manifest = readFileSync(manifestPath, "utf8");
  const versionMatch = manifest.match(/^version:\s*(\S+)/m);
  if (!versionMatch) {
    console.error(`error: ${slug}/manifest.yaml has no version field`);
    process.exit(1);
  }
  const version = versionMatch[1];

  const files = collectFiles(pkgDir, pkgDir);
  const zipped = zipSync(files, { level: 9 });
  const zipName = `${slug}-v${version}.zip`;
  const zipPath = join(labsDir, zipName);
  writeFileSync(zipPath, Buffer.from(zipped));

  results.push(`${zipPath} (${(zipped.length / 1024).toFixed(1)} KB, ${Object.keys(files).length} files)`);
}

if (results.length === 0) {
  console.error("error: no packages were built");
  process.exit(1);
}

for (const line of results) {
  console.log(line);
}
console.log(`\ndone: ${results.length} package(s) written to ${relative(repoRoot, labsDir)}`);
