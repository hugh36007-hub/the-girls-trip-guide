import { createClient } from 'npm:@supabase/supabase-js@2.112.4'

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const TOKEN_HASH=/^[0-9a-f]{64}$/i
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function hex(bytes:ArrayBuffer){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function sha256(value:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))}
function randomToken(){const b=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function redirect(url:string,status=303){return new Response(null,{status,headers:{Location:url,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}})}
function page(title:string,body:string,status=200){return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title><style>html,body{margin:0;min-height:100%;background:#070507;color:#ffffff;font-family:Arial,sans-serif}.wrap{min-height:100vh;display:grid;place-items:center;padding:24px}.card{width:min(560px,100%);box-sizing:border-box;background:#100a0f;border:1px solid #6b2448;border-radius:20px;padding:36px}.eyebrow{color:#ff4fa3;font-size:12px;font-weight:800;letter-spacing:3px;text-transform:uppercase}h1{font-size:44px;line-height:1;margin:16px 0}p{color:#f3e7ee;font-size:18px;line-height:1.55}</style></head><body><main class="wrap"><section class="card">${body}</section></main></body></html>`,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'}})}
function exactCallback(raw:string,expected:string){try{const a=new URL(raw),e=new URL(expected);return a.protocol==='https:'&&a.origin===e.origin&&a.pathname===e.pathname&&a.search===''&&a.hash===''&&a.toString()===e.toString()}catch{return false}}
function validateActionLink(actionLink:string,supabaseUrl:string,expectedCallback:string){
  try{
    const action=new URL(actionLink),service=new URL(supabaseUrl)
    if(action.protocol!=='https:'||action.origin!==service.origin||action.pathname!=='/auth/v1/verify')return false
    const effective=action.searchParams.get('redirect_to')||action.searchParams.get('redirectTo')||''
    return exactCallback(effective,expectedCallback)
  }catch{return false}
}
function extractTokenHash(linkData:any,actionLink:string){
  const generated=String(linkData?.properties?.hashed_token||'')
  if(TOKEN_HASH.test(generated))return generated
  try{
    const fromAction=new URL(actionLink).searchParams.get('token')||''
    return TOKEN_HASH.test(fromAction)?fromAction:''
  }catch{return ''}
}

Deno.serve(async(req)=>{
  const site='https://thegirlstripguide.com/'
  const product='girls'
  try{
    if(!['GET','POST'].includes(req.method))return new Response('Method not allowed',{status:405})
    const u=new URL(req.url),memberId=u.searchParams.get('member')||'',token=u.searchParams.get('token')||''
    if(!UUID.test(memberId)||!token)return redirect(new URL('/create-trip?invite=invalid',site).toString())
    if(req.method==='GET'&&u.searchParams.get('confirm')!=='1'){
      const landing=new URL('/invite.html',site);landing.searchParams.set('member',memberId);landing.searchParams.set('token',token)
      return redirect(landing.toString())
    }

    const supabaseUrl=Deno.env.get('SUPABASE_URL')||'',serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||''
    if(!supabaseUrl||!serviceKey)throw new Error('Server credentials unavailable')
    const db=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}})

    const {data:member,error}=await db.from('trip_members').select('id,trip_id,name,email,user_id,status,invite_token_hash,invite_token_expires_at').eq('id',memberId).maybeSingle()
    if(error)throw error
    const supplied=await sha256(token)
    if(!member||!member.invite_token_hash||supplied!==member.invite_token_hash)return redirect(new URL('/create-trip?invite=invalid',site).toString())
    if(!member.invite_token_expires_at||new Date(member.invite_token_expires_at).getTime()<=Date.now())return redirect(new URL('/create-trip?invite=expired',site).toString())
    if(!member.email)return redirect(new URL('/create-trip?invite=invalid',site).toString())

    const {data:trip,error:tripError}=await db.from('trips').select('id,product_key').eq('id',member.trip_id).maybeSingle()
    if(tripError)throw tripError
    if(!trip||trip.product_key!==product)return redirect(new URL('/create-trip?invite=invalid',site).toString())

    const callback='https://thegirlstripguide.com/invite-return.html'
    const {data:linkData,error:linkError}=await db.auth.admin.generateLink({type:'magiclink',email:member.email,options:{redirectTo:callback}})
    if(linkError)throw linkError
    const actionLink=linkData?.properties?.action_link||''
    const userId=linkData?.user?.id||''
    if(!actionLink||!UUID.test(userId))throw new Error('Could not create secure access link')
    if(!validateActionLink(actionLink,supabaseUrl,callback))throw new Error('Auth redirect configuration rejected the Girls callback')
    const authTokenHash=extractTokenHash(linkData,actionLink)
    if(!authTokenHash)throw new Error('Could not obtain one-time auth token')

    const state=randomToken(),stateHash=await sha256(state),expiresAt=new Date(Date.now()+10*60*1000).toISOString()
    const {error:stateError}=await db.rpc('create_invitation_auth_state',{
      p_state_hash:stateHash,
      p_member_id:member.id,
      p_trip_id:member.trip_id,
      p_product_key:product,
      p_intended_user_id:userId,
      p_callback_url:callback,
      p_expires_at:expiresAt
    })
    if(stateError)throw stateError

    const handoff=new URL('/invite-auth.html',site)
    handoff.hash=new URLSearchParams({state,token_hash:authTokenHash}).toString()
    return redirect(handoff.toString())
  }catch(error){
    console.error('girls-accept-invite failed',error instanceof Error?error.message:String(error))
    return page('Invitation unavailable','<div class="eyebrow">Invitation unavailable</div><h1>That link did not work.</h1><p>Ask the organiser to send a fresh invitation.</p>',500)
  }
})
