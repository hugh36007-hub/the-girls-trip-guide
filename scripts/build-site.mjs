// Builds the public website into an output folder that contains only site files.
// Cloudflare Pages publishes this folder instead of the repository root, so docs,
// compliance notes, Supabase sources, tests, workflows and the native projects are
// never uploaded. Run from the repository root: node scripts/build-site.mjs [outDir]
import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.resolve(root, process.argv[2] || process.env.GTG_SITE_OUT || 'dist');
if (!out.startsWith(root + path.sep) || out.startsWith(path.join(root, 'assets'))) throw new Error('Output folder must be a separate folder inside the repository.');

// Root files are public only when they match this list. Everything else at the
// root (package.json, handover notes, config) is internal and is left behind.
const allowedRootExtensions = new Set(['.html', '.css', '.js']);
const allowedRootFiles = new Set(['_headers', '_redirects', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml']);

// assets/ is published recursively. A file type that is not listed here stops the
// build, so a new asset can never be silently dropped and nothing unexpected ships.
const allowedAssetExtensions = new Set(['.webp', '.png', '.jpg', '.jpeg', '.gif', '.avif', '.svg', '.ico', '.woff', '.woff2', '.mp4', '.webm']);
const ignoredAssetExtensions = new Set(['.md']);

async function copyAssets(from, to, counts) {
  for (const entry of await readdir(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name), target = path.join(to, entry.name);
    if (entry.isDirectory()) { await copyAssets(source, target, counts); continue; }
    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (ignoredAssetExtensions.has(extension)) continue;
    if (!allowedAssetExtensions.has(extension)) {
      throw new Error(`${path.relative(root, source)} is not a publishable asset type. Add "${extension}" to allowedAssetExtensions in scripts/build-site.mjs if it should be public.`);
    }
    await mkdir(to, { recursive: true });
    await cp(source, target);
    counts.assets++;
  }
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const counts = { root: 0, assets: 0 };
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (!allowedRootFiles.has(entry.name) && !allowedRootExtensions.has(path.extname(entry.name))) continue;
  await cp(path.join(root, entry.name), path.join(out, entry.name));
  counts.root++;
}
await copyAssets(path.join(root, 'assets'), path.join(out, 'assets'), counts);

const built = new Set(await readdir(out));
for (const required of ['index.html', 'create-trip.html', '_headers', '_redirects', 'sw.js', 'manifest.webmanifest']) {
  if (!built.has(required)) throw new Error(`Site build is missing ${required}.`);
}

console.log(`Built site into ${path.relative(root, out) || out}: ${counts.root} root files, ${counts.assets} assets.`);
