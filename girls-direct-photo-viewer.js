/* Girls Evidence: authoritative immersive mobile media viewer. */
(()=>{
'use strict';
if(window.__GTG_DIRECT_PHOTO_VIEWER__)return;window.__GTG_DIRECT_PHOTO_VIEWER__=true;
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co',KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP',mobile=window.matchMedia('(max-width:600px)');
let client=null,active=null;const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
const isVideo=row=>String(row?.mime_type||'').startsWith('video/');
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

function freeze(host){
 const y=window.scrollY||0,bodyStyle={position:document.body.style.position,top:document.body.style.top,left:document.body.style.left,right:document.body.style.right,width:document.body.style.width,overflow:document.body.style.overflow},htmlStyle={overflow:document.documentElement.style.overflow,overscrollBehavior:document.documentElement.style.overscrollBehavior};
 document.documentElement.style.overflow='hidden';document.documentElement.style.overscrollBehavior='none';document.body.style.position='fixed';document.body.style.top=`-${y}px`;document.body.style.left='0';document.body.style.right='0';document.body.style.width='100%';document.body.style.overflow='hidden';document.body.classList.add('gtg-immersive-media-open');active={host,scrollY:y,bodyStyle,htmlStyle,media:null,scale:1,tx:0,ty:0,fit:'cover'};
}
function close(){if(!active)return;const {host,scrollY,bodyStyle,htmlStyle}=active;active=null;host?.remove();document.body.classList.remove('gtg-immersive-media-open');document.documentElement.style.overflow=htmlStyle.overflow;document.documentElement.style.overscrollBehavior=htmlStyle.overscrollBehavior;Object.assign(document.body.style,bodyStyle);window.scrollTo(0,scrollY)}
function dispatchAction(kind,row){
 const button=document.createElement('button');button.type='button';button.hidden=true;
 if(kind==='hero'){button.dataset.a='setMediaHero';button.dataset.id=row.id}else if(kind==='delete'){button.dataset.deleteMedia=row.id}
 document.body.appendChild(button);button.click();button.remove();
}
function shell(row,isOwner){
 const host=document.createElement('div');host.className='gtg-immersive-media-host';host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-label',isVideo(row)?'Trip video':'Trip photo');Object.assign(host.style,{position:'fixed',inset:'0',width:'100vw',height:'100dvh',zIndex:'2147483646',display:'block',background:'#000',margin:'0',padding:'0',border:'0'});
 const shadow=host.attachShadow({mode:'open'}),actions=isOwner?[...(!isVideo(row)?[{label:'Use as trip hero',run:()=>dispatchAction('hero',row)}]:[]),{label:'Remove media',danger:true,run:()=>dispatchAction('delete',row)}]:[];
 shadow.innerHTML=`<style>
 :host{all:initial;position:fixed;inset:0;width:100vw;height:100dvh;z-index:2147483646;background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;contain:layout paint style;overscroll-behavior:none}
 *{box-sizing:border-box}.viewer{position:absolute;inset:0;width:100%;height:100%;overflow:hidden;background:#000;overscroll-behavior:none}.stage{position:absolute;inset:0;display:grid;place-items:center;width:100%;height:100%;overflow:hidden;background:#000;touch-action:none;user-select:none;-webkit-user-select:none}.stage:before{content:"";position:absolute;z-index:4;inset:0 0 auto;height:max(112px,calc(env(safe-area-inset-top) + 88px));background:linear-gradient(to bottom,rgba(0,0,0,.48),rgba(0,0,0,.14) 55%,transparent);pointer-events:none}.media{display:block;width:100%;height:100%;max-width:none;max-height:none;margin:0;border:0;border-radius:0;background:#000;object-fit:cover;object-position:center;transform-origin:center center;will-change:transform;image-rendering:auto}.media.contain{object-fit:contain}.media.zoomed{cursor:move}.top{position:absolute;z-index:10;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:calc(env(safe-area-inset-top) + 10px) 12px 10px;pointer-events:none}.control{pointer-events:auto;display:grid;place-items:center;width:42px;height:42px;margin:0;padding:0;border:0;border-radius:999px;background:rgba(0,0,0,.34);color:#fff;box-shadow:0 1px 8px rgba(0,0,0,.24);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}.control svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.manage{font-size:22px;line-height:1;font-weight:800;letter-spacing:2px;padding-bottom:6px}.menu{position:absolute;z-index:12;top:calc(env(safe-area-inset-top) + 58px);right:12px;min-width:190px;overflow:hidden;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(19,12,18,.94);box-shadow:0 18px 44px rgba(0,0,0,.5);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px)}.menu[hidden]{display:none}.menu button{display:block;width:100%;min-height:48px;padding:12px 16px;border:0;border-bottom:1px solid rgba(255,255,255,.08);background:transparent;color:#fff;text-align:left;font:700 14px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.menu button:last-child{border-bottom:0}.menu button.danger{color:#ff9ba6}.loading,.error{position:absolute;z-index:3;inset:0;display:grid;place-items:center;padding:30px;color:rgba(255,255,255,.72);font:600 14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:center}.spinner{width:28px;height:28px;border:3px solid rgba(255,255,255,.18);border-top-color:#ff83c1;border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
 </style><div class="viewer"><div class="stage"><div class="loading"><span class="spinner" aria-label="Loading media"></span></div></div><div class="top"><button class="control back" type="button" aria-label="Back to gallery"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>${actions.length?'<button class="control manage" type="button" aria-label="Media actions">•••</button>':'<span></span>'}</div>${actions.length?`<div class="menu" hidden>${actions.map((x,i)=>`<button type="button" data-menu-index="${i}" class="${x.danger?'danger':''}">${x.label}</button>`).join('')}</div>`:''}</div>`;
 document.body.appendChild(host);freeze(host);const stage=shadow.querySelector('.stage'),back=shadow.querySelector('.back'),manage=shadow.querySelector('.manage'),menu=shadow.querySelector('.menu');back.addEventListener('click',close);manage?.addEventListener('click',()=>{if(menu)menu.hidden=!menu.hidden});menu?.addEventListener('click',event=>{const button=event.target.closest('button[data-menu-index]');if(!button)return;const item=actions[Number(button.dataset.menuIndex)];close();setTimeout(()=>item?.run(),0)});return{host,stage};
}
function installGestures(stage,media,kind){
 if(kind==='video')return;let start=null,pinch=null,lastTap=0;
 const apply=()=>{if(!active||active.media!==media)return;media.style.transform=`translate3d(${active.tx}px,${active.ty}px,0) scale(${active.scale})`;media.classList.toggle('zoomed',active.scale>1.01)};
 const reset=()=>{if(!active)return;active.scale=1;active.tx=0;active.ty=0;apply()};
 const toggleFit=()=>{if(!active)return;active.fit=active.fit==='cover'?'contain':'cover';media.classList.toggle('contain',active.fit==='contain');reset()};
 stage.addEventListener('dblclick',event=>{event.preventDefault();toggleFit()});
 stage.addEventListener('touchstart',event=>{if(!active)return;if(event.touches.length===2){const[a,b]=event.touches;pinch={distance:Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY),scale:active.scale};start=null;return}if(event.touches.length===1){const t=event.touches[0];start={x:t.clientX,y:t.clientY,tx:active.tx,ty:active.ty,time:Date.now()}}},{passive:true});
 stage.addEventListener('touchmove',event=>{if(!active)return;if(event.touches.length===2&&pinch){event.preventDefault();const[a,b]=event.touches,d=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);active.scale=clamp(pinch.scale*(d/Math.max(1,pinch.distance)),1,4);apply();return}if(event.touches.length===1&&start&&active.scale>1.01){event.preventDefault();const t=event.touches[0];active.tx=clamp(start.tx+t.clientX-start.x,-innerWidth*.7,innerWidth*.7);active.ty=clamp(start.ty+t.clientY-start.y,-innerHeight*.7,innerHeight*.7);apply()}},{passive:false});
 stage.addEventListener('touchend',event=>{if(!active)return;if(event.touches.length){if(event.touches.length<2)pinch=null;return}pinch=null;if(!start)return;const t=event.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y,travel=Math.hypot(dx,dy),now=Date.now();if(active.scale<=1.01&&travel<18&&now-lastTap<320){toggleFit();lastTap=0;start=null;return}if(travel<18)lastTap=now;if(active.scale<=1.01&&((dy>110&&Math.abs(dy)>Math.abs(dx)*1.15)||(Math.abs(dx)>120&&Math.abs(dx)>Math.abs(dy)*1.35))){close();start=null;return}start=null},{passive:true});
 stage.addEventListener('touchcancel',()=>{start=null;pinch=null},{passive:true});
}
async function open(id){
 const tid=tripId(),q=db();if(!tid||!q)return;close();
 const [mediaResult,userResult,tripResult]=await Promise.all([q.from('media').select('id,trip_id,album,storage_path,file_name,mime_type').eq('trip_id',tid).eq('id',id).maybeSingle(),q.auth.getUser(),q.from('trips').select('owner_id').eq('id',tid).eq('product_key','girls').maybeSingle()]);
 const row=mediaResult.data;if(mediaResult.error||!row)return;const ownerId=tripResult.data?.owner_id||'',userId=userResult.data?.user?.id||'',isOwner=Boolean(ownerId&&userId&&ownerId===userId),{host,stage}=shell(row,isOwner);
 try{
   const bucket=row.album==='vault'?'btg-vault':'btg-evidence',{data,error}=await q.storage.from(bucket).createSignedUrl(row.storage_path,3600);if(error)throw error;const url=data?.signedUrl||'';if(!url||active?.host!==host)return;
   let media;
   if(isVideo(row)){media=document.createElement('video');media.className='media';media.controls=true;media.playsInline=true;media.preload='metadata';media.autoplay=true;media.src=url;await new Promise((resolve,reject)=>{media.addEventListener('loadeddata',resolve,{once:true});media.addEventListener('error',()=>reject(Error('Video could not be loaded.')),{once:true})});media.play?.().catch(()=>{})}
   else{media=new Image();media.className='media';media.alt='Trip photo';media.loading='eager';media.decoding='async';await new Promise((resolve,reject)=>{media.addEventListener('load',resolve,{once:true});media.addEventListener('error',()=>reject(Error('Photo could not be loaded.')),{once:true});media.src=url})}
   if(active?.host!==host)return;active.media=media;stage.replaceChildren(media);installGestures(stage,media,isVideo(row)?'video':'photo');
 }catch(error){console.warn('Girls immersive media viewer failed.',error);if(active?.host===host)stage.innerHTML='<div class="error">This media could not be loaded.<br>Return to the gallery and try again.</div>'}
}
function boot(){
 if(!window.supabase?.createClient){setTimeout(boot,50);return}
 document.addEventListener('click',event=>{
   if(!mobile.matches)return;const target=event.target.closest?.('[data-panel="evidence"] .gallery .gtg-mobile-media-primary,[data-panel="evidence"] .gallery [data-media-id],[data-panel="evidence"] .gallery button.gtg-video-preview');if(!target)return;const card=target.closest?.('.media'),id=target.dataset?.mediaId||card?.dataset.mediaId||'';if(!id)return;
   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();void open(id);
 },true);
 window.addEventListener('keydown',event=>{if(event.key==='Escape'&&active)close()});
}
boot();
})();
