import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.112.4'

const cors={'Access-Control-Allow-Origin':'https://thegirlstripguide.com','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const FULL_MESSAGES:any={
  grace:(amount:number)=>`Ladies. ${new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(amount)} is due now. Pay it now so I don’t have to turn a girls’ trip into a disciplinary hearing.`,
  ava:()=>`Payment requested. Amount, deadline and instructions are all exactly where I put them. A small miracle.`,
  lola:()=>`Money is due. Tragic news: enthusiasm still cannot be transferred by bank.`,
  seb:()=>`Girls, money is due. Pay it, stay fabulous, move on.`
}
function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}})}
function env(name:string){const v=Deno.env.get(name)||'';if(!v)throw new Error(`${name} missing`);return v}
function validEmail(value:unknown){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||'').trim())}
async function deliver(payload:any){const r=await fetch(`${env('SUPABASE_URL')}/functions/v1/girls-email-send`,{method:'POST',headers:{'Content-Type':'application/json','x-btg-cron-secret':env('BTG_CRON_SECRET')},body:JSON.stringify(payload)});const out=await r.json().catch(()=>({}));if(!r.ok||!out?.ok)throw new Error(out?.error||`Girls email send ${r.status}`);return out.id}
async function debt(client:any,tripId:string,memberId:string){
  const q=await Promise.all([
    client.from('trip_members').select('id,name,email,user_id,role').eq('trip_id',tripId).eq('id',memberId).maybeSingle(),
    client.from('bookings').select('id,total_cost,payer_member_id').eq('trip_id',tripId),
    client.from('booking_participants').select('booking_id,member_id,settled_at').eq('trip_id',tripId),
    client.from('expenses').select('id,amount,payer_member_id').eq('trip_id',tripId),
    client.from('expense_participants').select('expense_id,member_id,settled_at').eq('trip_id',tripId)
  ])
  const failed=q.find(x=>x.error);if(failed?.error)throw failed.error
  const [memberQ,bookingsQ,bpQ,expensesQ,epQ]=q,member=memberQ.data;if(!member)throw new Error('Trip member not found.')
  let amount=0
  for(const row of bookingsQ.data||[]){if(!row.payer_member_id||row.payer_member_id===memberId)continue;const people=(bpQ.data||[]).filter((p:any)=>p.booking_id===row.id),mine=people.find((p:any)=>p.member_id===memberId);if(!mine||mine.settled_at||!people.length)continue;amount+=Number(row.total_cost||0)/people.length}
  for(const row of expensesQ.data||[]){if(!row.payer_member_id||row.payer_member_id===memberId)continue;const people=(epQ.data||[]).filter((p:any)=>p.expense_id===row.id),mine=people.find((p:any)=>p.member_id===memberId);if(!mine||mine.settled_at||!people.length)continue;amount+=Number(row.amount||0)/people.length}
  return {member,amount:Math.round(amount*100)/100}
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
  if(req.method!=='POST')return json({error:'Method not allowed'},405)
  let commId:string|null=null,db:any=null
  try{
    const auth=req.headers.get('Authorization')||'';if(!auth.startsWith('Bearer '))return json({error:'Sign-in required'},401)
    const pub=Deno.env.get('SUPABASE_ANON_KEY')||env('SUPABASE_PUBLISHABLE_KEY'),url=env('SUPABASE_URL')
    const userDb=createClient(url,pub,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}}),{data:{user},error:userError}=await userDb.auth.getUser();if(userError||!user)return json({error:'Sign-in required'},401)
    const body=await req.json().catch(()=>({})),tripId=String(body.tripId||''),recipientMemberId=String(body.recipientMemberId||'');if(!UUID.test(tripId)||!UUID.test(recipientMemberId))return json({error:'Trip and recipient are required.'},400)
    const {data:trip,error:tripError}=await userDb.from('trips').select('id,owner_id,name,destination,product_key').eq('id',tripId).maybeSingle();if(tripError)throw tripError;if(!trip||trip.owner_id!==user.id||trip.product_key!=='girls')return json({error:'Only the organiser can send payment nudges for this Girls trip.'},403)
    db=createClient(url,env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});const position=await debt(db,tripId,recipientMemberId)
    if(position.member.user_id===trip.owner_id||position.member.role==='organiser')return json({error:'You cannot send a payment nudge to the organiser.'},409)
    if(!validEmail(position.member.email))return json({error:'This group member does not have a deliverable email address.'},409)
    if(position.amount<0.01)return json({error:'There is no payable balance to nudge. Confirm who paid for each cost first.'},409)
    const cutoff=new Date(Date.now()-4*60*60*1000).toISOString(),{data:recent,error:recentError}=await db.from('communications').select('id,created_at').eq('trip_id',tripId).eq('recipient_member_id',recipientMemberId).eq('trigger_code','T11').eq('reason','Manual payment nudge').gte('created_at',cutoff).order('created_at',{ascending:false}).limit(1);if(recentError)throw recentError;if(recent?.length)return json({error:'A payment nudge was already sent to this person recently. Try again later.'},429)
    const [{data:settings,error:settingsError},{data:entitlements,error:entitlementsError}]=await Promise.all([db.from('communication_settings').select('character_mode').eq('trip_id',tripId).maybeSingle(),db.from('trip_entitlements').select('entitlement').eq('trip_id',tripId).eq('active',true).in('entitlement',['full_trip','full_comms'])]);if(settingsError)throw settingsError;if(entitlementsError)throw entitlementsError
    const full=Boolean(entitlements?.length),mode=String(settings?.character_mode||'grace-auto'),character=full&&['grace','ava','lola','seb'].includes(mode)?mode:full?'grace':'system',message=full?FULL_MESSAGES[character](position.amount):'A trip payment has been requested. Open the trip to review the amount and due date.'
    const {data:comm,error:commError}=await db.from('communications').insert({trip_id:tripId,trigger_code:'T11',recipient_member_id:recipientMemberId,status:'held',essential:true,reason:'Manual payment nudge',scheduled_for:new Date().toISOString(),idempotency_key:`gtg-payment-nudge:${tripId}:${recipientMemberId}:${crypto.randomUUID()}`}).select('id').single();if(commError)throw commError;commId=comm.id
    const target=new URL('https://thegirlstripguide.com/create-trip');target.searchParams.set('trip_id',tripId);target.searchParams.set('action','money')
    const providerId=await deliver({to:position.member.email,character,title:'Payment request',message,tripName:trip.name,cta:'View payment',url:target.toString(),subject:`Payment request · ${trip.name}`,preheader:`${character==='system'?'The Girls Trip Guide':character.charAt(0).toUpperCase()+character.slice(1)} · Payment request`,idempotencyKey:`gtg-${commId}-${recipientMemberId}`})
    await db.from('communications').update({status:'sent',sent_at:new Date().toISOString(),provider:'resend',provider_message_id:providerId,attempt_count:1,last_attempt_at:new Date().toISOString(),last_error:null,character}).eq('id',commId)
    return json({ok:true,sent:true,amount:position.amount,character,communicationId:commId})
  }catch(error){console.error('girls-payment-nudge failed',error);if(db&&commId)await db.from('communications').update({status:'girls_failed',attempt_count:1,last_attempt_at:new Date().toISOString(),last_error:error instanceof Error?error.message:String(error)}).eq('id',commId);return json({error:error instanceof Error?error.message:'Payment nudge failed'},500)}
})
