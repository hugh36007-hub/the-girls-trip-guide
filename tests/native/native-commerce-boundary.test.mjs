import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('native App Store shell blocks purchase controls and marketing routes', async () => {
  const source = await read('native-app.js');
  assert.match(source, /\[data-a="upgrade"\]/);
  assert.match(source, /free-vs-full/);
  assert.match(source, /full-trip/);
  assert.match(source, /redirectNativeMarketingRoutes/);
  assert.match(source, /window\.location\.replace\('\/create-trip\.html'\)/);
});

test('native App Store shell fails closed for Stripe checkout creation', async () => {
  const source = await read('native-app.js');
  assert.match(source, /installNativePurchaseFetchGuard/);
  assert.match(source, /girls-stripe-checkout/);
  assert.match(source, /action === 'create'/);
  assert.match(source, /Native checkout disabled/);
});

test('native App Store shell blocks checkout form submission and removes upgrade cards', async () => {
  const source = await read('native-app.js');
  assert.match(source, /#legalCheckoutForm/);
  assert.match(source, /stopImmediatePropagation/);
  assert.match(source, /\.card\.upgrade/);
  assert.match(source, /Existing Full Trip access is recognised automatically/);
});
