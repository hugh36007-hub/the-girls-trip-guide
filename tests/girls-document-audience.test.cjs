const fs=require('fs');
const assert=require('assert');
const js=fs.readFileSync('girls-document-audience.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
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

assert(html.includes('/girls-document-audience.js?v=1'),'document audience runtime not loaded');
assert(html.includes('/girls-document-audience.css?v=1'),'document audience styles not loaded');

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
