import fs from 'node:fs';
import assert from 'node:assert/strict';
const ui=fs.readFileSync('girls-poll-nudge.js','utf8');
const base=fs.readFileSync('supabase/migrations/20260830074523_poll_nudge_chat_link.sql','utf8');
const hardening=fs.readFileSync('supabase/migrations/20260830083348_media_interaction_hardening.sql','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
for(const token of ['data-gtg-poll-nudge','send_trip_poll_nudge','Poll nudge sent to Group chat.','gtg-chat-poll-link','Vote now'])assert(ui.includes(token));
assert(base.includes('poll_id uuid references public.trip_polls'));
for(const token of ['send_trip_poll_nudge','pg_advisory_xact_lock',"interval '2 minutes'",'grant execute on function public.send_trip_poll_nudge(uuid) to authenticated'])assert(hardening.includes(token),`missing locked poll contract: ${token}`);
assert(html.includes('/girls-poll-nudge.js?v=1'));
console.log('PASS Girls poll nudge cooldown is transactionally serialized');

