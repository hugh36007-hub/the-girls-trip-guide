import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const nativeRoot = process.cwd();
const out = path.join(nativeRoot, 'mobile-web');
const webSourceSha = process.env.GTG_WEB_SOURCE_SHA || '13337e72a9762700486c241af181e37170a3c991';
const sourceRoot = path.join(os.tmpdir(), `gtg-web-${webSourceSha.slice(0, 12)}`);
const excludedRootFiles = new Set(['worker.js', 'service-worker.js', 'sw.js', 'girls-pwa-register.js', 'girls-push-notifications.js']);
const allowedRootExtensions = new Set(['.html', '.css', '.js', '.webmanifest']);
const nativeRuntimeFiles = [
  'native-app.css',
  'native-url.js',
  'native-app.js',
  'native-push.js',
  'girls-conversation-inbox.js',
  'girls-media-social.js',
  'girls-trip-social.js'
];

if (!/^[a-f0-9]{40}$/.test(webSourceSha)) throw new Error('GTG_WEB_SOURCE_SHA must be an exact 40-character commit SHA.');

execFileSync('git', ['fetch', '--no-tags', 'origin', webSourceSha], { cwd: nativeRoot, stdio: 'inherit' });
await rm(sourceRoot, { recursive: true, force: true });
execFileSync('git', ['worktree', 'add', '--detach', sourceRoot, webSourceSha], { cwd: nativeRoot, stdio: 'inherit' });

try {
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  const entries = await readdir(sourceRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'assets' && entry.isDirectory()) {
      await cp(path.join(sourceRoot, entry.name), path.join(out, entry.name), { recursive: true });
      continue;
    }
    if (!entry.isFile()) continue;
    if (excludedRootFiles.has(entry.name)) continue;
    if (!allowedRootExtensions.has(path.extname(entry.name))) continue;
    await cp(path.join(sourceRoot, entry.name), path.join(out, entry.name));
  }

  for (const name of nativeRuntimeFiles) {
    await cp(path.join(nativeRoot, name), path.join(out, name));
  }

  const vendorDir = path.join(out, 'vendor');
  await mkdir(vendorDir, { recursive: true });
  await cp(
    path.join(nativeRoot, 'node_modules/@supabase/supabase-js/dist/umd/supabase.js'),
    path.join(vendorDir, 'supabase.js')
  );
  await cp(
    path.join(nativeRoot, 'node_modules/tus-js-client/dist/tus.min.js'),
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
      .replace(/\s*<script[^>]+src=["'][^"']*girls-pwa-register\.js[^"']*["'][^>]*><\/script>/gi, '')
      .replace(/\s*<script[^>]+src=["'][^"']*girls-push-notifications\.js[^"']*["'][^>]*><\/script>/gi, '');
    if (!html.includes('window.GTG_NATIVE=true')) {
      html = html.replace('</head>', `  ${nativeHead}\n</head>`);
    }
    if (!html.includes('src="/native-app.js"')) {
      html = html.replace(
        '</body>',
        '  <script defer src="/native-url.js"></script>\n  <script defer src="/native-app.js"></script>\n  <script defer src="/native-push.js"></script>\n</body>'
      );
    } else if (!html.includes('src="/native-push.js"')) {
      html = html.replace('</body>', '  <script defer src="/native-push.js"></script>\n</body>');
    }
    await writeFile(htmlPath, html, 'utf8');
  }

  const forbidden = ['worker.js', 'service-worker.js', 'sw.js', 'girls-pwa-register.js', 'girls-push-notifications.js'];
  for (const name of forbidden) {
    try {
      await readFile(path.join(out, name));
      throw new Error(`Native payload must not contain ${name}`);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  await writeFile(path.join(nativeRoot, '.gtg-web-source-sha'), `${webSourceSha}\n`, 'utf8');
  console.log(`Prepared self-contained mobile-web from Girls web release ${webSourceSha}.`);
} finally {
  execFileSync('git', ['worktree', 'remove', '--force', sourceRoot], { cwd: nativeRoot, stdio: 'inherit' });
}
