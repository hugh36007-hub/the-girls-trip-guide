const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sql = fs.readFileSync(
  path.join(__dirname, '..', 'supabase', 'migrations', '20260920201500_girls_document_owner_permissions.sql'),
  'utf8'
);

for (const operation of ['insert', 'update', 'delete']) {
  assert.match(sql, new RegExp(`documents_${operation}_girls_owner`), `missing Girls document ${operation} policy`);
}
assert.match(sql, /t\.product_key = 'girls'/, 'document repair must remain Girls-only');
assert.match(sql, /t\.owner_id = \(select auth\.uid\(\)\)/, 'document writes must require the trip owner');
assert.match(sql, /created_by = \(select auth\.uid\(\)\)/, 'document creation identity must not be forgeable');
assert.doesNotMatch(sql, /product_key = 'boys'/, 'document repair must not alter Boys permissions');

console.log('Girls document owner permissions contract passed.');
