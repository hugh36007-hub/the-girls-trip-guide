const fs=require('fs');
const assert=require('assert');
const app=fs.readFileSync('girls-app-v2.js','utf8');
const must=(s,label)=>assert(app.includes(s),`Missing: ${label||s}`);
[
 ['product_key','Girls product isolation'],['save_booking','atomic booking save'],['save_expense','atomic expense save'],
 ['departureDate','flight dates'],['airline','airline'],['flightNumber','flight number'],['checkIn','hotel check-in'],['checkOut','hotel check-out'],['pickup','transfer pickup'],['dropoff','transfer dropoff'],['provider','provider'],['reference','booking reference'],['splitMode','split mode'],
 ['settled_at','settlement state'],['paid_at','payment paid state'],['escalation_approved','Seb escalation'],
 ['passport_confirmed','passport tracking'],['avatar_path','member avatar'],['trip_messages','organiser messaging'],
 ['btg-documents','documents storage'],['trip_media_contribution_breakdown','contribution breakdown'],
 ['tus.Upload','resumable uploads'],['.storage.supabase.co/storage/v1/upload/resumable','direct TUS endpoint'],['6*1024*1024','6MB TUS chunks'],
 ['thumbnail_path','media thumbnails'],['set_trip_hero','custom trip hero'],['hero_storage_path','hero persistence'],
 ['gallery_nudges','gallery comms setting'],['upload_celebrations','upload celebration setting'],['expense_nudges','expense comms setting'],['post_trip_uploads','post trip setting'],
 ['trip_storage_usage','quota check'],['set_vault_pin','vault'],['girls-stripe-checkout','Girls Stripe endpoint'],['girls-trip-email','Girls invite endpoint']
].forEach(([s,l])=>must(s,l));
for(const boys of ['Leave it to Coach','Freddy','Mickey','Charlie']) assert(!app.includes(boys),`Boys UI leaked into Girls: ${boys}`);
assert(app.includes('Grace')&&app.includes('Ava')&&app.includes('Lola')&&app.includes('Seb'),'GALS identity missing');
console.log('Girls feature parity static audit PASS');
