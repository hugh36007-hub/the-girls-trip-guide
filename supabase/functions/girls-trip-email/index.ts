import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.112.4'
declare const EdgeRuntime:{waitUntil(promise:Promise<unknown>):void}
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
  return out
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

    const body=await req.json().catch(()=>({})),tripId=String(body.tripId||''),requestedMemberId=String(body.memberId||''),resend=body.resend===true
    if(!UUID.test(tripId))return json({error:'Trip required'},400)
    const {data:trip,error:te}=await userDb.from('trips').select('id,owner_id,name,destination,start_date,end_date,plan,product_key').eq('id',tripId).maybeSingle()
    if(te)throw te
    if(!trip||trip.owner_id!==user.id||trip.product_key!=='girls')return json({error:'Only the organiser can send Girls Trip Guide invitations.'},403)

    const name=titleName(body.name),email=String(body.email||'').trim().toLowerCase()
    if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Name and valid email are required.'},400)

    const db=createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}})
    let member:any=null,me:any=null
    if(requestedMemberId){
      if(!UUID.test(requestedMemberId))return json({error:'Invalid member.'},400)
      const result=await db.from('trip_members').select('*').eq('id',requestedMemberId).eq('trip_id',tripId).maybeSingle()
      member=result.data;me=result.error
      if(me)throw me
      if(!member)return json({error:'That trip member could not be found.'},404)
    }else{
      const result=await db.from('trip_members').select('*').eq('trip_id',tripId).ilike('email',email).maybeSingle()
      member=result.data;me=result.error
      if(me)throw me
    }

    const wasConfirmed=member?.status==='confirmed'
    const now=new Date().toISOString()
    if(member){
      const update=wasConfirmed?{name,email}:{name,email,status:'invited',invited_at:now,opened_at:null,confirmed_at:null}
      const r=await db.from('trip_members').update(update).eq('id',member.id).eq('trip_id',tripId).select('*').single()
      if(r.error)throw r.error
      member=r.data
    }else{
      const r=await db.from('trip_members').insert({trip_id:tripId,name,email,role:'member',status:'invited',invited_at:now}).select('*').single()
      if(r.error)throw r.error
      member=r.data
    }

    const raw=token(),hash=await sha(raw),expires=new Date(Date.now()+7*86400000).toISOString()
    const ur=await db.from('trip_members').update({invite_token_hash:hash,invite_token_expires_at:expires}).eq('id',member.id).eq('trip_id',tripId)
    if(ur.error)throw ur.error

    const existing=await db.from('communications').select('id').eq('trip_id',tripId).eq('recipient_member_id',member.id).eq('trigger_code','T03').in('status',['girls_ready','girls_scheduled','girls_failed','held']).order('created_at',{ascending:false}).limit(1).maybeSingle()
    if(existing.error)throw existing.error
    let commId=existing.data?.id
    if(!commId){
      const q=await db.rpc('queue_communication',{p_trip_id:tripId,p_trigger_code:'T03',p_recipient_member_id:member.id,p_reason:resend?'Invitation resent':'Invitation issued',p_scheduled_for:new Date().toISOString(),p_essential:true,p_idempotency_key:`gtg-invite:${tripId}:${member.id}:${Date.now()}`})
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
    const accessCopy=wasConfirmed||resend
    const payload=accessCopy
      ?{to:email,character:'grace',title:'Your trip link is ready.',message:`Hey ${first}, here’s a fresh secure link for ${trip.name}. It opens the correct trip directly.`,tripName:trip.destination||trip.name,cta:'OPEN THE TRIP',url:join.toString(),subject:`Your trip link · ${trip.name}`,preheader:`Fresh secure access to ${trip.name}`,idempotencyKey:`gtg-invite-${commId}`}
      :{to:email,character:'grace',title:'You’re invited.',message:`Hey ${first}, you’ve been added to ${trip.name}. Open the invitation and have a look at the plan before another version appears in the group chat.`,tripName:trip.destination||trip.name,cta:'JOIN THE TRIP',url:join.toString(),subject:`You’re invited · ${trip.name}`,preheader:`Grace invited you to ${trip.name}`,idempotencyKey:`gtg-invite-${commId}`}

    const delivery=(async()=>{
      try{
        const result=await deliver(payload)
        if(result.suppressed){await db.from('communications').update({status:'cancelled',reason:`Recipient suppressed: ${result.reason||'delivery blocked'}`,attempt_count:1,last_attempt_at:new Date().toISOString(),last_error:null,character:'grace'}).eq('id',commId);return}
        await db.from('communications').update({status:'sent',sent_at:new Date().toISOString(),provider:'resend',provider_message_id:result.id,attempt_count:1,last_attempt_at:new Date().toISOString(),last_error:null,character:'grace'}).eq('id',commId)
        await db.from('communications').update({status:'cancelled',reason:'Superseded by delivered invitation',last_error:null}).eq('trip_id',tripId).eq('recipient_member_id',member.id).eq('trigger_code','T03').in('status',['girls_ready','girls_scheduled','girls_failed']).neq('id',commId)
      }catch(e){
        console.error('Girls invitation background delivery failed',e instanceof Error?e.message:String(e))
        await db.from('communications').update({status:'girls_ready',last_error:e instanceof Error?e.message:String(e)}).eq('id',commId)
      }
    })()
    EdgeRuntime.waitUntil(delivery)

    return json({ok:true,member,communicationId:commId,sent:false,queued:true,resend:accessCopy})
  }catch(e){
    console.error(e)
    return json({error:e instanceof Error?e.message:'Invitation failed'},500)
  }
})
