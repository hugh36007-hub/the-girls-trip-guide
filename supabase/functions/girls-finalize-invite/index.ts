import { createClient } from 'npm:@supabase/supabase-js@2.112.4'

const PRODUCT='girls'
const CALLBACK='https://thegirlstripguide.com/invite-return.html'
const SITE_ORIGIN='https://thegirlstripguide.com'
const ALLOWED_ORIGINS=new Set([SITE_ORIGIN,'https://localhost','capacitor://localhost'])
const STATE=/^[A-Za-z0-9_-]{43}$/
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function env(name:string){const value=Deno.env.get(name)||'';if(!value)throw new Error(`${name} missing`);return value}
function hex(bytes:ArrayBuffer){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function sha256(value:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))}
function headers(origin:string){const allowed=ALLOWED_ORIGINS.has(origin)?origin:SITE_ORIGIN;return {'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','Vary':'Origin'}}
function json(body:unknown,status=200,origin=''){return new Response(JSON.stringify(body),{status,headers:{...headers(origin),'Content-Type':'application/json'}})}

Deno.serve(async req=>{
  const origin=req.headers.get('origin')||''
  if(origin&&!ALLOWED_ORIGINS.has(origin))return json({error:'Origin not allowed'},403,origin)
  if(req.method==='OPTIONS')return new Response('ok',{headers:headers(origin)})
  if(req.method!=='POST')return json({error:'Method not allowed'},405,origin)
  try{
    const auth=req.headers.get('Authorization')||''
    if(!auth.startsWith('Bearer '))return json({error:'Sign-in required'},401,origin)
    const state=String((await req.json().catch(()=>({})))?.state||'')
    if(!STATE.test(state))return json({error:'Invitation state is invalid.'},400,origin)

    const supabaseUrl=env('SUPABASE_URL')
    const pub=Deno.env.get('SUPABASE_PUBLISHABLE_KEY')||env('SUPABASE_ANON_KEY')
    const userDb=createClient(supabaseUrl,pub,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}})
    const {data:{user},error:userError}=await userDb.auth.getUser()
    if(userError||!user)return json({error:'Sign-in required'},401,origin)

    const db=createClient(supabaseUrl,env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}})
    const {data,error}=await db.rpc('finalize_trip_invitation',{
      p_state_hash:await sha256(state),
      p_user_id:user.id,
      p_expected_product:PRODUCT,
      p_callback_url:CALLBACK
    })
    if(error){console.warn('girls-finalize-invite rejected',error.message);return json({error:'This invitation could not be verified. Ask the organiser for a fresh link.'},403,origin)}
    const result:any=data||{}
    if(result.product_key!==PRODUCT||!UUID.test(String(result.trip_id||'')))return json({error:'Invitation result was invalid.'},403,origin)
    return json({ok:true,tripId:result.trip_id,productKey:result.product_key,purpose:result.purpose||'invite'},200,origin)
  }catch(error){
    console.error('girls-finalize-invite failed',error instanceof Error?error.message:String(error))
    return json({error:'This invitation could not be completed.'},500,origin)
  }
})
