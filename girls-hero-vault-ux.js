(() => {
'use strict';

const SUPABASE_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const SUPABASE_KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null;
const db=()=>client||(client=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const toast=msg=>{const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800)};

async function state(){
 const id=tripId(),q=db();if(!id||!q)return null;
 const [{data:{user}},{data:trip},{data:entitlements}]=await Promise.all([
  q.auth.getUser(),
  q.from('trips').select('id,owner_id,product_key,plan,hero_storage_path').eq('id',id).eq('product_key','girls').maybeSingle(),
  q.from('trip_entitlements').select('entitlement,active').eq('trip_id',id).eq('active',true)
 ]);
 if(!user||!trip)return null;
 const paid=trip.plan==='full'||(entitlements||[]).some(x=>x.active!==false&&['full_trip','evidence','vault','full_comms'].includes(x.entitlement));
 return {q,user,trip,paid,owner:trip.owner_id===user.id};
}

function enhanceHeroControls(s){
 if(!s?.owner||!s.paid)return;
 const hero=document.querySelector('.hero-card');
 if(hero&&!hero.dataset.heroUx){
  hero.dataset.heroUx='1';
  hero.classList.add('gtg-editable-hero');
  hero.setAttribute('role','button');
  hero.setAttribute('tabindex','0');
  hero.setAttribute('aria-label','Change trip hero');
  hero.insertAdjacentHTML('beforeend','<button type="button" class="gtg-change-hero" data-a="tripAppearance">Change trip hero</button>');
 }
 document.querySelectorAll('[data-a="setMediaHero"]').forEach(btn=>{
  btn.textContent='Set as trip hero';
  btn.classList.add('gtg-set-hero');
 });
}

function hardenVaultButton(s){
 document.querySelectorAll('[data-a="vault"]').forEach(btn=>{
  btn.textContent='Open Hidden Gallery';
  btn.setAttribute('aria-label','Open PIN-protected Hidden Gallery');
 });
 if(!s?.paid)return;
 const panel=document.querySelector('[data-panel="evidence"]');
 if(panel&&!panel.querySelector('[data-vault-privacy-note]')){
  const gallery=panel.querySelector('.gallery');
  if(gallery){
   const note=document.createElement('div');
   note.dataset.vaultPrivacyNote='1';
   note.className='gtg-vault-privacy-note';
   note.innerHTML='<b>Hidden Gallery is separate from Evidence.</b><span>Nothing stored there is shown on this page. A valid trip PIN is required before hidden media can be listed or opened.</span>';
   gallery.insertAdjacentElement('beforebegin',note);
  }
 }
}

async function serverVaultUnlocked(q,id){
 const {data,error}=await q.rpc('has_active_vault_session',{target_trip_id:id});
 if(error)throw error;
 return data===true;
}

function interceptVaultRender(){
 document.addEventListener('click',async e=>{
  const hero=e.target.closest('.hero-card');
  if(hero&&hero.classList.contains('gtg-editable-hero')&&!e.target.closest('button,a,input,select,textarea')){
   const btn=hero.querySelector('[data-a="tripAppearance"]');
   if(btn)btn.click();
  }
 },true);

 document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target?.classList?.contains('gtg-editable-hero')){
   e.preventDefault();e.target.querySelector('[data-a="tripAppearance"]')?.click();
  }
 },true);

 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a="setMediaHero"]');
  if(!b)return;
  setTimeout(async()=>{
   try{
    const s=await state();
    if(!s)return;
    const {data}=await s.q.from('trips').select('hero_storage_path').eq('id',s.trip.id).eq('product_key','girls').single();
    if(data?.hero_storage_path){toast('Trip hero updated. Open Overview to see it.');b.textContent='Current trip hero'}
   }catch{}
  },500);
 },true);

 document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-a="vaultUpload"],[data-a="deleteVaultMedia"]');
  if(!b)return;
  try{
   const s=await state();if(!s)return;
   if(!(await serverVaultUnlocked(s.q,s.trip.id))){
    e.preventDefault();e.stopImmediatePropagation();toast('Hidden Gallery is locked. Enter the PIN first.');
   }
  }catch(err){
   e.preventDefault();e.stopImmediatePropagation();toast('Hidden Gallery could not verify the secure session.');
  }
 },true);
}

async function enhance(){try{const s=await state();enhanceHeroControls(s);hardenVaultButton(s)}catch{}}

interceptVaultRender();
const observer=new MutationObserver(()=>{clearTimeout(window.__gtgHeroVaultTimer);window.__gtgHeroVaultTimer=setTimeout(enhance,40)});
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('popstate',()=>setTimeout(enhance,80));
setTimeout(enhance,150);
})();
