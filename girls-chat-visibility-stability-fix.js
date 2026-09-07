/* Girls chat: keep message text legible and preserve the full-screen sheet during live re-renders. */
(()=>{
'use strict';
if(window.__GTG_CHAT_VISIBILITY_STABILITY_FIX__)return;
window.__GTG_CHAT_VISIBILITY_STABILITY_FIX__=true;

const style=document.createElement('style');
style.id='gtg-chat-visibility-stability-fix-css';
style.textContent=`
/* Logged-in light theme must never bleed dark text into the dark chat sheet. */
.gtg-trip-social.gtg-chat-sheet .gtg-chat-msg,
html.gtg-chat-sheet-open .gtg-trip-social .gtg-chat-msg,
body.gtg-chat-sheet-open .gtg-trip-social .gtg-chat-msg{color:#fff!important;-webkit-text-fill-color:#fff!important}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-msg p,
html.gtg-chat-sheet-open .gtg-trip-social .gtg-chat-msg p,
body.gtg-chat-sheet-open .gtg-trip-social .gtg-chat-msg p{color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-msg b,
html.gtg-chat-sheet-open .gtg-trip-social .gtg-chat-msg b,
body.gtg-chat-sheet-open .gtg-trip-social .gtg-chat-msg b{color:var(--pink2,#ff83c1)!important;-webkit-text-fill-color:var(--pink2,#ff83c1)!important;opacity:1!important}
.gtg-trip-social.gtg-chat-sheet .gtg-chat-msg small,
html.gtg-chat-sheet-open .gtg-trip-social .gtg-chat-msg small,
body.gtg-chat-sheet-open .gtg-trip-social .gtg-chat-msg small{color:rgba(255,255,255,.62)!important;-webkit-text-fill-color:rgba(255,255,255,.62)!important;opacity:1!important}

/* The social component is replaced after send/realtime refresh. Keep the replacement fixed
   immediately so the white dashboard cannot flash through before chat-sheet.js reapplies. */
html.gtg-chat-sheet-open [data-gtg-trip-social],
body.gtg-chat-sheet-open [data-gtg-trip-social]{
 position:fixed!important;
 left:0!important;
 right:0!important;
 top:var(--gtg-chat-top,0px)!important;
 height:var(--gtg-chat-height,100dvh)!important;
 max-height:var(--gtg-chat-height,100dvh)!important;
 width:100%!important;
 max-width:none!important;
 margin:0!important;
 border:0!important;
 border-radius:0!important;
 background:#090609!important;
 z-index:2147482000!important;
 overflow:hidden!important;
 display:flex!important;
 flex-direction:column!important;
 box-shadow:none!important;
 box-sizing:border-box!important;
}
html.gtg-chat-sheet-open [data-gtg-trip-social] .gtg-social-head,
body.gtg-chat-sheet-open [data-gtg-trip-social] .gtg-social-head{display:none!important}
html.gtg-chat-sheet-open [data-gtg-trip-social] .gtg-social-body,
body.gtg-chat-sheet-open [data-gtg-trip-social] .gtg-social-body{flex:1!important;min-height:0!important;display:flex!important;flex-direction:column!important;background:#090609!important}
`;
document.head.appendChild(style);

/* Re-apply the sheet class in the same frame as a chat component replacement. */
const observer=new MutationObserver(()=>{
 if(!document.documentElement.classList.contains('gtg-chat-sheet-open')&&!document.body.classList.contains('gtg-chat-sheet-open'))return;
 const social=document.querySelector('[data-gtg-trip-social]');
 if(!social)return;
 social.classList.add('gtg-chat-sheet');
});
observer.observe(document.documentElement,{childList:true,subtree:true});
})();
