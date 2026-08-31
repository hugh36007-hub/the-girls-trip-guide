const fs=require('fs');
const assert=require('assert');
const js=fs.readFileSync('girls-document-audience.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const sql=fs.readFileSync('supabase/migrations/20260828193759_girls_document_audience.sql','utf8');

for(const token of [
  "value=\"everyone\"",
  "value=\"selected\"",
  "value=\"organiser\"",
  "document_recipients",
  "visibility",
  "Specific people",
  "Organiser only",
  "data-doc-audience-edit",
  "btg-documents"
]) assert(js.includes(token),`missing document-audience UI token: ${token}`);

assert(!html.includes('/girls-document-audience.js?v=1'),'document audience runtime must not execute on Home startup');
assert(!html.includes('/girls-document-audience.css?v=1'),'document audience styles must not load on Home startup');
assert(loader.includes('/girls-document-audience.js?v=1'),'Plan route must retain document audience runtime');
assert(loader.includes('/girls-document-audience.css?v=1'),'Plan route must retain document audience styles');
assert(loader.includes("if(route==='plan')await loadBundle('plan')"),'document audience must load with Plan route');

for(const token of [
  'documents_visibility_check',
  'create table if not exists public.document_recipients',
  'private.can_access_trip_document',
  'private.can_access_trip_document_path',
  "t.product_key <> 'girls'",
  "d.visibility = 'everyone'",
  "d.visibility = 'selected'",
  "documents_read_trip_members",
  'grant execute on function private.can_access_trip_document(uuid) to authenticated'
]) assert(sql.includes(token),`missing access-control SQL token: ${token}`);

assert(sql.includes('revoke all on function private.can_access_trip_document(uuid) from public, anon'),'private helper execute is not contained');
assert(sql.includes('is_trip_organiser(trip_id)'),'organiser write guard missing');
console.log('Girls document audience contract PASS');
