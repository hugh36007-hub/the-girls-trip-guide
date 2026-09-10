import { createClient } from 'npm:@supabase/supabase-js@2.112.4'

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function hex(bytes:ArrayBuffer){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function sha256(value:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))}
function randomToken(){const b=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function redirect(url:string,status=303){return new Response(null,{status,headers:{Location:url,'Cache-Control':'no-store, no-cache, must-revalidate','Pragma':'no-cache','Expires':'0','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Length':'0'}})}
function exactCallback(raw:string,expected:string){try{const a=new URL(raw),e=new URL(expected);return a.protocol==='https:'&&a.origin===e.origin&&a.pathname===e.pathname&&a.search===''&&a.hash===''&&a.toString()===e.toString()}catch{return false}}
function validateActionLink(actionLink:string,supabaseUrl:string,expectedCallback:string){
  try{
    const action=new URL(actionLink),service=new URL(supabaseUrl)
    if(action.protocol!=='https:'||action.origin!==service.origin||action.pathname!=='/auth/v1/verify')return false
    const effective=action.searchParams.get('redirect_to')||action.searchParams.get('redirectTo')||''
    return exactCallback(effective,expectedCallback)
  }catch{return false}
}
function validAuthToken(value:unknown){const token=String(value||'');return token.length>=16&&token.length<=2048&&!/[\u0000-\u001f\u007f\s]/.test(token)}
function extractTokenHash(linkData:any,actionLink:string){
  try{
    const fromAction=new URL(actionLink).searchParams.get('token')||''
    if(validAuthToken(fromAction))return fromAction
  }catch{}
  const generated=String(linkData?.properties?.hashed_token||'')
  return validAuthToken(generated)?generated:''
}

Deno.serve(async(req)=>{
  const site='https://thegirlstripguide.com/'
  const product='girls'
  try{
    if(!['GET','POST'].includes(req.method))return redirect(new URL('/create-trip?invite=invalid',site).toString())
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
    return redirect(new URL('/create-trip?invite=server',site).toString())
  }
})
