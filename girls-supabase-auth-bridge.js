/* Preserve the Girls isolated OTP route while allowing Supabase itself to load with defer. */
(()=>{
'use strict';
if(window.__GTG_SUPABASE_AUTH_BRIDGE__)return;window.__GTG_SUPABASE_AUTH_BRIDGE__=true;
if(!window.supabase?.createClient)return;
const originalCreateClient=window.supabase.createClient.bind(window.supabase);
window.supabase.createClient=(...args)=>{
  const client=originalCreateClient(...args);
  client.auth.signInWithOtp=async({email})=>{
    try{
      const res=await fetch('https://vtcmvwixfqyxqghibsla.supabase.co/functions/v1/girls-auth-otp',{method:'POST',body:JSON.stringify({email})});
      const out=await res.json().catch(()=>({}));
      if(!res.ok)return {data:{user:null,session:null},error:{message:out.error||'Could not send sign-in code.'}};
      return {data:{user:null,session:null},error:null};
    }catch(error){return {data:{user:null,session:null},error:{message:error?.message||'Could not send sign-in code.'}};}
  };
  return client;
};
})();
