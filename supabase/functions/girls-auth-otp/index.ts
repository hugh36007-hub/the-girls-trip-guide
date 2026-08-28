import { createClient } from 'npm:@supabase/supabase-js@2.112.4'

const cors={
  'Access-Control-Allow-Origin':'https://thegirlstripguide.com',
  'Access-Control-Allow-Headers':'content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Cache-Control':'no-store'
}
function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}})}
function env(name:string){const v=Deno.env.get(name)||'';if(!v)throw new Error(`${name} missing`);return v}
function cleanEmail(v:unknown){return String(v||'').trim().toLowerCase()}
function validEmail(v:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.length<=254}
function esc(v:unknown){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}

async function sendOtp(apiKey:string,email:string,otp:string){
  const html=`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>Your Girls Trip Guide sign-in code</title></head><body style="margin:0;padding:0;background-color:#070507;color:#ffffff;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#070507" style="width:100%;background-color:#070507"><tr><td align="center" style="padding-top:24px;padding-right:12px;padding-bottom:24px;padding-left:12px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#100a0f" style="width:100%;max-width:600px;background-color:#100a0f;border:1px solid #6b2448;border-radius:18px"><tr><td align="center" style="padding-top:30px;padding-right:28px;padding-bottom:18px;padding-left:28px"><img src="https://thegirlstripguide.com/assets/images/girls-trip-guide-logo.webp" width="140" height="72" border="0" alt="The Girls Trip Guide" style="display:block;width:140px;height:72px;object-fit:contain"></td></tr><tr><td style="padding-top:20px;padding-right:36px;padding-bottom:10px;padding-left:36px;font-family:Arial,Helvetica,sans-serif"><p style="margin:0;font-size:12px;line-height:18px;letter-spacing:3px;text-transform:uppercase;color:#ff83c1;font-weight:800">SECURE SIGN-IN</p><h1 style="margin-top:14px;margin-right:0;margin-bottom:0;margin-left:0;font-size:42px;line-height:46px;color:#ffffff;font-weight:800">Your sign-in code.</h1><p style="margin-top:20px;margin-right:0;margin-bottom:0;margin-left:0;font-size:17px;line-height:27px;color:#eadce4">Use this code to open your private Girls Trip Guide account.</p></td></tr><tr><td align="center" style="padding-top:24px;padding-right:36px;padding-bottom:24px;padding-left:36px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#070507" style="background-color:#070507;border:1px solid #6b2448;border-radius:14px"><tr><td align="center" style="padding-top:22px;padding-right:30px;padding-bottom:22px;padding-left:30px;font-family:Arial,Helvetica,sans-serif;font-size:34px;line-height:40px;letter-spacing:7px;font-weight:800;color:#ff83c1">${esc(otp)}</td></tr></table></td></tr><tr><td style="padding-top:12px;padding-right:36px;padding-bottom:34px;padding-left:36px;font-family:Arial,Helvetica,sans-serif"><p style="margin:0;font-size:13px;line-height:21px;color:#a88d9b">If you didn’t request this code, you can ignore this email.</p></td></tr></table></td></tr></table></body></html>`
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},body:JSON.stringify({from:'The Girls Trip Guide <signin@thegirlstripguide.com>',to:[email],subject:'Your Girls Trip Guide sign-in code',text:`Your Girls Trip Guide sign-in code is ${otp}. If you did not request this code, ignore this email.`,html})})
  const out=await r.json().catch(()=>({}))
  if(!r.ok)throw new Error(`resend_${r.status}:${out?.message||'send failed'}`)
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
  if(req.method!=='POST')return json({error:'Method not allowed'},405)
  try{
    const origin=req.headers.get('origin')||''
    if(origin && origin!=='https://thegirlstripguide.com')return json({error:'Origin not allowed'},403)
    const body=await req.json().catch(()=>({}))
    const email=cleanEmail(body?.email)
    if(!validEmail(email))return json({error:'Enter a valid email address.'},400)

    const db=createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}})
    const rate=await db.rpc('girls_auth_otp_rate_check',{p_email:email})
    if(rate.error)throw new Error(`rate:${rate.error.message}`)
    if(rate.data!==true)return json({error:'Please wait before requesting another code.'},429)

    const {data,error}=await db.auth.admin.generateLink({type:'magiclink',email})
    if(error)throw new Error(`generate:${error.message}`)
    const props:any=(data as any)?.properties||{}
    const otp=props.email_otp
    const verificationType=props.verification_type||'magiclink'
    if(!otp)throw new Error('generate:no_otp')

    const keyResult=await db.rpc('girls_resend_api_key')
    if(keyResult.error||!keyResult.data)throw new Error(`key:${keyResult.error?.message||'missing'}`)
    await sendOtp(String(keyResult.data),email,String(otp))
    return json({ok:true,verificationType})
  }catch(error){
    console.error('girls-auth-otp failed',error instanceof Error?error.message:String(error))
    return json({error:'Could not send the sign-in code. Please try again.'},500)
  }
})