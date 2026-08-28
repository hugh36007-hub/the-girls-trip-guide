import { createClient } from 'npm:@supabase/supabase-js@2.112.4'

function env(n:string){const v=Deno.env.get(n)||'';if(!v)throw new Error(`${n} missing`);return v}
function esc(v:any){return String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'} as any)[c]||c)}
const PEOPLE:any={
  grace:{name:'Grace',mailbox:'grace',asset:'grace.webp'},
  ava:{name:'Ava',mailbox:'ava',asset:'ava.webp'},
  lola:{name:'Lola',mailbox:'lola',asset:'lola.webp'},
  seb:{name:'Seb',mailbox:'seb',asset:'seb.webp'},
  system:{name:'The Girls Trip Guide',mailbox:'trips',asset:'girls-trip-guide-logo.webp'}
}
function render(x:any){
  const p=PEOPLE[x.character]||PEOPLE.grace
  const isSystem=x.character==='system'
  const portrait=`https://thegirlstripguide.com/assets/images/${p.asset}`
  const label=esc(p.name.toUpperCase()), title=esc(x.title), message=esc(x.message), tripName=esc(x.tripName), cta=esc(x.cta), url=esc(x.url)
  const preheader=esc(x.preheader||`${p.name} · ${x.title}`)
  const media=isSystem
    ? `<img class="gmail-logo gmail-portrait" src="${portrait}" width="140" height="140" border="0" alt="The Girls Trip Guide" style="display:block;width:140px;height:140px;object-fit:contain;margin:0 auto">`
    : `<img class="gmail-portrait" src="${portrait}" width="280" border="0" alt="${esc(p.name)}" style="display:block;width:280px;max-width:72%;height:auto;margin:0 auto">`
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>${title}</title><style>
u + .email-body .gmail-shell{background-color:#070507!important;}
u + .email-body .gmail-card{background-color:#100a0f!important;border-color:#6b2448!important;}
u + .email-body .gmail-copy{background-color:#100a0f!important;}
u + .email-body .gmail-trip{background-color:#171017!important;}
u + .email-body .gmail-label{color:#ff4fa3!important;}
u + .email-body .gmail-title{color:#ffffff!important;}
u + .email-body .gmail-message{color:#f3e7ee!important;}
u + .email-body .gmail-trip-label{color:#c7a6b7!important;}
u + .email-body .gmail-trip-name{color:#ff83c1!important;}
u + .email-body .gmail-cta{background-color:#ff4fa3!important;}
u + .email-body .gmail-cta-link{color:#13070d!important;}
u + .email-body .gmail-header{background-color:#0b070a!important;}
u + .email-body .gmail-portrait{width:210px!important;max-width:60%!important;height:auto!important;}
u + .email-body .gmail-logo{width:92px!important;height:92px!important;max-width:92px!important;}
</style></head><body class="email-body" style="margin:0;padding:0;background-color:#f4eef2;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4eef2" class="gmail-shell" style="width:100%;background-color:#f4eef2"><tr><td align="center" bgcolor="#f4eef2" class="gmail-shell" style="padding-top:20px;padding-right:10px;padding-bottom:20px;padding-left:10px;background-color:#f4eef2"><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#fffafd" class="gmail-card" style="width:100%;max-width:600px;background-color:#fffafd;border:1px solid #efb2d1;border-radius:18px"><tr><td bgcolor="#0b070a" class="gmail-header" style="padding-top:20px;padding-right:24px;padding-bottom:12px;padding-left:24px;background-color:#0b070a;border-top-left-radius:17px;border-top-right-radius:17px"><img class="gmail-logo" src="https://thegirlstripguide.com/assets/images/girls-trip-guide-logo.webp" width="110" height="110" border="0" alt="The Girls Trip Guide" style="display:block;width:110px;height:110px;object-fit:contain"></td></tr><tr><td align="center" bgcolor="#0b070a" class="gmail-header" style="padding-top:0;padding-right:24px;padding-bottom:10px;padding-left:24px;background-color:#0b070a">${media}</td></tr><tr><td bgcolor="#fffafd" class="gmail-copy" style="padding-top:32px;padding-right:34px;padding-bottom:34px;padding-left:34px;background-color:#fffafd;font-family:Arial,Helvetica,sans-serif"><p class="gmail-label" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:3px;color:#d62f82;font-weight:800;text-transform:uppercase">${label}</p><h1 class="gmail-title" style="margin-top:14px;margin-right:0;margin-bottom:20px;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:42px;line-height:46px;color:#171217;font-weight:800">${title}</h1><p class="gmail-message" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:29px;color:#50464d">${message}</p></td></tr><tr><td align="center" bgcolor="#f8edf4" class="gmail-trip" style="padding-top:28px;padding-right:28px;padding-bottom:36px;padding-left:28px;background-color:#f8edf4;font-family:Arial,Helvetica,sans-serif;border-bottom-left-radius:17px;border-bottom-right-radius:17px"><p class="gmail-trip-label" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:3px;text-transform:uppercase;color:#8d697c">THE TRIP</p><h2 class="gmail-trip-name" style="margin-top:10px;margin-right:0;margin-bottom:22px;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:31px;line-height:38px;color:#c72d78;font-weight:800">${tripName}</h2><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#ff4fa3" class="gmail-cta" style="border-radius:10px;background-color:#ff4fa3"><a class="gmail-cta-link" href="${url}" style="display:inline-block;padding-top:16px;padding-right:26px;padding-bottom:16px;padding-left:26px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:22px;font-weight:800;color:#160b11;text-decoration:none">${cta} →</a></td></tr></table></td></tr></table></td></tr></table></body></html>`
}
Deno.serve(async req=>{
  if(req.method!=='POST')return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:{'Content-Type':'application/json'}})
  const supplied=req.headers.get('x-btg-cron-secret')||''
  const db=createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}})
  let ok=Boolean((Deno.env.get('BTG_CRON_SECRET')||'')&&supplied===(Deno.env.get('BTG_CRON_SECRET')||''))
  if(!ok&&supplied){const {data}=await db.rpc('verify_communications_cron_secret',{p_secret:supplied});ok=data===true}
  if(!ok)return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:{'Content-Type':'application/json'}})
  try{
    const x=await req.json(); const to=String(x.to||'').trim().toLowerCase()
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to))throw new Error('Invalid recipient')
    const p=PEOPLE[x.character]||PEOPLE.grace
    const {data:key,error:keyError}=await db.rpc('girls_resend_api_key'); if(keyError||!key)throw new Error('Girls email key unavailable')
    const html=render(x), text=`${p.name}: ${x.title}\n\n${x.message}\n\n${x.tripName}\n${x.url}`
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${String(key)}`,...(x.idempotencyKey?{'Idempotency-Key':String(x.idempotencyKey)}:{})},body:JSON.stringify({from:`${p.name} <${p.mailbox}@thegirlstripguide.com>`,to:[to],subject:String(x.subject||`${x.title} · ${x.tripName}`),text,html})})
    const out=await r.json().catch(()=>({})); if(!r.ok)throw new Error(out?.message||`Resend ${r.status}`)
    return new Response(JSON.stringify({ok:true,id:out.id}),{headers:{'Content-Type':'application/json'}})
  }catch(e){console.error('girls-email-send failed',e);return new Response(JSON.stringify({ok:false,error:e instanceof Error?e.message:String(e)}),{status:500,headers:{'Content-Type':'application/json'}})}
})