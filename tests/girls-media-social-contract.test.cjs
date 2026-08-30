const fs=require('fs'),assert=require('assert').strict,path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('girls-media-social.js'),html=read('create-trip.html'),base=read('supabase/migrations/20260830061100_media_social_actions_and_threads.sql'),hardening=read('supabase/migrations/20260830083348_media_interaction_hardening.sql'),edge=read('supabase/functions/media-action/index.ts');
for(const token of ['soft_remove_media','restore_removed_media','Permanent delete','>Delete<','>Hide<','>Comment<','gtg-social-tray','gtg-media-removed','gtg-thread-badge','gtg:media-thread','Continue thread'])assert(ui.includes(token),`missing UI contract: ${token}`);
for(const token of ['send_trip_media_chat_message_idempotent','p_client_token','crypto.randomUUID()','Promise.race','8000','finally'])assert(ui.includes(token),`missing idempotent comment contract: ${token}`);
assert(!ui.includes('navigate(dx<0?1:-1)'));assert(!ui.includes("stage.addEventListener('touchstart'"));
for(const token of ['client_token uuid','trip_chat_messages_sender_client_token_uidx','on conflict (sender_user_id,client_token)','security definer',"set search_path=''"] )assert(hardening.includes(token),`missing hardening migration contract: ${token}`);
for(const token of ['visibility_state','media_id','is_trip_organiser','send_trip_media_chat_message'])assert(base.includes(token));
assert(edge.includes('action === "hide"')&&edge.includes('action === "permanent-delete"'));
assert(html.includes('/girls-media-social.js?v=1'));
console.log('PASS Girls media social: one gesture owner and idempotent timeout-safe comments');

