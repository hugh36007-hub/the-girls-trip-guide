import { createClient } from 'npm:@supabase/supabase-js@2.112.4'

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function hex(bytes:ArrayBuffer){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function sha256(value:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))}
function redirect(url:string,status=303){return new Response(null,{status,headers:{Location:url,'Cache-Control':'no-store'}})}
function page(title:string,body:string,status=200){return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title><style>html,body{margin:0;min-height:100%;background:#070507;color:#ffffff;font-family:Arial,sans-serif}.wrap{min-height:100vh;display:grid;place-items:center;padding:24px}.card{width:min(560px,100%);box-sizing:border-box;background:#100a0f;border:1px solid #6b2448;border-radius:20px;padding:36px}.eyebrow{color:#ff4fa3;font-size:12px;font-weight:800;letter-spacing:3px;text-transform:uppercase}h1{font-size:44px;line-height:1;margin:16px 0}p{color:#f3e7ee;font-size:18px;line-height:1.55}.button{display:block;width:100%;border:0;border-radius:11px;background:#ff4fa3;color:#100a0f;font-size:16px;font-weight:800;padding:17px;cursor:pointer;margin-top:28px}.small{font-size:13px;color:#988a93}</style></head><body><main class="wrap"><section class="card">${body}</section></main></body></html>`,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}})}

Deno.serve(async(req)=>{
  const site='https://thegirlstripguide.com/'
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
    const {data:member,error}=await db.from('trip_members').select('id,trip_id,name,email,status,invite_token_hash,invite_token_expires_at').eq('id',memberId).maybeSingle()
    if(error)throw error
    const supplied=await sha256(token)
    if(!member||!member.invite_token_hash||supplied!==member.invite_token_hash)return redirect(new URL('/create-trip?invite=invalid',site).toString())
    if(member.invite_token_expires_at&&new Date(member.invite_token_expires_at).getTime()<Date.now())return redirect(new URL('/create-trip?invite=expired',site).toString())
    const {data:trip,error:tripError}=await db.from('trips').select('name,invite_code,product_key').eq('id',member.trip_id).single();if(!tripError&&trip?.product_key!=='girls')return redirect(new URL('/create-trip?invite=invalid',site).toString())
    if(tripError)throw tripError
    const target=new URL('/create-trip',site)
    target.searchParams.set('trip_id',member.trip_id);target.searchParams.set('action','plan');target.searchParams.set('invite','accepted')
    const {data:linkData,error:linkError}=await db.auth.admin.generateLink({type:'magiclink',email:member.email,options:{redirectTo:target.toString()}})
    if(linkError)throw linkError
    const actionLink=linkData?.properties?.action_link
    const userId=linkData?.user?.id
    if(!actionLink||!userId)throw new Error('Could not create secure access link')
    const now=new Date().toISOString()
    const {error:confirmError}=await db.from('trip_members').update({user_id:userId,status:'confirmed',opened_at:now,confirmed_at:now,invite_token_hash:null,invite_token_expires_at:null,updated_at:now}).eq('id',member.id)
    if(confirmError)throw confirmError
    await db.from('audit_events').insert({trip_id:member.trip_id,actor_id:userId,event_type:'invite_accepted',entity_type:'trip_member',entity_id:member.id})
    return redirect(actionLink)
  }catch(error){
    console.error('girls-accept-invite failed',error)
    return page('Invitation unavailable','<div class="eyebrow">Invitation unavailable</div><h1>That link did not work.</h1><p>Ask the organiser to send a fresh invitation.</p>',500)
  }
})

