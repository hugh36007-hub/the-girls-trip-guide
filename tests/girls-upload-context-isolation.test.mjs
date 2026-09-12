import fs from 'node:fs';
import assert from 'node:assert/strict';
const src=fs.readFileSync('girls-app-v2.js','utf8');

assert.match(src,/async function storageUpload\(bucket,path,file,context=\{tripId:S\.trip\.id,userId:S\.user\.id\}\)/,'storage upload must accept immutable context');
assert.match(src,/const prefix=`\$\{context\.tripId\}\/\$\{context\.userId\}\//,'resumable lookup must use captured context');
assert.match(src,/async function doUpload\(files,album='evidence'\)\{const bucket=.*context=\{tripId:S\.trip\.id,userId:S\.user\.id\}/,'batch upload must capture trip/user once');
assert.match(src,/await loadStorageUsage\(context\.tripId\)/,'quota check must stay on captured trip');
assert.match(src,/const proposed=`\$\{context\.tripId\}\/\$\{context\.userId\}\//,'object path must stay on captured trip/user');
assert.match(src,/thumbPath=`\$\{context\.tripId\}\/\$\{context\.userId\}\/thumb-/,'thumbnail path must stay on captured trip/user');
assert.match(src,/trip_id:context\.tripId,album,storage_path:path,thumbnail_path:thumbPath,file_name:file\.name,mime_type:file\.type,size_bytes:file\.size,created_by:context\.userId/,'media row must stay on captured trip/user');
assert.match(src,/storageUpload\(bucket,proposed,file,context\)/);
console.log('PASS Girls upload context: trip/user identity remains immutable across object, resume, thumbnail and media row');
