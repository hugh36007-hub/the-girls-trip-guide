import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.112.4'
const cors={'Access-Control-Allow-Origin':'https://thegirlstripguide.com','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function json(b:any,s=200){return new Response(JSON.stringify(b),{status:s,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}})}
function env(n:string){const v=Deno.env.get(n)||'';if(!v)throw new Error(`${n} missing`);return v}
function token(){const b=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
async function sha(v:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
function titleName(v:any){return String(v||'').trim().split(/\s+/).filter(Boolean).map(x=>x[0].toUpperCase()+x.slice(1).toLowerCase()).join(' ')}
async function deliver(payload:any){
  const r=await fetch(`${env('SUPABASE_URL')}/functions/v1/girls-email-send`,{method:'POST',headers:{'Content-Type':'application/json','x-btg-cron-secret':env('BTG_CRON_SECRET')},body:JSON.stringify(payload)})
  const out=await r.json().catch(()=>({}))
  if(!r.ok||!out?.ok)throw new Error(out?.error||`Girls email send ${r.status}`)
  return out.id
}
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
  if(req.method!=='POST')return json({error:'Method not allowed'},405)
  try{
    const auth=req.headers.get('Authorization')||''
    if(!auth.startsWith('Bearer '))return json({error:'Sign-in required'},401)
    const pub=Deno.env.get('SUPABASE_ANON_KEY')||env('SUPABASE_PUBLISHABLE_KEY')
    const userDb=createClient(env('SUPABASE_URL'),pub,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}})
    const {data:{user},error:ue}=await userDb.auth.getUser()
    if(ue||!user)return json({error:'Sign-in required'},401)

    const body=await req.json().catch(()=>({})),tripId=String(body.tripId||'')
    if(!UUID.test(tripId))return json({error:'Trip required'},400)
    const {data:trip,error:te}=await userDb.from('trips').select('id,owner_id,name,destination,start_date,end_date,plan,product_key').eq('id',tripId).maybeSingle()
    if(te)throw te
    if(!trip||trip.owner_id!==user.id||trip.product_key!=='girls')return json({error:'Only the organiser can send Girls Trip Guide invitations.'},403)

    const name=titleName(body.name),email=String(body.email||'').trim().toLowerCase()
    if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Name and valid email are required.'},400)

    const db=createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}})
    let {data:member,error:me}=await db.from('trip_members').select('*').eq('trip_id',tripId).ilike('email',email).maybeSingle()
    if(me)throw me
    if(member?.status==='confirmed')return json({error:'That person is already confirmed.'},409)

    if(member){
      const r=await db.from('trip_members').update({name,email,status:'invited',invited_at:new Date().toISOString(),opened_at:null,confirmed_at:null}).eq('id',member.id).select('*').single()
      if(r.error)throw r.error
      member=r.data
    }else{
      const r=await db.from('trip_members').insert({trip_id:tripId,name,email,role:'member',status:'invited',invited_at:new Date().toISOString()}).select('*').single()
      if(r.error)throw r.error
      member=r.data
    }

    const raw=token(),hash=await sha(raw),expires=new Date(Date.now()+7*86400000).toISOString()
    const ur=await db.from('trip_members').update({invite_token_hash:hash,invite_token_expires_at:expires}).eq('id',member.id)
    if(ur.error)throw ur.error

    const existing=await db.from('communications').select('id').eq('trip_id',tripId).eq('recipient_member_id',member.id).eq('trigger_code','T03').in('status',['girls_ready','girls_scheduled','girls_failed','held']).order('created_at',{ascending:false}).limit(1).maybeSingle()
    if(existing.error)throw existing.error
    let commId=existing.data?.id
    if(!commId){
      const q=await db.rpc('queue_communication',{p_trip_id:tripId,p_trigger_code:'T03',p_recipient_member_id:member.id,p_reason:'Invitation issued',p_scheduled_for:new Date().toISOString(),p_essential:true,p_idempotency_key:`gtg-invite:${tripId}:${member.id}:${Date.now()}`})
      if(q.error)throw q.error
      commId=q.data
    }

    const held=await db.from('communications').update({status:'held',last_error:null}).eq('id',commId)
    if(held.error)throw held.error

    const join=new URL(`${env('SUPABASE_URL')}/functions/v1/girls-accept-invite`)
    join.searchParams.set('member',member.id)
    join.searchParams.set('token',raw)
    join.searchParams.set('confirm','1')
    const first=titleName(name).split(' ')[0]||''
    const payload={to:email,character:'grace',title:'You’re invited.',message:`Hey ${first}, you’ve been added to ${trip.name}. Open the invitation and have a look at the plan before another version appears in the group chat.`,tripName:trip.destination||trip.name,cta:'JOIN THE TRIP',url:join.toString(),subject:`You’re invited · ${trip.name}`,preheader:`Grace invited you to ${trip.name}`,idempotencyKey:`gtg-invite-${commId}`}

    const delivery=(async()=>{
      try{
        const providerId=await deliver(payload)
        await db.from('communications').update({status:'sent',sent_at:new Date().toISOString(),provider:'resend',provider_message_id:providerId,attempt_count:1,last_attempt_at:new Date().toISOString(),last_error:null,character:'grace'}).eq('id',commId)
        await db.from('communications').update({status:'cancelled',reason:'Superseded by delivered invitation',last_error:null}).eq('trip_id',tripId).eq('recipient_member_id',member.id).eq('trigger_code','T03').in('status',['girls_ready','girls_scheduled','girls_failed']).neq('id',commId)
      }catch(e){
        console.error('Girls invitation background delivery failed',e instanceof Error?e.message:String(e))
        await db.from('communications').update({status:'girls_ready',last_error:e instanceof Error?e.message:String(e)}).eq('id',commId)
      }
    })()
    EdgeRuntime.waitUntil(delivery)

    return json({ok:true,member,communicationId:commId,sent:true,accepted:true})
  }catch(e){
    console.error(e)
    return json({error:e instanceof Error?e.message:'Invitation failed'},500)
  }
})
