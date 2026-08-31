import { createClient } from 'npm:@supabase/supabase-js@2.112.4'

const cors={
  'Access-Control-Allow-Origin':'https://thegirlstripguide.com',
  'Access-Control-Allow-Headers':'content-type, apikey',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Cache-Control':'no-store'
}
function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}})}
function clean(v:unknown,max=5000){return String(v??'').trim().slice(0,max)}
function email(v:unknown){return clean(v,320).toLowerCase()}
function esc(v:unknown){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function env(name:string){return Deno.env.get(name)||''}
async function sha256(value:string){const data=new TextEncoder().encode(value);const digest=await crypto.subtle.digest('SHA-256',data);return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('')}
function decodeBase64(value:string){try{const raw=atob(value);const out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}catch{return null}}
function starts(bytes:Uint8Array,signature:number[]){return signature.every((v,i)=>bytes[i]===v)}
function validMagic(type:string,bytes:Uint8Array){
  if(type==='image/jpeg')return starts(bytes,[0xff,0xd8,0xff])
  if(type==='image/png')return starts(bytes,[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])
  if(type==='image/webp')return bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'
  if(type==='application/pdf')return bytes.length>=5&&String.fromCharCode(...bytes.slice(0,5))==='%PDF-'
  if(type==='application/msword')return starts(bytes,[0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1])
  if(type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document')return starts(bytes,[0x50,0x4b,0x03,0x04])||starts(bytes,[0x50,0x4b,0x05,0x06])||starts(bytes,[0x50,0x4b,0x07,0x08])
  return false
}
function validExtension(filename:string,type:string){const ext=(filename.split('.').pop()||'').toLowerCase();const allowed:Record<string,string[]>={
  'image/jpeg':['jpg','jpeg'],'image/png':['png'],'image/webp':['webp'],'application/pdf':['pdf'],'application/msword':['doc'],'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['docx']
};return (allowed[type]||[]).includes(ext)}

const allowedTypes=new Set(['image/jpeg','image/png','image/webp','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
const maxBytes=10*1024*1024

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
  if(req.method!=='POST')return json({error:'Method not allowed'},405)
  try{
    const origin=req.headers.get('origin')||''
    if(origin&&origin!=='https://thegirlstripguide.com')return json({error:'Origin not allowed'},403)
    const body=await req.json().catch(()=>({}))
    if(clean(body?.website,200))return json({ok:true})

    const name=clean(body?.name,120)
    const sender=email(body?.email)
    const tripName=clean(body?.tripName,160)
    const category=clean(body?.category,40)||'general'
    const message=clean(body?.message,5000)
    if(name.length<2)return json({error:'Please enter your name.'},400)
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender))return json({error:'Please enter a valid email address.'},400)
    if(message.length<10)return json({error:'Please add a little more detail.'},400)

    let attachment:null|{filename:string;content:string;type:string}=null
    if(body?.attachment){
      const filename=clean(body.attachment.filename,180).replace(/[\\/]/g,'_')
      const type=clean(body.attachment.type,120)
      const content=clean(body.attachment.content,15_000_000)
      if(!filename||!content)return json({error:'The attachment could not be read.'},400)
      if(!allowedTypes.has(type)||!validExtension(filename,type))return json({error:'Please attach a genuine JPG, PNG, WebP, PDF, DOC or DOCX file.'},400)
      const bytes=decodeBase64(content)
      if(!bytes)return json({error:'The attachment could not be read.'},400)
      if(bytes.length>maxBytes)return json({error:'Attachment is too large. Maximum file size is 10 MB.'},400)
      if(!validMagic(type,bytes))return json({error:'The attachment does not match its file type.'},400)
      attachment={filename,content,type}
    }

    const url=env('SUPABASE_URL'),service=env('SUPABASE_SERVICE_ROLE_KEY')
    if(!url||!service)throw new Error('Supabase server credentials are unavailable.')
    const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}})
    const forwarded=req.headers.get('x-forwarded-for')||req.headers.get('cf-connecting-ip')||'unknown'
    const ipHash=await sha256(forwarded.split(',')[0].trim())
    const windowStart=new Date(Date.now()-15*60*1000).toISOString()
    const {count,error:rateError}=await db.from('contact_enquiries').select('id',{count:'exact',head:true}).eq('ip_hash',ipHash).gte('created_at',windowStart)
    if(rateError)throw rateError
    if((count||0)>=5)return json({error:'Too many messages from this connection. Please try again later.'},429)

    const storedMessage=attachment?`${message}\n\nAttachment supplied: ${attachment.filename}`:message
    const {data:record,error:insertError}=await db.from('contact_enquiries').insert({name,email:sender,trip_name:tripName||null,category:`girls:${category}`,message:storedMessage,ip_hash:ipHash}).select('id').single()
    if(insertError)throw insertError

    let providerId:string|null=null,deliveryError:string|null=null
    try{
      const {data:apiKey,error:keyError}=await db.rpc('girls_resend_api_key')
      if(keyError||!apiKey)throw new Error('Girls email key unavailable.')
      const to=env('GTG_CONTACT_TO')||'hello@thegirlstripguide.com'
      const subjectTrip=tripName?` · ${tripName}`:''
      const attachmentLine=attachment?`<p style="margin:14px 0 0;color:#ff83c1">Attachment: ${esc(attachment.filename)}</p>`:''
      const html=`<!doctype html><html><body style="margin:0;background:#070507;color:#fff;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#070507;padding:24px"><tr><td align="center"><table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#100a0f;border:1px solid #6b2448;border-radius:16px"><tr><td style="padding:28px"><div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ff83c1;font-weight:800">The Girls Trip Guide · Neville Support</div><h1 style="margin:12px 0 18px;font-size:34px;color:#fff">New enquiry</h1><p style="margin:0 0 8px;color:#ff83c1"><strong>${esc(name)}</strong> · ${esc(sender)}</p>${tripName?`<p style="margin:0 0 8px;color:#e9dce4">Trip: ${esc(tripName)}</p>`:''}<p style="margin:0 0 18px;color:#a88d9b;text-transform:uppercase;font-size:12px;letter-spacing:1px">${esc(category)}</p><div style="height:1px;background:#3d2030;margin:18px 0"></div><p style="white-space:pre-wrap;margin:0;color:#fff;font-size:16px;line-height:24px">${esc(message)}</p>${attachmentLine}</td></tr></table></td></tr></table></body></html>`
      const payload:any={from:'The Girls Trip Guide <contact@thegirlstripguide.com>',to:[to],reply_to:sender,subject:`Girls Trip Guide support${subjectTrip}`,html}
      if(attachment)payload.attachments=[{filename:attachment.filename,content:attachment.content}]
      const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${String(apiKey)}`},body:JSON.stringify(payload)})
      const out=await res.json().catch(()=>({}))
      if(!res.ok)throw new Error(out?.message||`Email provider error ${res.status}`)
      providerId=out?.id||null
    }catch(e){deliveryError=e instanceof Error?e.message:'Delivery failed'}

    await db.from('contact_enquiries').update({provider_message_id:providerId,delivery_error:deliveryError,status:providerId?'emailed':'stored'}).eq('id',record.id)
    return json({ok:true,id:record.id,delivery:providerId?'emailed':'stored'})
  }catch(error){console.error('girls-contact-email failed',error);return json({error:error instanceof Error?error.message:'Contact request failed'},500)}
})
