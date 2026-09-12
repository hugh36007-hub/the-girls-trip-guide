import fs from 'node:fs';
import crypto from 'node:crypto';

const APP='girls-app-v2.js';
const PARITY='girls-parity-refresh-20260904.js';
const BASE_APP='3943b9b713c80c0cb70743be94e68d0e976d6b6e';
const FINAL_APP='b1e303858b5fa802de3ec6d270dbec38af100041';
const BASE_PARITY='6efe857da21187bea7d7eced222c416285783db4';
const FINAL_PARITY='272e7351e46b0066dcc2fcd8854ad6d7af02c370';
const blobSha=s=>crypto.createHash('sha1').update(`blob ${Buffer.byteLength(s)}\0`).update(s).digest('hex');
const once=(s,a,b,label)=>{if(!s.includes(a))throw new Error(`Missing ${label}`);return s.replace(a,b)};

let app=fs.readFileSync(APP,'utf8');
const appStart=blobSha(app);
if(appStart!==BASE_APP&&appStart!==FINAL_APP)throw new Error(`Unexpected ${APP} ${appStart}`);
if(appStart===BASE_APP){
  app=once(app,"};\nconst app=document.getElementById('app')","};\nconst LEGAL_VERSION='2026-09-04-2';\nconst app=document.getElementById('app')",'legal version owner');
  app=once(app,"async function loadStorageUsage(){try{const {data,error}=await db().rpc('trip_storage_usage',{target_trip_id:S.trip.id});","async function loadStorageUsage(tripId=S.trip.id){try{const {data,error}=await db().rpc('trip_storage_usage',{target_trip_id:tripId});",'storage usage context');
  app=once(app,"async function storageUpload(bucket,path,file){","async function storageUpload(bucket,path,file,context={tripId:S.trip.id,userId:S.user.id}){",'storage upload context');
  app=once(app,"const prefix=`${S.trip.id}/${S.user.id}/`;await new Promise","const prefix=`${context.tripId}/${context.userId}/`;await new Promise",'resumable prefix');
  const start=app.indexOf("async function doUpload(files,album='evidence')");
  const end=app.indexOf('\nasync function uploadHero',start);
  if(start<0||end<0)throw new Error('Missing doUpload block');
  let block=app.slice(start,end);
  block=once(block,"const bucket=album==='vault'?'btg-vault':'btg-evidence';for(const file of files)","const bucket=album==='vault'?'btg-vault':'btg-evidence',context={tripId:S.trip.id,userId:S.user.id};for(const file of files)",'upload context capture');
  block=once(block,'await loadStorageUsage();','await loadStorageUsage(context.tripId);','upload quota context');
  block=block.replaceAll('${S.trip.id}/${S.user.id}/','${context.tripId}/${context.userId}/');
  block=once(block,'storageUpload(bucket,proposed,file)','storageUpload(bucket,proposed,file,context)','main upload context');
  block=once(block,"storageUpload(bucket,thumbPath,new File([thumb],'thumbnail.webp',{type:'image/webp'}))","storageUpload(bucket,thumbPath,new File([thumb],'thumbnail.webp',{type:'image/webp'}),context)",'thumbnail upload context');
  block=once(block,'trip_id:S.trip.id,album,storage_path:path,thumbnail_path:thumbPath,file_name:file.name,mime_type:file.type,size_bytes:file.size,created_by:S.user.id','trip_id:context.tripId,album,storage_path:path,thumbnail_path:thumbPath,file_name:file.name,mime_type:file.type,size_bytes:file.size,created_by:context.userId','media row context');
  app=app.slice(0,start)+block+app.slice(end);
  app=once(app,"I request immediate access. I understand my statutory cancellation right for supplied digital content may end when supply begins, but Storystone's contractual 14-day full refund still applies.","I request immediate access. I understand my statutory cancellation right for supplied digital content may end when supply begins, and that there is no additional 14-day change-of-mind refund guarantee after supply has begun. My other statutory rights are unaffected.",'checkout consent');
  app=once(app,"legalVersion:'2026-09-04',refundPolicyVersion:'2026-09-04'","legalVersion:LEGAL_VERSION,refundPolicyVersion:LEGAL_VERSION",'checkout legal payload');
}
if(blobSha(app)!==FINAL_APP)throw new Error(`Final ${APP} hash mismatch: ${blobSha(app)}`);
fs.writeFileSync(APP,app);

let parity=fs.readFileSync(PARITY,'utf8');
const parityStart=blobSha(parity);
if(parityStart!==BASE_PARITY&&parityStart!==FINAL_PARITY)throw new Error(`Unexpected ${PARITY} ${parityStart}`);
if(parityStart===BASE_PARITY){
  parity=once(parity,"const LEGAL_VERSION='2026-09-04-2';\n",'', 'parity legal constant');
  const a=parity.indexOf('/* Make the revised checkout legal version authoritative without rewriting the core app. */');
  const b=parity.indexOf('/* Poll state must exist before the first normalise() call.',a);
  if(a<0||b<0)throw new Error('Missing parity checkout monkeypatch block');
  parity=parity.slice(0,a)+parity.slice(b);
}
if(blobSha(parity)!==FINAL_PARITY)throw new Error(`Final ${PARITY} hash mismatch: ${blobSha(parity)}`);
fs.writeFileSync(PARITY,parity);
console.log('Girls core hardening hashes verified');