const UPSTREAM='https://vtcmvwixfqyxqghibsla.supabase.co/functions/v1/girls-auth-otp';
export async function onRequestPost({request}){
  const url=new URL(request.url);
  if(!url.hostname.endsWith('.pages.dev'))return new Response(JSON.stringify({error:'Preview route unavailable.'}),{status:404,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  const body=await request.text();
  const upstream=await fetch(UPSTREAM,{method:'POST',headers:{'Content-Type':'application/json'},body});
  const text=await upstream.text();
  return new Response(text,{status:upstream.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}
export async function onRequest(){return new Response(JSON.stringify({error:'Method not allowed.'}),{status:405,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Allow':'POST'}})}
