import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Girls native origin remains compatible with its production OTP endpoint', async () => {
  const config = JSON.parse(await readFile(new URL('../../capacitor.config.json', import.meta.url), 'utf8'));
  assert.equal(config.server.hostname, 'thegirlstripguide.com');
  assert.equal(config.server.androidScheme, 'https');
  assert.equal(config.android.captureInput, false);
  assert.equal(config.plugins.Keyboard.resizeOnFullScreen, false);
  assert.equal(config.plugins.StatusBar.overlaysWebView, false);
});
