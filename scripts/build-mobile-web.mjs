import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'mobile-web');
const excludedRootFiles = new Set(['worker.js', 'service-worker.js', 'sw.js', 'girls-pwa-register.js']);
const allowedRootExtensions = new Set(['.html', '.css', '.js', '.webmanifest']);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const entries = await readdir(root, { withFileTypes: true });
for (const entry of entries) {
  if (entry.name === 'assets' && entry.isDirectory()) {
    await cp(path.join(root, entry.name), path.join(out, entry.name), { recursive: true });
    continue;
  }
  if (!entry.isFile()) continue;
  if (excludedRootFiles.has(entry.name)) continue;
  if (!allowedRootExtensions.has(path.extname(entry.name))) continue;
  await cp(path.join(root, entry.name), path.join(out, entry.name));
}

const vendorDir = path.join(out, 'vendor');
await mkdir(vendorDir, { recursive: true });
await cp(
  path.join(root, 'node_modules/@supabase/supabase-js/dist/umd/supabase.js'),
  path.join(vendorDir, 'supabase.js')
);
await cp(
  path.join(root, 'node_modules/tus-js-client/dist/tus.min.js'),
  path.join(vendorDir, 'tus.min.js')
);

const nativeHead = [
  '<script>window.GTG_NATIVE=true;document.documentElement.classList.add("gtg-native");</script>',
  '<link rel="stylesheet" href="/native-app.css">'
].join('\n  ');

for (const entry of await readdir(out, { withFileTypes: true })) {
  if (!entry.isFile() || path.extname(entry.name) !== '.html') continue;
  const htmlPath = path.join(out, entry.name);
  let html = await readFile(htmlPath, 'utf8');
  html = html
    .replaceAll('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4', '/vendor/supabase.js')
    .replaceAll('https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/dist/tus.min.js', '/vendor/tus.min.js')
    .replace(/\s*<script[^>]+src=["'][^"']*girls-pwa-register\.js[^"']*["'][^>]*><\/script>/gi, '');
  if (!html.includes('window.GTG_NATIVE=true')) {
    html = html.replace('</head>', `  ${nativeHead}\n</head>`);
  }
  if (!html.includes('src="/native-app.js"')) {
    html = html.replace(
      '</body>',
      '  <script defer src="/native-url.js"></script>\n  <script defer src="/native-app.js"></script>\n</body>'
    );
  }
  await writeFile(htmlPath, html, 'utf8');
}

const forbidden = ['worker.js', 'service-worker.js', 'sw.js', 'girls-pwa-register.js'];
for (const name of forbidden) {
  try {
    await readFile(path.join(out, name));
    throw new Error(`Native payload must not contain ${name}`);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

console.log('Prepared self-contained mobile-web from the current Girls runtime.');
