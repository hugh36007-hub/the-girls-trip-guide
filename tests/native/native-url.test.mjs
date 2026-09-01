import assert from 'node:assert/strict';
import test from 'node:test';

await import('../../native-url.js');
const { normalise } = globalThis.GTGNativeUrl;

test('accepts production invite and action links', () => {
  assert.equal(
    normalise('https://thegirlstripguide.com/invite.html?member=abc&token=xyz', '/index.html'),
    '/invite.html?member=abc&token=xyz'
  );
});

test('accepts the canonical www production host', () => {
  assert.equal(normalise('https://www.thegirlstripguide.com/?action=open', '/'), '/?action=open');
});

test('routes authenticated trip links into the private app', () => {
  assert.equal(
    normalise('https://thegirlstripguide.com/?trip_id=abc&action=plan', '/index.html'),
    '/create-trip.html?trip_id=abc&action=plan'
  );
});

test('rejects untrusted origins, insecure links and unsupported paths', () => {
  assert.equal(normalise('https://example.com/?invite=xyz'), null);
  assert.equal(normalise('http://thegirlstripguide.com/?invite=xyz'), null);
  assert.equal(normalise('https://thegirlstripguide.com/admin?invite=xyz'), null);
});
