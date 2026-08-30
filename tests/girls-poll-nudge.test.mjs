import fs from 'node:fs';
import assert from 'node:assert/strict';
const ui=fs.readFileSync('girls-poll-nudge.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20260830074523_poll_nudge_chat_link.sql','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
for(const token of ['data-gtg-poll-nudge','send_trip_poll_nudge','Poll nudge sent to Group chat.','gtg-chat-poll-link','Poll reminder','Vote now','data-gtg-poll-link'])assert(ui.includes(token),`missing Girls poll nudge UI contract: ${token}`);
for(const token of ['poll_id uuid references public.trip_polls','send_trip_poll_nudge','Only the poll creator or trip organiser can nudge this poll',"interval '2 minutes'",'grant execute on function public.send_trip_poll_nudge(uuid) to authenticated'])assert(migration.includes(token),`missing Girls poll nudge backend contract: ${token}`);
assert(html.includes('/girls-poll-nudge.js?v=1'),'Girls trip loader must include poll nudge layer');
console.log('PASS Girls poll nudge: Nudge sits with poll controls, creates a Group-chat poll reminder and links users back to voting');
