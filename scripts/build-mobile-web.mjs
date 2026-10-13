import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const nativeRoot = process.cwd();
const out = path.join(nativeRoot, 'mobile-web');
const webSourceSha = process.env.GTG_WEB_SOURCE_SHA || '67d54633576b06c8652292ee5f61b794f1cf3446';
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

  // Point the Supabase tags at the bundled copy and drop integrity/crossorigin, which
  // only apply to the CDN. Matches web releases from before and after the CDN integrity change.
  const supabaseScriptTag = /<script\b[^>]*\bsrc="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2\.112\.4[^"]*"[^>]*><\/script>/g;
  const supabasePreloadTag = /<link\b[^>]*\bhref="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2\.112\.4[^"]*"[^>]*>/g;
  const vendoredSupabase = 'sha384-' + createHash('sha384').update(await readFile(path.join(vendorDir, 'supabase.js'))).digest('base64');
  const bundled = attribute => tag => tag
    .replace(new RegExp(`\\b${attribute}="[^"]*"`), `${attribute}="/vendor/supabase.js"`)
    .replace(/\s+integrity="[^"]*"/, '')
    .replace(/\s+crossorigin(?:="[^"]*")?/, '');

  const nativeHead = [
    '<script>window.GTG_NATIVE=true;document.documentElement.classList.add("gtg-native");</script>',
    '<link rel="stylesheet" href="/native-app.css">'
  ].join('\n  ');

  for (const entry of await readdir(out, { withFileTypes: true })) {
    if (!entry.isFile() || path.extname(entry.name) !== '.html') continue;
    const htmlPath = path.join(out, entry.name);
    let html = await readFile(htmlPath, 'utf8');
    for (const [tag] of html.matchAll(supabaseScriptTag)) {
      const pinned = tag.match(/\bintegrity="([^"]+)"/)?.[1];
      if (pinned && pinned !== vendoredSupabase) throw new Error(`Vendored supabase.js is not the file ${entry.name} pins.`);
    }
    html = html
      .replace(supabaseScriptTag, bundled('src'))
      .replace(supabasePreloadTag, bundled('href'))
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
    if (/<(?:script|link)\b[^>]*\b(?:src|href)="https:\/\/cdn\.jsdelivr\.net/.test(html)) {
      throw new Error(`Native ${entry.name} must not load scripts from the CDN.`);
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
