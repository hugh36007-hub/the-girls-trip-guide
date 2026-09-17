import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('native payload excludes service workers and bundles runtime vendors', async () => {
  const build = await read('scripts/build-mobile-web.mjs');
  for (const worker of ['worker.js', 'service-worker.js', 'sw.js']) {
    assert.match(build, new RegExp(worker.replace('.', '\\.')));
  }
  assert.match(build, /vendor\/supabase\.js/);
  assert.match(build, /vendor\/tus\.min\.js/);
});

test('native bridge owns lifecycle, links, back and connectivity boundaries', async () => {
  const source = await read('native-app.js');
  for (const token of ['appUrlOpen', 'appStateChange', 'backButton', 'networkStatusChange', 'getLaunchUrl']) {
    assert.match(source, new RegExp(token));
  }
});

test('landing and app navigation respect iPhone safe areas', async () => {
  const source = await read('native-app.css');
  assert.match(source, /\.gtg-native \.landing-header,/);
  assert.match(source, /padding-top: var\(--gtg-safe-top\)/);
  assert.match(source, /padding-bottom: max\(10px, var\(--gtg-safe-bottom\)\)/);
  assert.match(source, /\.gtg-native body \.hero/);
  assert.match(source, /padding-top: clamp\(190px, 45\.82vw, 250px\) !important/);
});

test('iOS status content stays legible on the black native chrome', async () => {
  const source = await read('scripts/configure-native-platforms.mjs');
  assert.match(source, /UIStatusBarStyleLightContent/);
  assert.match(source, /UIViewControllerBasedStatusBarAppearance/);
});

test('Stripe remains behind the web backend and is not embedded in native code', async () => {
  const source = await read('native-app.js');
  assert.doesNotMatch(source, /sk_(?:live|test)_/);
  assert.doesNotMatch(source, /Stripe\s*\(/);
  assert.match(source, /data-action=\\?"stripe\\?"/);
  assert.match(source, /data-action=\\?"upgrade\\?"/);
  assert.match(source, /Existing Full Trip access is recognised automatically/);
});

test('native safety and account deletion controls are available in app', async () => {
  const source = await read('native-app.js');
  for (const token of ['GTGNativeSafety', 'data-native-report', 'data-native-block', 'data-native-delete-account', 'account-deletion', 'safety-report']) {
    assert.match(source, new RegExp(token));
  }
  assert.match(source, /Signed-in in-app account deletion request/);
  assert.match(source, /Signed-in in-app safety report/);
  const media = await read('girls-media-social.js');
  assert.match(media, /data-native-media-report/);
  assert.match(media, /data-native-media-block/);
  assert.match(media, /media-comment/);
});

test('bundle identifier is stable and professional', async () => {
  const config = JSON.parse(await read('capacitor.config.json'));
  assert.equal(config.appId, 'com.storystone.thegirlstripguide');
  assert.equal(config.appName, 'The Girls Trip Guide');
  assert.equal(config.webDir, 'mobile-web');
});
