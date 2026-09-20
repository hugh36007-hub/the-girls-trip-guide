(()=>{
  if(!location.hostname.endsWith('.pages.dev'))return;
  const upstream='https://vtcmvwixfqyxqghibsla.supabase.co/functions/v1/girls-auth-otp';
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init)=>{
    const url=typeof input==='string'?input:(input instanceof Request?input.url:String(input));
    if(url===upstream)return nativeFetch('/api/preview-auth-otp',init);
    return nativeFetch(input,init);
  };
})();
