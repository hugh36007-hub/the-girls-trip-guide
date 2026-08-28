import { createClient } from 'npm:@supabase/supabase-js@2.112.4'

const cors={
  'Access-Control-Allow-Origin':'https://thegirlstripguide.com',
  'Access-Control-Allow-Headers':'content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Cache-Control':'no-store'
}
function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}})}
function env(name:string){const v=Deno.env.get(name)||'';if(!v)throw new Error(`${name} missing`);return v}
function cleanEmail(v:unknown){return String(v||'').trim().toLowerCase()}
function validEmail(v:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.length<=254}
function esc(v:unknown){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function serviceKey(){const raw=Deno.env.get('SUPABASE_SECRET_KEYS');if(raw){try{const p=JSON.parse(raw);if(p?.default)return p.default;const x=Object.values(p||{})[0];if(typeof x==='string')return x}catch{}}return env('SUPABASE_SERVICE_ROLE_KEY')}

async function sendOtp(email:string,otp:string){
  const key=env('RESEND_API_KEY')
  const domain=Deno.env.get('GTG_EMAIL_DOMAIN')||'thegirlstripguide.com'
  const html=`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>Your Girls Trip Guide sign-in code</title></head><body style="margin:0;padding:0;background-color:#070507;color:#ffffff;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#070507" style="width:100%;background-color:#070507"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#100a0f" style="width:100%;max-width:600px;background-color:#100a0f;border:1px solid #6b2448;border-radius:18px"><tr><td align="center" style="padding:30px 28px 18px"><img src="https://thegirlstripguide.com/assets/images/girls-trip-guide-logo.webp" width="140" height="72" border="0" alt="The Girls Trip Guide" style="display:block;width:140px;height:72px;object-fit:contain"></td></tr><tr><td style="padding:20px 36px 10px;font-family:Arial,Helvetica,sans-serif"><p style="margin:0;font-size:12px;line-height:18px;letter-spacing:3px;text-transform:uppercase;color:#ff83c1;font-weight:800">SECURE SIGN-IN</p><h1 style="margin:14px 0 0;font-size:42px;line-height:46px;color:#ffffff;font-weight:800">Your sign-in code.</h1><p style="margin:20px 0 0;font-size:17px;line-height:27px;color:#eadce4">Use this code to open your private Girls Trip Guide account.</p></td></tr><tr><td align="center" style="padding:24px 36px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#070507" style="background-color:#070507;border:1px solid #6b2448;border-radius:14px"><tr><td align="center" style="padding:22px 30px;font-family:Arial,Helvetica,sans-serif;font-size:34px;line-height:40px;letter-spacing:7px;font-weight:800;color:#ff83c1">${esc(otp)}</td></tr></table></td></tr><tr><td style="padding:12px 36px 34px;font-family:Arial,Helvetica,sans-serif"><p style="margin:0;font-size:13px;line-height:21px;color:#a88d9b">If you didn’t request this code, you can ignore this email.</p></td></tr></table></td></tr></table></body></html>`
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({from:`The Girls Trip Guide <signin@${domain}>`,to:[email],subject:'Your Girls Trip Guide sign-in code',text:`Your Girls Trip Guide sign-in code is ${otp}. If you did not request this code, ignore this email.`,html})})
  const out=await r.json().catch(()=>({}));if(!r.ok)throw new Error(out?.message||`Email provider error ${r.status}`)
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
  if(req.method!=='POST')return json({error:'Method not allowed'},405)
  try{
    const origin=req.headers.get('origin')||''
    if(origin && origin!=='https://thegirlstripguide.com')return json({error:'Origin not allowed'},403)
    const body=await req.json().catch(()=>({})),email=cleanEmail(body?.email)
    if(!validEmail(email))return json({error:'Enter a valid email address.'},400)
    const db=createClient(env('SUPABASE_URL'),serviceKey(),{auth:{persistSession:false,autoRefreshToken:false}})
    let result=await db.auth.admin.generateLink({type:'signup',email,password:crypto.randomUUID()})
    if(result.error)result=await db.auth.admin.generateLink({type:'magiclink',email})
    if(result.error)throw result.error
    const otp=(result.data as any)?.properties?.email_otp
    if(!otp)throw new Error('Could not generate a sign-in code.')
    await sendOtp(email,String(otp))
    return json({ok:true})
  }catch(error){
    console.error('girls-auth-otp failed',error)
    return json({error:'Could not send the sign-in code. Please try again.'},500)
  }
})