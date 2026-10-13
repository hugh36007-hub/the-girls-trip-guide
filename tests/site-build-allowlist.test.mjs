// The published site must contain only site files. Builds into a temporary folder
// and checks that internal paths are absent and that nothing the pages load is missing.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outName = `.site-build-test-${process.pid}`;
const out = path.join(root, outName);

function walk(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full, base) : [path.relative(base, full).split(path.sep).join('/')];
  });
}

try {
  execFileSync(process.execPath, ['scripts/build-site.mjs', outName], { cwd: root, stdio: 'pipe' });
  const published = new Set(walk(out));
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);

  // Every tracked file is either a site file or absent from the build.
  const isSiteFile = file => {
    if (file.startsWith('assets/')) return !file.endsWith('.md');
    if (file.includes('/')) return false;
    return ['_headers', '_redirects', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml'].includes(file) || /\.(html|css|js)$/.test(file);
  };
  for (const file of tracked) {
    assert.equal(published.has(file), isSiteFile(file), `${file} ${isSiteFile(file) ? 'must be published' : 'must not be published'}`);
  }
  for (const file of published) assert(tracked.includes(file), `${file} is published but not tracked`);

  // Paths that were publicly readable before this build existed.
  const internal = [
    'package.json', 'package-lock.json', 'capacitor.config.json', 'deno.json', '.gitignore',
    'NATIVE_APP_HANDOVER.md', 'ANDROID_SIGNING_SETUP.md', 'STORE_SUBMISSION_CHECKLIST.md', 'GIRLS-BACKEND-RELEASE-STATUS.md',
    'docs/invitation-premature-confirmation-audit-2026-09-09.md', 'docs/store/STORE_POLICY_DECISION.md',
    'compliance/moderation-runbook.md', 'compliance/online-safety-risk-assessment.md',
    'supabase/config.toml', 'supabase/functions/girls-stripe-checkout/index.ts', 'supabase/migrations/20260902045332_launch_readiness_hardening.sql',
    'tests/retest-100.cjs', 'scripts/build-mobile-web.mjs', 'scripts/build-site.mjs',
    '.github/workflows/deploy-supabase-functions.yml', 'backend-ready/.env.example', 'backend-ready/stripe-contract.md',
    'android/app/build.gradle', 'ios/App/App/Info.plist', '.native-push-package/package.json', 'assets/images/README.md'
  ];
  for (const file of internal) {
    assert(tracked.includes(file), `${file} is no longer in the repository; update this list`);
    assert(!published.has(file), `${file} must not be published`);
  }
  for (const folder of ['docs', 'compliance', 'supabase', 'tests', 'scripts', '.github', 'backend-ready', 'android', 'ios', 'node_modules', '.git', '.native-push-package']) {
    assert(!fs.existsSync(path.join(out, folder)), `${folder}/ must not be published`);
  }

  // Nothing a page or script loads from the repository may be dropped by the build.
  // (A reference to a file the repository does not contain is a separate, older bug.)
  const trackedSet = new Set(tracked);
  const exists = ref => {
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]).replace(/^\.?\//, '');
    if (!clean) return true;
    const candidates = [clean, `${clean}.html`, `${clean}/index.html`];
    return candidates.some(name => published.has(name)) || !candidates.some(name => trackedSet.has(name));
  };
  const missing = [];
  for (const file of published) {
    if (file.endsWith('.html')) {
      const html = fs.readFileSync(path.join(out, file), 'utf8');
      for (const [, ref] of html.matchAll(/\b(?:src|href)=["']([^"'#][^"']*)["']/g)) {
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref)) continue;
        if (!exists(ref)) missing.push(`${file} -> ${ref}`);
      }
    }
    if (file.endsWith('.js')) {
      const js = fs.readFileSync(path.join(out, file), 'utf8');
      for (const [, ref] of js.matchAll(/["'`](\/[A-Za-z0-9_./-]+\.(?:js|css|webp|png|svg|webmanifest))(?:\?[^"'`]*)?["'`]/g)) {
        if (!exists(ref)) missing.push(`${file} -> ${ref}`);
      }
    }
  }
  assert.deepEqual(missing, [], 'Site files reference repository files that are not published');

  console.log(`PASS: site build publishes ${published.size} files and no internal paths.`);
} finally {
  fs.rmSync(out, { recursive: true, force: true });
}
