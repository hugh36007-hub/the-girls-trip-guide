const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
}
const PRICE_ID='price_1U7JW9EUQ5rJLL4MdDH2x3qP'
const SITE='https://thegirlstripguide.com/create-trip'
const PROJECT='vtcmvwixfqyxqghibsla'
const WEBHOOK_URL=`https://${PROJECT}.supabase.co/functions/v1/stripe-webhook`
const LEGAL_VERSION='2026-09-04-2'
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const clean=(v:unknown,max=500)=>String(v??'').trim().slice(0,max)
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}})
function env(name:string){const v=Deno.env.get(name)||'';if(!v)throw new Error(`${name} is not configured.`);return v}
async function stripeRequest(path:string,params?:URLSearchParams){
  const res=await fetch(`https://api.stripe.com/v1/${path}`,{method:params?'POST':'GET',headers:{Authorization:`Bearer ${env('STRIPE_SECRET_KEY')}`,...(params?{'Content-Type':'application/x-www-form-urlencoded'}:{})},body:params?.toString()})
  const out=await res.json().catch(()=>({}));if(!res.ok)throw new Error(out?.error?.message||`Stripe error ${res.status}`);return out
}
async function authUser(req:Request){
  const auth=req.headers.get('authorization')||'';if(!auth.toLowerCase().startsWith('bearer '))return null
  const res=await fetch(`${env('SUPABASE_URL')}/auth/v1/user`,{headers:{Authorization:auth,apikey:env('SUPABASE_ANON_KEY')}});if(!res.ok)return null
  const user=await res.json().catch(()=>null);return user?.id?user:null
}
async function service(path:string,init:RequestInit={}){
  const key=env('SUPABASE_SERVICE_ROLE_KEY');const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...(init.headers||{})}
  const res=await fetch(`${env('SUPABASE_URL')}/rest/v1/${path}`,{...init,headers});const text=await res.text();let out:any=null;try{out=text?JSON.parse(text):null}catch{out=text}
  if(!res.ok)throw new Error(typeof out==='object'&&out?.message?out.message:`Supabase error ${res.status}`);return out
}
async function assertOwner(tripId:string,userId:string){
  const rows=await service(`trips?id=eq.${encodeURIComponent(tripId)}&owner_id=eq.${encodeURIComponent(userId)}&product_key=eq.girls&select=id,name,plan`)
  if(!Array.isArray(rows)||!rows.length)throw new Error('This Girls Trip Guide trip is not available for purchase from this account.');return rows[0]
}
async function upsertPurchase(input:{tripId:string,session:any,userId?:string|null,status?:string}){
  const status=input.status||'paid';const body={trip_id:input.tripId,provider:'stripe',provider_checkout_id:input.session.id,provider_payment_id:typeof input.session.payment_intent==='string'?input.session.payment_intent:null,status,amount_pence:Number(input.session.amount_total||2499),currency:String(input.session.currency||'gbp').toUpperCase(),purchased_by:input.userId||null,completed_at:status==='paid'?new Date().toISOString():null}
  const rows=await service('purchases?on_conflict=provider_checkout_id&select=id,status',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(body)});return Array.isArray(rows)?rows[0]:rows
}
async function activateTrip(tripId:string,purchaseId:string){
  const now=new Date().toISOString();for(const entitlement of ['full_trip','evidence','vault','full_comms'])await service('trip_entitlements?on_conflict=trip_id,entitlement',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({trip_id:tripId,entitlement,source_purchase_id:purchaseId,active:true,granted_at:now,revoked_at:null})})
  await service(`trips?id=eq.${encodeURIComponent(tripId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({plan:'full',updated_at:now})})
}
async function verifyAndActivate(session:any,expectedOwnerId?:string){
  const valid=session?.payment_status==='paid'&&session?.metadata?.product==='the-full-trip'&&session?.metadata?.product_key==='girls';if(!valid)return{paid:false,persisted:false}
  const tripId=clean(session?.metadata?.trip_id,80),userId=clean(session?.metadata?.purchaser_user_id,80)||null;if(!UUID.test(tripId))return{paid:true,persisted:false,tripId:null}
  if(expectedOwnerId){await assertOwner(tripId,expectedOwnerId);if(userId&&userId!==expectedOwnerId)throw new Error('Checkout ownership does not match this account.')}
  const purchase=await upsertPurchase({tripId,session,userId:userId||expectedOwnerId||null,status:'paid'});if(purchase?.id){await activateTrip(tripId,purchase.id);return{paid:true,persisted:true,tripId}}return{paid:true,persisted:false,tripId}
}
async function ensureWebhook(){
  try{const list=await stripeRequest('webhook_endpoints?limit=100');const existing=(list?.data||[]).find((x:any)=>x?.url===WEBHOOK_URL);const required=['checkout.session.completed','checkout.session.async_payment_succeeded','charge.refunded']
    if(existing?.id){const enabled=new Set(Array.isArray(existing.enabled_events)?existing.enabled_events:[]);if(!required.every(event=>enabled.has(event))){const p=new URLSearchParams();for(const event of required)p.append('enabled_events[]',event);await stripeRequest(`webhook_endpoints/${encodeURIComponent(existing.id)}`,p)}return existing.id}
    const p=new URLSearchParams();p.set('url',WEBHOOK_URL);for(const event of required)p.append('enabled_events[]',event);p.set('description','The Girls Trip Guide checkout activation and refund handling');return (await stripeRequest('webhook_endpoints',p))?.id||null
  }catch(error){console.warn('Webhook registration check failed',error);return null}
}
async function currentEntitlement(tripId:string){const rows=await service(`trip_entitlements?trip_id=eq.${encodeURIComponent(tripId)}&entitlement=eq.full_trip&active=eq.true&select=trip_id`);return Array.isArray(rows)&&rows.length>0}
async function reusablePending(tripId:string,userId:string){
  const rows=await service(`purchases?trip_id=eq.${encodeURIComponent(tripId)}&provider=eq.stripe&status=eq.pending&select=id,provider_checkout_id&order=created_at.desc&limit=5`)
  for(const row of Array.isArray(rows)?rows:[]){if(!row?.provider_checkout_id)continue;try{const s=await stripeRequest(`checkout/sessions/${encodeURIComponent(row.provider_checkout_id)}`);if(s?.payment_status==='paid'){await verifyAndActivate(s,userId);return{alreadyActive:true,reference:s.id}}
    if(s?.status==='open'&&s?.url&&s?.metadata?.terms_accepted==='true'&&s?.metadata?.immediate_access_requested==='true'&&s?.metadata?.legal_version===LEGAL_VERSION&&s?.metadata?.refund_policy_version===LEGAL_VERSION)return{url:s.url,id:s.id,reused:true}
    if(s?.status==='expired')await service(`purchases?id=eq.${encodeURIComponent(row.id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:'cancelled'})})
  }catch(error){console.warn('Pending checkout inspection failed',error)}}return null
}
Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});if(req.method!=='POST')return json({error:'Method not allowed'},405)
  try{
    const user=await authUser(req);if(!user?.id)return json({error:'Please sign in again before using secure checkout.'},401)
    const body=await req.json().catch(()=>({})),action=clean(body?.action,30)
    if(action==='create'){
      const tripId=clean(body?.tripId,80);if(!UUID.test(tripId))return json({error:'A secure trip is required before purchase.'},400);const trip=await assertOwner(tripId,user.id)
      if(body?.termsAccepted!==true||body?.immediateAccessRequested!==true||clean(body?.legalVersion,30)!==LEGAL_VERSION||clean(body?.refundPolicyVersion,30)!==LEGAL_VERSION)return json({error:'Please accept the current legal terms and request immediate access before checkout.'},400)
      if(await currentEntitlement(tripId))return json({ok:true,paid:true,already_active:true,tripId})
      const pending=await reusablePending(tripId,user.id);if(pending?.alreadyActive)return json({ok:true,paid:true,already_active:true,tripId,reference:pending.reference});if(pending?.url)return json({ok:true,url:pending.url,id:pending.id,reused:true})
      await ensureWebhook();const p=new URLSearchParams();p.set('mode','payment');p.set('line_items[0][price]',PRICE_ID);p.set('line_items[0][quantity]','1');p.set('success_url',`${SITE}?stripe=success&session_id={CHECKOUT_SESSION_ID}`);p.set('cancel_url',`${SITE}?stripe=cancelled`)
      p.set('metadata[product]','the-full-trip');p.set('metadata[product_key]','girls');p.set('metadata[trip_name]',clean(body?.tripName,160)||trip.name||'The Full Trip');p.set('metadata[trip_id]',tripId);p.set('metadata[purchaser_user_id]',user.id)
      const consentedAt=new Date().toISOString();p.set('metadata[terms_accepted]','true');p.set('metadata[immediate_access_requested]','true');p.set('metadata[legal_version]',LEGAL_VERSION);p.set('metadata[refund_policy_version]',LEGAL_VERSION);p.set('metadata[consented_at]',consentedAt)
      p.set('payment_intent_data[metadata][product]','the-full-trip');p.set('payment_intent_data[metadata][product_key]','girls');p.set('payment_intent_data[metadata][trip_id]',tripId);p.set('payment_intent_data[metadata][terms_accepted]','true');p.set('payment_intent_data[metadata][immediate_access_requested]','true');p.set('payment_intent_data[metadata][legal_version]',LEGAL_VERSION);p.set('payment_intent_data[metadata][consented_at]',consentedAt)
      const email=clean(body?.email,320);if(email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))p.set('customer_email',email)
      const session=await stripeRequest('checkout/sessions',p);await upsertPurchase({tripId,session,userId:user.id,status:'pending'});return json({ok:true,url:session.url,id:session.id})
    }
    if(action==='verify'){
      const sid=clean(body?.sessionId,200);if(!/^cs_/.test(sid))return json({error:'Invalid checkout session.'},400);const session=await stripeRequest(`checkout/sessions/${encodeURIComponent(sid)}`),tripId=clean(session?.metadata?.trip_id,80);if(!UUID.test(tripId))return json({error:'Checkout is not attached to a secure trip.'},400);await assertOwner(tripId,user.id);const result=await verifyAndActivate(session,user.id);if(!result.paid)return json({ok:false,paid:false},402);return json({ok:true,paid:true,persisted:result.persisted,tripId:result.tripId,reference:session.id,amount:Number(session.amount_total||2499)/100,currency:String(session.currency||'gbp').toUpperCase()})
    }
    if(action==='restore'){
      const tripId=clean(body?.tripId,80);if(!UUID.test(tripId))return json({ok:true,paid:false});await assertOwner(tripId,user.id);if(await currentEntitlement(tripId))return json({ok:true,paid:true,restored:true});const pending=await reusablePending(tripId,user.id);if(pending?.alreadyActive)return json({ok:true,paid:true,restored:true,reference:pending.reference});return json({ok:true,paid:false})
    }
    return json({error:'Unknown action'},400)
  }catch(error){console.error('girls-stripe-checkout failed',error);return json({error:error instanceof Error?error.message:'Stripe checkout failed'},500)}
})