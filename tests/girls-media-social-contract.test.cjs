const fs=require('fs'),assert=require('assert').strict,path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('girls-media-social.js'),html=read('create-trip.html'),migration=read('supabase/migrations/20260830061100_media_social_actions_and_threads.sql'),edge=read('supabase/functions/media-action/index.ts');
for(const token of ['soft_remove_media','restore_removed_media','send_trip_media_chat_message','Permanent delete','>Delete<','>Hide<','>Comment<','gtg-social-tray','gtg-media-removed','gtg-thread-badge','gtg:media-thread','Continue thread','navigate(dx<0?1:-1)'])assert(ui.includes(token),`missing UI contract: ${token}`);
for(const token of ['visibility_state','removed_pending_owner','media_id','media_delete_paid_creator_or_owner','is_trip_organiser','send_trip_media_chat_message'])assert(migration.includes(token),`missing migration contract: ${token}`);
for(const token of ['destinationBucket: "btg-vault"','action === "hide"','action === "permanent-delete"','trip.owner_id !== user.id','visibility_state !== "removed_pending_owner"'])assert(edge.includes(token),`missing edge contract: ${token}`);
assert(html.includes('/girls-media-social.js?v=1'),'create-trip must load Girls media social layer');
console.log('PASS Girls media social contract: swipe actions, owner tombstones, vault move and linked Group chat are source-controlled');
