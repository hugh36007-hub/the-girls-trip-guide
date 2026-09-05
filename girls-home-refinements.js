/* Girls Home parity: photo focus, 4-second Hidden Gallery hold, sender avatars and own profile-photo editing. */
(()=>{
'use strict';
if(window.__GTG_HOME_REFINEMENTS__)return;window.__GTG_HOME_REFINEMENTS__=true;
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const PHOTO_HOLD_MS=4000,AVATAR_HOLD_MS=3000;
let client=null,photoHold=null,avatarHold=null,suppressPhotoClickUntil=0,suppressAvatarClickUntil=0,syncTimer=0;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
const initials=name=>String(name||'').trim().split(/\s+/).filter(Boolean).map(x=>x[0]||'').join('').slice(0,2).toUpperCase()||'?';
const toast=msg=>{const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000)};

function installStyles(){
 if(document.getElementById('gtg-home-refinements-css'))return;
 const s=document.createElement('style');s.id='gtg-home-refinements-css';s.textContent=`
.dashboard .hero-card.live-snapshot-hero .live-photo-block,.dashboard .hero-card.live-snapshot-hero .live-photo-block *{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
.dashboard .hero-card.live-snapshot-hero .live-photo-block{touch-action:manipulation}
.dashboard .hero-card.live-snapshot-hero .live-photo-open img{transform:none!important;-webkit-user-drag:none!important}
.dashboard .hero-card.live-snapshot-hero .live-message-avatar{overflow:hidden;position:relative;display:grid!important;place-items:center!important;text-align:center!important;line-height:1!important;padding:0!important;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:manipulation!important}
.dashboard .hero-card.live-snapshot-hero .live-message-avatar img{display:block;width:100%;height:100%;object-fit:cover;border-radius:50%}
.dashboard .hero-card.live-snapshot-hero.gtg-photo-focused{grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr)!important}
.dashboard .hero-card.live-snapshot-hero.gtg-photo-focused .live-message-card{opacity:.72;display:flex!important;flex-direction:column;align-items:center;justify-content:flex-start}
.dashboard .hero-card.live-snapshot-hero.gtg-photo-focused .live-message-card>p,.dashboard .hero-card.live-snapshot-hero.gtg-photo-focused .live-message-meta b,.dashboard .hero-card.live-snapshot-hero.gtg-photo-focused .live-message-meta time{display:none!important}
.dashboard .hero-card.live-snapshot-hero.gtg-photo-focused .live-message-meta{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;margin:0!important}
.dashboard .hero-card.live-snapshot-hero.gtg-photo-focused .live-message-avatar{margin:10px auto 0!important}
.gtg-avatar-editor-overlay{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.82);backdrop-filter:blur(10px)}
.gtg-avatar-editor-card{width:min(520px,100%);max-height:92dvh;overflow:auto;border:1px solid rgba(255,131,193,.42);border-radius:22px;background:#0d090d;color:#fff;padding:22px;text-align:center;box-shadow:0 28px 80px rgba(0,0,0,.56)}
.gtg-avatar-editor-card .eyebrow{color:#ff83c1;font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.gtg-avatar-editor-card h2{margin:7px 0 8px;font:900 34px/1 'Barlow Condensed',Inter,sans-serif;text-transform:uppercase}.gtg-avatar-editor-card p{margin:0 0 16px;color:rgba(255,255,255,.66);font-size:12px;line-height:1.45}
.gtg-avatar-crop-stage{position:relative;width:min(74vw,330px);aspect-ratio:1;margin:0 auto 16px;overflow:hidden;border-radius:50%;background:#070507;border:1px solid rgba(255,131,193,.58);touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;box-shadow:0 14px 38px rgba(0,0,0,.36),inset 0 0 0 1px rgba(255,255,255,.025)}
.gtg-avatar-crop-stage img{position:absolute;left:50%;top:50%;max-width:none!important;max-height:none!important;transform-origin:center;pointer-events:none;-webkit-user-drag:none}.gtg-avatar-crop-stage:after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,131,193,.36);pointer-events:none}
.gtg-avatar-tools,.gtg-avatar-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}.gtg-avatar-tools{margin:0 0 14px}.gtg-avatar-tools button,.gtg-avatar-actions button{min-height:42px;padding:9px 13px;border:1px solid rgba(255,131,193,.3);border-radius:11px;background:#151015;color:#fff;font-weight:800}.gtg-avatar-actions .primary{background:#ff4fa3;color:#170810;border-color:#ff4fa3}.gtg-avatar-actions button:disabled{opacity:.5}
@media(max-width:700px){.dashboard .hero-card.live-snapshot-hero.gtg-photo-focused{grid-template-columns:minmax(0,.60fr) minmax(0,1.70fr)!important}}
`;document.head.appendChild(s);
}
function hero(){return document.querySelector('.dashboard .hero-card.live-snapshot-hero')}
function focusMessage(h){if(!h)return;h.classList.remove('gtg-photo-focused');h.dataset.gtgHomeFocus='message'}
function focusPhoto(h){if(!h)return;h.classList.add('gtg-photo-focused');h.dataset.gtgHomeFocus='photo'}
function openEvidence(){const b=document.querySelector('.dock [data-tab="evidence"],.stat-row [data-tab="evidence"]');if(b){b.click();return}const u=new URL(location.href);u.searchParams.set('action','evidence');location.href=u.toString()}
function openHidden(){const b=document.createElement('button');b.type='button';b.hidden=true;b.dataset.a='vault';document.body.appendChild(b);b.click();b.remove()}
function cancelPhotoHold(){if(photoHold?.timer)clearTimeout(photoHold.timer);photoHold=null}
function cancelAvatarHold(){if(avatarHold?.timer)clearTimeout(avatarHold.timer);avatarHold=null}
function triggerPhotoHold(target){if(!target?.isConnected)return;suppressPhotoClickUntil=Date.now()+1500;focusPhoto(target.closest('.live-snapshot-hero'));navigator.vibrate?.(28);openHidden();cancelPhotoHold()}

async function senderMember(card){
 const q=db(),tid=tripId(),id=card?.dataset.chatMessageId;if(!q||!tid||!id)return null;
 const {data:msg,error}=await q.from('trip_chat_messages').select('sender_user_id,sender_member_id').eq('trip_id',tid).eq('id',id).maybeSingle();if(error||!msg)return null;
 let member=null;
 if(msg.sender_member_id){const r=await q.from('trip_members').select('id,user_id,name,avatar_path').eq('trip_id',tid).eq('id',msg.sender_member_id).maybeSingle();if(!r.error)member=r.data}
 if(!member&&msg.sender_user_id){const r=await q.from('trip_members').select('id,user_id,name,avatar_path').eq('trip_id',tid).eq('user_id',msg.sender_user_id).maybeSingle();if(!r.error)member=r.data}
 return member?{...member,user_id:member.user_id||msg.sender_user_id||''}:null;
}
async function syncAvatar(){
 const h=hero(),card=h?.querySelector('.live-message-card'),avatar=card?.querySelector('.live-message-avatar');if(!card||!avatar)return;
 const name=card.querySelector('.live-message-meta b')?.textContent?.trim()||'';
 if(!card.dataset.chatMessageId||!name||name==='Trip'){avatar.replaceChildren();delete avatar.dataset.memberId;delete avatar.dataset.userId;delete avatar.dataset.avatarPath;return}
 const member=await senderMember(card);if(!card.isConnected)return;
 const label=initials(member?.name||name);avatar.dataset.memberId=member?.id||'';avatar.dataset.userId=member?.user_id||'';
 if(member?.avatar_path){
   if(avatar.dataset.avatarPath===member.avatar_path&&avatar.querySelector('img'))return;
   const q=db();const {data}=await q.storage.from('btg-documents').createSignedUrl(member.avatar_path,1800);const url=data?.signedUrl||'';
   if(url&&card.isConnected){const img=document.createElement('img');img.src=url;img.alt=member.name||name;img.decoding='async';avatar.replaceChildren(img);avatar.dataset.avatarPath=member.avatar_path;return}
 }
 delete avatar.dataset.avatarPath;if(avatar.textContent!==label||avatar.children.length)avatar.textContent=label;
}
function scheduleSync(){clearTimeout(syncTimer);syncTimer=setTimeout(()=>{ensure();void syncAvatar()},40)}
function ensure(){
 const h=hero();if(!h)return;
 const open=h.querySelector('.live-photo-open');if(open){open.removeAttribute('data-a');open.dataset.gtgHomePhoto='1';open.setAttribute('aria-label','Tap to expand photo. Tap again for Evidence. Hold 4 seconds for Hidden Gallery.')}
 const card=h.querySelector('.live-message-card');if(card)card.setAttribute('aria-label','Tap to open group chat. Hold your own avatar for 3 seconds to change profile photo.');
 if(!h.dataset.gtgHomeFocus)focusMessage(h);
}

async function ownContext(){
 const q=db(),tid=tripId();if(!q||!tid)return null;
 const {data:{user}}=await q.auth.getUser();if(!user)return null;
 const [tr,en,me]=await Promise.all([
   q.from('trips').select('id,plan').eq('id',tid).eq('product_key','girls').maybeSingle(),
   q.from('trip_entitlements').select('entitlement,active').eq('trip_id',tid).eq('active',true),
   q.from('trip_members').select('id,user_id,name,avatar_path').eq('trip_id',tid).eq('user_id',user.id).maybeSingle()
 ]);
 if(tr.error||!tr.data||me.error||!me.data)return null;
 const paid=tr.data.plan==='full'||(en.data||[]).some(x=>x.active!==false&&['full_trip','evidence','vault','full_comms'].includes(x.entitlement));
 return {q,user,trip:tr.data,member:me.data,paid};
}
async function triggerAvatarHold(target){
 if(!target?.isConnected)return;cancelAvatarHold();suppressAvatarClickUntil=Date.now()+1500;
 const card=target.closest('.live-message-card'),[ctx,sender]=await Promise.all([ownContext(),senderMember(card)]);
 if(!ctx){toast('Your profile photo could not be opened.');return}if(!ctx.paid){toast('Profile photos are included with Full Trip.');return}
 if(!sender||sender.user_id!==ctx.user.id){toast('You can only change your own profile photo.');return}
 const input=document.createElement('input');input.type='file';input.accept='image/*';input.hidden=true;document.body.appendChild(input);
 input.addEventListener('change',()=>{const file=input.files?.[0];input.remove();if(file)void editAvatar(ctx,file)},{once:true});input.addEventListener('cancel',()=>input.remove(),{once:true});
 try{if(input.showPicker)input.showPicker();else input.click()}catch{input.click()}
}
async function uploadAvatar(ctx,file){
 const suffix=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`,path=`${ctx.trip.id}/avatars/${ctx.member.id}-${suffix}.webp`;
 const {error:up}=await ctx.q.storage.from('btg-documents').upload(path,file,{cacheControl:'3600',upsert:false,contentType:'image/webp'});if(up)throw up;
 let previous=ctx.member.avatar_path||null;
 const rpc=await ctx.q.rpc('set_own_trip_member_avatar',{p_trip_id:ctx.trip.id,p_avatar_path:path});
 if(rpc.error){
   const fallback=await ctx.q.from('trip_members').update({avatar_path:path}).eq('id',ctx.member.id).eq('trip_id',ctx.trip.id).eq('user_id',ctx.user.id).select('id').maybeSingle();
   if(fallback.error||!fallback.data){await ctx.q.storage.from('btg-documents').remove([path]).catch(()=>{});throw rpc.error}
 }else if(rpc.data)previous=rpc.data;
 ctx.member.avatar_path=path;if(previous&&previous!==path)await ctx.q.storage.from('btg-documents').remove([previous]).catch(()=>{});
}
function editAvatar(ctx,file){
 if(!file?.size||!String(file.type||'').startsWith('image/')){toast('Choose an image file.');return}if(file.size>50*1024*1024){toast('Profile photos are limited to 50 MB.');return}
 const url=URL.createObjectURL(file),overlay=document.createElement('div');overlay.className='gtg-avatar-editor-overlay';overlay.innerHTML=`<div class="gtg-avatar-editor-card" role="dialog" aria-modal="true" aria-label="Edit profile photo"><div class="eyebrow">Full Trip profile photo</div><h2>Position your photo.</h2><p>Drag to position. Pinch to zoom. Rotate or reset if needed.</p><div class="gtg-avatar-crop-stage" data-stage><img data-image alt="Profile photo preview"></div><div class="gtg-avatar-tools"><button type="button" data-rotate="-90">↶ Rotate</button><button type="button" data-reset>Reset</button><button type="button" data-rotate="90">Rotate ↷</button></div><div class="gtg-avatar-actions"><button type="button" data-cancel>Cancel</button><button type="button" class="primary" data-save>Use photo</button></div></div>`;document.body.appendChild(overlay);
 const stage=overlay.querySelector('[data-stage]'),img=overlay.querySelector('[data-image]'),save=overlay.querySelector('[data-save]');let nw=0,nh=0,base=1,zoom=1,tx=0,ty=0,rotation=0,drag=null,pinch=null;
 const size=()=>stage.clientWidth||300;
 const apply=()=>{zoom=clamp(zoom,1,4);const rot=Math.abs(rotation%180)===90,w=(rot?nh:nw)*base*zoom,h=(rot?nw:nh)*base*zoom,s=size();tx=clamp(tx,-Math.max(0,(w-s)/2),Math.max(0,(w-s)/2));ty=clamp(ty,-Math.max(0,(h-s)/2),Math.max(0,(h-s)/2));img.style.transform=`translate(-50%,-50%) translate(${tx}px,${ty}px) scale(${zoom}) rotate(${rotation}deg)`};
 const reset=()=>{zoom=1;tx=0;ty=0;rotation=0;apply()};
 const close=()=>{URL.revokeObjectURL(url);overlay.remove()};
 img.onload=()=>{nw=img.naturalWidth;nh=img.naturalHeight;base=Math.max(size()/nw,size()/nh);img.style.width=`${nw*base}px`;img.style.height=`${nh*base}px`;reset()};img.src=url;
 stage.addEventListener('touchstart',e=>{if(e.touches.length===2){e.preventDefault();const[a,b]=e.touches;pinch={d:Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY),z:zoom};drag=null}else if(e.touches.length===1){const t=e.touches[0];drag={x:t.clientX,y:t.clientY,tx,ty}}},{passive:false});
 stage.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinch){e.preventDefault();const[a,b]=e.touches;zoom=clamp(pinch.z*Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY)/Math.max(1,pinch.d),1,4);apply()}else if(e.touches.length===1&&drag){e.preventDefault();const t=e.touches[0];tx=drag.tx+t.clientX-drag.x;ty=drag.ty+t.clientY-drag.y;apply()}},{passive:false});
 stage.addEventListener('touchend',e=>{if(e.touches.length<2)pinch=null;if(!e.touches.length)drag=null},{passive:true});
 let pointer=null;stage.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;pointer={x:e.clientX,y:e.clientY,tx,ty};stage.setPointerCapture?.(e.pointerId)});stage.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!pointer)return;tx=pointer.tx+e.clientX-pointer.x;ty=pointer.ty+e.clientY-pointer.y;apply()});stage.addEventListener('pointerup',()=>pointer=null);
 overlay.querySelectorAll('[data-rotate]').forEach(b=>b.addEventListener('click',()=>{rotation=(rotation+Number(b.dataset.rotate||0))%360;apply()}));overlay.querySelector('[data-reset]').addEventListener('click',reset);overlay.querySelector('[data-cancel]').addEventListener('click',close);
 save.addEventListener('click',async()=>{if(!nw||!nh)return;save.disabled=true;save.textContent='Saving…';try{const out=512,canvas=document.createElement('canvas');canvas.width=canvas.height=out;const g=canvas.getContext('2d',{alpha:false});g.fillStyle='#100a0f';g.fillRect(0,0,out,out);const ratio=out/size(),baseOut=Math.max(out/nw,out/nh);g.save();g.translate(out/2+tx*ratio,out/2+ty*ratio);g.rotate(rotation*Math.PI/180);g.scale(baseOut*zoom,baseOut*zoom);g.drawImage(img,-nw/2,-nh/2);g.restore();const blob=await new Promise((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(new Error('Photo crop failed.')),'image/webp',.9));await uploadAvatar(ctx,new File([blob],`avatar-${Date.now()}.webp`,{type:'image/webp'}));close();toast('Profile photo updated.');setTimeout(()=>void syncAvatar(),80)}catch(error){console.error(error);toast(error?.message||'Profile photo could not be saved.');save.disabled=false;save.textContent='Use photo'}});
}

window.addEventListener('click',event=>{
 const now=Date.now(),h=hero();if(!h)return;
 const avatar=event.target.closest?.('.dashboard .live-snapshot-hero .live-message-avatar');if(avatar&&now<suppressAvatarClickUntil){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();return}
 const photo=event.target.closest?.('.dashboard .live-snapshot-hero .live-photo-block');if(photo&&!event.target.closest?.('.live-photo-add')){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();if(now<suppressPhotoClickUntil)return;if(h.classList.contains('gtg-photo-focused'))openEvidence();else focusPhoto(h);return}
 const message=event.target.closest?.('.dashboard .live-snapshot-hero .live-message-card');if(message&&h.classList.contains('gtg-photo-focused')){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();focusMessage(h)}
},true);
window.addEventListener('contextmenu',event=>{if(event.target.closest?.('.dashboard .live-snapshot-hero .live-photo-block,.dashboard .live-snapshot-hero .live-message-avatar')){event.preventDefault();event.stopPropagation()}},true);
window.addEventListener('pointerdown',event=>{
 if(event.pointerType==='mouse'&&event.button!==0)return;
 const photo=event.target.closest?.('.dashboard .live-snapshot-hero .live-photo-block'),avatar=event.target.closest?.('.dashboard .live-snapshot-hero .live-message-avatar');
 if(photo&&!event.target.closest?.('.live-photo-add')){cancelPhotoHold();photoHold={id:event.pointerId,x:event.clientX,y:event.clientY,target:photo,timer:setTimeout(()=>{if(photoHold?.id===event.pointerId&&photo.isConnected)triggerPhotoHold(photo)},PHOTO_HOLD_MS)}}
 if(avatar){cancelAvatarHold();avatarHold={id:event.pointerId,x:event.clientX,y:event.clientY,target:avatar,timer:setTimeout(()=>{if(avatarHold?.id===event.pointerId&&avatar.isConnected)void triggerAvatarHold(avatar)},AVATAR_HOLD_MS)}}
},{capture:true,passive:true});
window.addEventListener('pointermove',event=>{if(photoHold?.id===event.pointerId&&Math.hypot(event.clientX-photoHold.x,event.clientY-photoHold.y)>32)cancelPhotoHold();if(avatarHold?.id===event.pointerId&&Math.hypot(event.clientX-avatarHold.x,event.clientY-avatarHold.y)>32)cancelAvatarHold()},{capture:true,passive:true});
const finish=event=>{if(photoHold?.id===event.pointerId)cancelPhotoHold();if(avatarHold?.id===event.pointerId)cancelAvatarHold()};window.addEventListener('pointerup',finish,{capture:true,passive:true});window.addEventListener('pointercancel',finish,{capture:true,passive:true});window.addEventListener('lostpointercapture',finish,{capture:true,passive:true});

const observer=new MutationObserver(scheduleSync);
function boot(){installStyles();observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true,characterData:true});scheduleSync();window.addEventListener('pageshow',scheduleSync);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleSync()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
