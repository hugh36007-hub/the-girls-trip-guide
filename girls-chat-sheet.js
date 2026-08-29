(()=>{
'use strict';
if(window.__GTG_CHAT_SHEET__)return;window.__GTG_CHAT_SHEET__=true;
let open=false,startY=0,lastY=0,startAt=0,raf=0;
const socialSelector='[data-gtg-trip-social]',bodyClass='gtg-chat-sheet-open';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
function installStyles(){if(document.getElementById('gtg-chat-sheet-css'))return;const s=document.createElement('style');s.id='gtg-chat-sheet-css';s.textContent=`
body.${bodyClass}{overflow:hidden!important;overscroll-behavior:none!important}
.gtg-chat-sheet-toolbar{display:none}
.gtg-trip-social.gtg-chat-sheet{position:fixed!important;left:0!important;right:0!important;top:var(--gtg-chat-top,0px)!important;height:var(--gtg-chat-height,100dvh)!important;max-height:var(--gtg-chat-height,100dvh)!important;width:100%!important;max-width:none!important;margin:0!important;border:0!important;border-radius:0!important;background:#090609!important;z-index:2147482000!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;box-shadow:none!important;transform:translateY(var(--gtg-chat-drag,0px));transition:transform .2s ease}
.gtg-trip-social.gtg-chat-sheet.dragging{transition:none!important}
.gtg-trip-social.gtg-chat-sheet .gtg-social-head{display:none!important}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-sheet-toolbar{display:grid;grid-template-columns:52px minmax(0,1fr) 52px;align-items:center;min-height:calc(62px + env(safe-area-inset-top));padding:env(safe-area-inset-top) 10px 0;border-bottom:1px solid rgba(255,123,190,.18);background:#0d090d;touch-action:none;user-select:none;position:relative}
.gtg-chat-sheet-grab{position:absolute;top:calc(7px + env(safe-area-inset-top));left:50%;width:42px;height:5px;border-radius:999px;background:rgba(255,255,255,.28);transform:translateX(-50%)}
.gtg-chat-sheet-close{width:42px;height:42px;border:0;border-radius:50%;background:transparent;color:#fff;font-size:30px;line-height:1;display:grid;place-items:center;padding:0;cursor:pointer}
.gtg-chat-sheet-title{text-align:center;min-width:0;padding-top:6px}.gtg-chat-sheet-title strong{display:block;color:#fff;font-size:17px;line-height:1.15}.gtg-chat-sheet-title small{display:block;margin-top:3px;color:rgba(255,255,255,.55);font-size:10px;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gtg-trip-social.gtg-chat-sheet .gtg-social-body{padding:0!important;flex:1!important;min-height:0!important;display:flex!important;flex-direction:column!important;background:radial-gradient(circle at 20% 0,rgba(255,79,163,.055),transparent 30%),#090609!important}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-feed{flex:1!important;min-height:0!important;max-height:none!important;overflow-y:auto!important;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:18px max(14px,calc((100vw - 760px)/2)) 22px!important;display:flex!important;flex-direction:column!important;gap:8px!important;scrollbar-width:thin}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-empty{margin:auto!important;padding:28px 18px!important;max-width:340px!important}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-msg{width:auto!important;max-width:min(82%,620px)!important;padding:9px 11px 8px!important;border-radius:15px 15px 15px 4px!important;background:#171017!important;border-color:rgba(255,255,255,.09)!important;box-shadow:0 3px 12px rgba(0,0,0,.18)}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-msg.own{margin-left:auto!important;border-radius:15px 15px 4px 15px!important;background:rgba(255,79,163,.15)!important;border-color:rgba(255,123,190,.4)!important}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-msg b{font-size:10px!important;margin-bottom:3px!important}.gtg-trip-social.gtg-chat-sheet .gtg-chat-msg p{font-size:15px!important;line-height:1.38!important}.gtg-trip-social.gtg-chat-sheet .gtg-chat-msg small{text-align:right;font-size:9px!important;margin-top:3px!important}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-form{flex:0 0 auto!important;margin:0!important;padding:9px max(10px,calc((100vw - 760px)/2)) calc(9px + env(safe-area-inset-bottom))!important;border-top:1px solid rgba(255,123,190,.16)!important;background:rgba(13,9,13,.98)!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important;align-items:end!important}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-form textarea{width:100%!important;min-height:44px!important;height:44px;max-height:112px!important;resize:none!important;border-radius:22px!important;padding:11px 15px!important;line-height:20px!important;background:#171017!important;border-color:rgba(255,123,190,.22)!important;font-size:16px!important}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-form button{width:auto!important;min-width:62px!important;height:44px!important;padding:0 15px!important;border-radius:22px!important;background:var(--pink2,#ff83c1)!important;color:#150a11!important;border-color:var(--pink2,#ff83c1)!important;align-self:end!important}
@media(max-width:600px){.gtg-trip-social:not(.gtg-chat-sheet) .gtg-chat-feed{max-height:290px}.gtg-trip-social:not(.gtg-chat-sheet) .gtg-chat-form textarea{min-height:56px}.gtg-trip-social.gtg-chat-sheet .gtg-chat-form{grid-template-columns:minmax(0,1fr) auto!important}.gtg-trip-social.gtg-chat-sheet .gtg-chat-form button{width:auto!important}.gtg-trip-social.gtg-chat-sheet .gtg-chat-msg{max-width:88%!important}}
@media(prefers-reduced-motion:reduce){.gtg-trip-social.gtg-chat-sheet{transition:none!important}}
`;document.head.append(s)}
function current(){return document.querySelector(socialSelector)}
function tripName(){return document.querySelector('.trip-title strong')?.textContent?.trim()||'The trip'}
function toolbar(){return `<div class="gtg-chat-sheet-toolbar" data-gtg-chat-drag><span class="gtg-chat-sheet-grab" aria-hidden="true"></span><button type="button" class="gtg-chat-sheet-close" data-gtg-chat-close aria-label="Close group chat">⌄</button><div class="gtg-chat-sheet-title"><strong>Group chat</strong><small>${esc(tripName())}</small></div><span aria-hidden="true"></span></div>`}
function syncViewport(){if(!open)return;const el=current();if(!el)return;const vv=window.visualViewport,top=vv?Math.max(0,vv.offsetTop):0,height=vv?vv.height:window.innerHeight;el.style.setProperty('--gtg-chat-top',`${top}px`);el.style.setProperty('--gtg-chat-height',`${height}px`)}
function ensureToolbar(el=current()){if(!el||el.querySelector('[data-gtg-chat-drag]'))return;el.insertAdjacentHTML('afterbegin',toolbar())}
function scrollBottom(force=false){const feed=current()?.querySelector('[data-gtg-chat-feed]');if(!feed)return;const near=feed.scrollHeight-feed.scrollTop-feed.clientHeight<140;if(force||near)requestAnimationFrame(()=>{feed.scrollTop=feed.scrollHeight})}
function apply(){const el=current();if(!el)return;if(open){ensureToolbar(el);el.classList.add('gtg-chat-sheet');el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Group chat');document.body.classList.add(bodyClass);syncViewport();scrollBottom(true)}else{el.classList.remove('gtg-chat-sheet','dragging');el.style.removeProperty('--gtg-chat-drag');el.style.removeProperty('--gtg-chat-top');el.style.removeProperty('--gtg-chat-height');el.removeAttribute('role');el.removeAttribute('aria-modal');el.removeAttribute('aria-label')}}
function openChat(){if(open)return;open=true;document.body.classList.add(bodyClass);installStyles();apply();syncViewport()}
function closeChat(){if(!open)return;open=false;const el=current();if(el){el.classList.remove('dragging');el.style.setProperty('--gtg-chat-drag','0px')}document.body.classList.remove(bodyClass);setTimeout(()=>apply(),0)}
function resetDrag(){const el=current();if(!el)return;el.classList.remove('dragging');el.style.setProperty('--gtg-chat-drag','0px')}
function onTouchStart(e){const handle=e.target.closest?.('[data-gtg-chat-drag]');if(!open||!handle)return;const t=e.touches?.[0];if(!t)return;startY=lastY=t.clientY;startAt=performance.now();current()?.classList.add('dragging')}
function onTouchMove(e){if(!open||!startY)return;const t=e.touches?.[0];if(!t)return;lastY=t.clientY;const dy=Math.max(0,lastY-startY);if(dy<=0)return;e.preventDefault();if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>current()?.style.setProperty('--gtg-chat-drag',`${Math.min(dy,260)}px`))}
function onTouchEnd(){if(!open||!startY)return;const dy=Math.max(0,lastY-startY),elapsed=Math.max(1,performance.now()-startAt),velocity=dy/elapsed;startY=lastY=0;if(dy>92||velocity>.7)closeChat();else resetDrag()}
installStyles();
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('[data-gtg-social-tab="chat"]'))openChat()},true);
document.addEventListener('focusin',e=>{if(e.target.closest?.('[data-gtg-chat-form] textarea'))openChat()},true);
document.addEventListener('click',e=>{if(e.target.closest?.('[data-gtg-chat-close]')){e.preventDefault();e.stopPropagation();closeChat();return}if(open&&e.target.closest?.('[data-gtg-social-tab="polls"]'))closeChat()},true);
document.addEventListener('touchstart',onTouchStart,{capture:true,passive:true});document.addEventListener('touchmove',onTouchMove,{capture:true,passive:false});document.addEventListener('touchend',onTouchEnd,{capture:true,passive:true});document.addEventListener('touchcancel',onTouchEnd,{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(open&&e.key==='Escape')closeChat()});
window.visualViewport?.addEventListener('resize',syncViewport);window.visualViewport?.addEventListener('scroll',syncViewport);window.addEventListener('resize',syncViewport);
const observer=new MutationObserver(()=>{if(!open)return;clearTimeout(window.__gtgChatSheetApply);window.__gtgChatSheetApply=setTimeout(()=>{apply();scrollBottom(false)},20)});observer.observe(document.documentElement,{childList:true,subtree:true});
})();
