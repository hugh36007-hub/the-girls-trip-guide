(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/create-trip')return;
const BRAND_SRC='/assets/images/girls-trip-guide-logo.webp';
const BRAND_ALT='The Girls Trip Guide — Good Plans. Better Stories.';

function goHome(){
  const existing=document.querySelector('nav.dock [data-tab="overview"],.stat-row [data-tab="overview"]');
  if(existing){existing.click();return;}
  const u=new URL(location.href);u.searchParams.set('action','overview');location.href=u.toString();
}
function ensureBrand(){
  const inner=document.querySelector('.appbar-inner');if(!inner)return;
  let brand=inner.querySelector('.brand');
  if(!brand){
    brand=document.createElement('button');brand.type='button';brand.className='brand gtg-light-brand';brand.setAttribute('aria-label','Trip home');
    brand.innerHTML=`<img src="${BRAND_SRC}" alt="${BRAND_ALT}">`;
    brand.addEventListener('click',goHome);
    inner.prepend(brand);
  }
  const img=brand.querySelector('img');if(img){if(img.getAttribute('src')!==BRAND_SRC)img.src=BRAND_SRC;if(img.alt!==BRAND_ALT)img.alt=BRAND_ALT;}
}

const style=document.createElement('style');style.id='gtg-logged-in-light-polish';style.textContent=`
/* Authenticated shell consistency */
html.gtg-app-light .appbar-inner{gap:18px!important}
html.gtg-app-light .gtg-light-brand,html.gtg-app-light .appbar-inner>.brand{display:flex!important;flex:0 0 auto!important;margin-right:auto!important;align-items:center!important;background:transparent!important;border:0!important;padding:0!important;cursor:pointer!important}
html.gtg-app-light .appbar-inner>.brand img{display:block!important;height:62px!important;width:auto!important;max-width:104px!important;object-fit:contain!important;background:transparent!important}
html.gtg-app-light .dashboard{padding-bottom:172px!important}
html.gtg-app-light .dashboard.section-workspace{padding-bottom:172px!important}

/* Home: keep the useful two-card overview, remove the duplicated legacy strip/get-started row. */
html.gtg-app-light .gtg-parity-overview>.gtg-overview-strip,
html.gtg-app-light .gtg-parity-overview>.gtg-get-started{display:none!important}
html.gtg-app-light .gtg-parity-overview{margin:0 0 22px!important}
html.gtg-app-light .gtg-overview-grid{gap:14px!important}

/* Parity summaries now belong to the same light card family as Home. */
html.gtg-app-light .gtg-plan-categories>button,
html.gtg-app-light .gtg-overview-strip>span,
html.gtg-app-light .gtg-money-strip>span{
  background:linear-gradient(180deg,#fff 0%,#fff9fc 100%)!important;
  border:1.5px solid rgba(255,79,163,.30)!important;
  color:#191316!important;
  box-shadow:0 11px 28px rgba(63,28,46,.055)!important;
}
html.gtg-app-light .gtg-plan-categories>button:hover{border-color:rgba(255,79,163,.55)!important;box-shadow:0 14px 30px rgba(63,28,46,.08)!important}
html.gtg-app-light .gtg-plan-categories b,
html.gtg-app-light .gtg-overview-strip b,
html.gtg-app-light .gtg-money-strip b{color:#191316!important}
html.gtg-app-light .gtg-plan-categories span{color:#ed2f8b!important}
html.gtg-app-light .gtg-plan-categories small,
html.gtg-app-light .gtg-overview-strip small,
html.gtg-app-light .gtg-money-strip small{color:#75636c!important}

/* Group chat + polls: remove the remaining dark application island. */
html.gtg-app-light .gtg-trip-social{
  background:linear-gradient(180deg,#fff 0%,#fff9fc 100%)!important;
  border:1.5px solid rgba(255,79,163,.32)!important;
  color:#191316!important;
  box-shadow:0 14px 34px rgba(63,28,46,.07)!important;
}
html.gtg-app-light .gtg-social-head{border-bottom-color:rgba(255,79,163,.18)!important;background:#fff!important}
html.gtg-app-light .gtg-social-head h3{color:#191316!important}
html.gtg-app-light .gtg-social-tab{background:#fff!important;color:#6e5b65!important;border-color:rgba(255,79,163,.32)!important}
html.gtg-app-light .gtg-social-tab.active{background:#ff4fa3!important;color:#fff!important;border-color:#ff4fa3!important}
html.gtg-app-light .gtg-social-body{background:#fffafd!important}
html.gtg-app-light .gtg-chat-empty{color:#79636e!important}
html.gtg-app-light .gtg-chat-msg{background:#fff!important;color:#191316!important;border-color:rgba(255,79,163,.22)!important;box-shadow:0 5px 14px rgba(63,28,46,.035)!important}
html.gtg-app-light .gtg-chat-msg.own{background:#fff0f6!important;border-color:rgba(255,79,163,.42)!important}
html.gtg-app-light .gtg-chat-msg b{color:#ed2f8b!important}
html.gtg-app-light .gtg-chat-msg p{color:#33282d!important}
html.gtg-app-light .gtg-chat-msg small{color:#806c76!important}
html.gtg-app-light .gtg-chat-form textarea,
html.gtg-app-light .gtg-poll-form input{background:#fff!important;color:#191316!important;border:1.25px solid rgba(255,79,163,.32)!important;box-shadow:inset 0 1px 2px rgba(50,20,35,.025)!important}
html.gtg-app-light .gtg-chat-form textarea::placeholder,
html.gtg-app-light .gtg-poll-form input::placeholder{color:#9b8992!important}
html.gtg-app-light .gtg-chat-form textarea:focus,
html.gtg-app-light .gtg-poll-form input:focus{outline:none!important;border-color:#ff4fa3!important;box-shadow:0 0 0 3px rgba(255,79,163,.10)!important}
html.gtg-app-light .gtg-chat-form button,
html.gtg-app-light .gtg-poll-new,
html.gtg-app-light .gtg-poll-create,
html.gtg-app-light .gtg-poll-add,
html.gtg-app-light .gtg-poll-option,
html.gtg-app-light .gtg-poll-close{background:#fff!important;color:#ed2f8b!important;border-color:rgba(255,79,163,.42)!important}
html.gtg-app-light .gtg-chat-form button,
html.gtg-app-light .gtg-poll-create{background:#ff4fa3!important;color:#fff!important;border-color:#ff4fa3!important}
html.gtg-app-light .gtg-poll-form,
html.gtg-app-light .gtg-poll-card{background:#fff!important;color:#191316!important;border-color:rgba(255,79,163,.25)!important}
html.gtg-app-light .gtg-poll-meta,
html.gtg-app-light .gtg-poll-count,
html.gtg-app-light .gtg-poll-status{color:#79636e!important}
html.gtg-app-light .gtg-poll-option{background:#fffafd!important;color:#33282d!important}
html.gtg-app-light .gtg-convo-open{background:#fff!important;color:#ed2f8b!important;border-color:rgba(255,79,163,.42)!important}

/* Conversation inbox uses the same authenticated light shell. */
html.gtg-app-light .gtg-convo-shell{background:#fff!important;color:#191316!important;border-color:rgba(255,79,163,.34)!important;box-shadow:0 28px 80px rgba(40,20,30,.22)!important}
html.gtg-app-light .gtg-convo-head{background:#fff9fc!important;border-bottom-color:rgba(255,79,163,.20)!important}
html.gtg-app-light .gtg-convo-head button{background:#fff!important;color:#191316!important;border-color:rgba(255,79,163,.28)!important}
html.gtg-app-light .gtg-convo-head-title strong{color:#191316!important}
html.gtg-app-light .gtg-convo-head-title small{color:#806c76!important}
html.gtg-app-light .gtg-convo-row{background:#fff!important;color:#191316!important;border-bottom-color:rgba(25,19,22,.08)!important}
html.gtg-app-light .gtg-convo-row:active{background:#fff3f8!important}
html.gtg-app-light .gtg-convo-avatar{background:#fff0f6!important;color:#ed2f8b!important;border-color:rgba(255,79,163,.38)!important}
html.gtg-app-light .gtg-convo-copy b{color:#191316!important}
html.gtg-app-light .gtg-convo-copy p,
html.gtg-app-light .gtg-convo-meta,
html.gtg-app-light .gtg-convo-empty{color:#79636e!important}
html.gtg-app-light .gtg-convo-bubble{background:#fff!important;color:#191316!important;border-color:rgba(25,19,22,.09)!important;box-shadow:0 5px 14px rgba(63,28,46,.04)!important}
html.gtg-app-light .gtg-convo-bubble.own{background:#fff0f6!important;border-color:rgba(255,79,163,.35)!important}
html.gtg-app-light .gtg-convo-bubble p{color:#33282d!important}
html.gtg-app-light .gtg-convo-bubble small{color:#806c76!important}
html.gtg-app-light .gtg-convo-form{background:#fff9fc!important;border-top-color:rgba(255,79,163,.18)!important}
html.gtg-app-light .gtg-convo-form textarea{background:#fff!important;color:#191316!important;border-color:rgba(255,79,163,.30)!important}
html.gtg-app-light .gtg-convo-form button{background:#ff4fa3!important;color:#fff!important}
html.gtg-app-light .gtg-convo-note{color:#79636e!important}

/* Evidence: remove the leftover dark decorative corners from the free upgrade card. */
html.gtg-app-light .gtg-free-evidence{position:relative!important;overflow:hidden!important;background:linear-gradient(180deg,#fff 0%,#fff9fc 100%)!important;border:1.5px solid rgba(255,79,163,.32)!important;box-shadow:0 13px 32px rgba(63,28,46,.06)!important;color:#191316!important}
html.gtg-app-light .gtg-free-evidence::before,
html.gtg-app-light .gtg-free-evidence::after{display:none!important;content:none!important}
html.gtg-app-light .gtg-free-evidence h2{color:#191316!important}
html.gtg-app-light .gtg-free-evidence p{color:#62515a!important}

/* Light parity modals/panels that can appear from Group/Money. */
html.gtg-app-light .gtg-reminders button,
html.gtg-app-light .gtg-gals-selector label,
html.gtg-app-light .gtg-comms-covered article{background:#fff!important;color:#191316!important;border-color:rgba(255,79,163,.24)!important}
html.gtg-app-light .gtg-gals-selector label.active{background:#fff0f6!important;border-color:#ff4fa3!important}
html.gtg-app-light .gtg-reminder-preview p{color:#33282d!important}

@media(max-width:850px){html.gtg-app-light .appbar-inner>.brand img{height:56px!important;max-width:90px!important}}
@media(max-width:600px){
 html.gtg-app-light .dashboard,html.gtg-app-light .dashboard.section-workspace{padding-bottom:150px!important}
 html.gtg-app-light .appbar-inner>.brand img{height:48px!important;max-width:78px!important}
 html.gtg-app-light .gtg-overview-grid{grid-template-columns:1fr!important}
}
`;
document.head.appendChild(style);

ensureBrand();
const app=document.getElementById('app');if(app)new MutationObserver(ensureBrand).observe(app,{childList:true,subtree:false});
window.addEventListener('popstate',()=>requestAnimationFrame(ensureBrand));
})();
