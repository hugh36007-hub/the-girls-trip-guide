const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const migration = fs.readFileSync(
  path.join(__dirname, '..', 'supabase', 'migrations', '20260920190000_girls_all_split_future_members.sql'),
  'utf8'
);

assert.match(migration, /t\.product_key = 'girls'/, 'future-member split repair must remain Girls-only');
assert.match(migration, /new\.status <> 'confirmed'/, 'only confirmed members may enter booking splits');
assert.match(migration, /b\.split_mode = 'all'/, 'selected-person splits must remain unchanged');
assert.match(migration, /on conflict do nothing/, 'repeat confirmation must remain idempotent');
assert.match(migration, /after insert or update of status on public\.trip_members/, 'new and newly-confirmed members must both be covered');
assert.match(migration, /revoke all on function public\.girls_sync_all_split_booking_member\(\) from public, anon, authenticated/, 'helper must not be callable by clients');

console.log('Girls future-member all-split contract passed.');
