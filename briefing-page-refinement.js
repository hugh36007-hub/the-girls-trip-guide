(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/briefing')return;

const style=document.createElement('style');
style.id='briefing-page-refinement';
style.textContent=`
/* Briefing — scoped light-theme refinement */
html.gtg-white-site body .hero{background:#080508!important;color:#fff!important}
html.gtg-white-site body .hero:after{background:linear-gradient(90deg,rgba(5,3,5,.66) 0%,rgba(5,3,5,.50) 20%,rgba(5,3,5,.25) 40%,rgba(5,3,5,.08) 55%,rgba(5,3,5,0) 69%)!important}
html.gtg-white-site body .hero .eyebrow{color:#ff4fa3!important}
html.gtg-white-site body .hero h1{color:#fff!important;text-shadow:0 2px 12px rgba(0,0,0,.34)!important}
html.gtg-white-site body .hero h1 span{color:#ff4fa3!important}
html.gtg-white-site body .hero-copy p{color:rgba(255,255,255,.88)!important;text-shadow:0 1px 8px rgba(0,0,0,.24)!important}
html.gtg-white-site body .hero-copy p strong{color:#fff!important;font-weight:800!important}
html.gtg-white-site body .hero-rule{background:#ff4fa3!important;box-shadow:0 0 16px rgba(255,79,163,.20)!important}

html.gtg-white-site body .briefing{background:#fff!important}
html.gtg-white-site body .brief-row{padding:42px 0!important;border-bottom:1px solid rgba(255,79,163,.15)!important}
html.gtg-white-site body .brief-row h2{color:#191316!important;text-shadow:0 1px 8px rgba(48,22,34,.05)!important}
html.gtg-white-site body .brief-copy{color:#55454d!important}
html.gtg-white-site body .brief-copy strong{color:#191316!important}
html.gtg-white-site body .num,html.gtg-white-site body .section-kicker{color:#ed2f8b!important}

html.gtg-white-site body .rule-card{background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.38)!important;box-shadow:0 14px 32px rgba(63,28,46,.065)!important;color:#191316!important}
html.gtg-white-site body .rule-card b{color:#191316!important}
html.gtg-white-site body .rule-card>span:not(.rule-fallback){color:#55454d!important}
html.gtg-white-site body .rule-icon{width:76px!important;height:76px!important;margin:0 auto 15px!important;border:1.5px solid rgba(255,79,163,.38)!important;border-radius:19px!important;background:#fff7fb!important;box-shadow:0 8px 22px rgba(237,47,139,.07)!important;overflow:hidden!important;padding:0!important;display:grid!important;place-items:center!important}
html.gtg-white-site body .rule-icon img,html.gtg-white-site body .rule-icon .rule-fallback{display:none!important}
html.gtg-white-site body .rule-icon svg{width:42px!important;height:42px!important;display:block!important;fill:none!important;stroke:#ed2f8b!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important}

html.gtg-white-site body .closing{padding:68px 20px 74px!important;background:#fff!important;border-top:1px solid rgba(255,79,163,.15)!important}
html.gtg-white-site body .closing-script{color:#ed2f8b!important}
html.gtg-white-site body .closing h2{color:#191316!important;text-shadow:0 2px 10px rgba(48,22,34,.06)!important}
html.gtg-white-site body .closing p{color:#55454d!important}

@media(max-width:700px){
 html.gtg-white-site body .hero:after{background:linear-gradient(180deg,rgba(5,3,5,0) 0%,rgba(5,3,5,0) 48%,rgba(5,3,5,.12) 55%,rgba(5,3,5,.74) 66%,#050305 100%)!important}
 html.gtg-white-site body .brief-row{padding:26px 0!important}
 html.gtg-white-site body .rule-card{padding:14px 15px!important}
 html.gtg-white-site body .rule-icon{width:60px!important;height:60px!important;margin:0!important;border-radius:15px!important}
 html.gtg-white-site body .rule-icon svg{width:34px!important;height:34px!important}
 html.gtg-white-site body .closing{padding:48px 18px 54px!important}
}
`;
document.head.appendChild(style);

const icons=[
`<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="14" width="32" height="23" rx="3"/><path d="M9 17l15 11 15-11"/><path d="M18.5 13.5l2.1-4.1 3.4 2.8 3.4-2.8 2.1 4.1"/></svg>`,
`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 41s12-9.4 12-21a12 12 0 1 0-24 0c0 11.6 12 21 12 21z"/><circle cx="19" cy="20" r="3"/><circle cx="29" cy="20" r="3"/><path d="M14.5 29c.8-4.1 3.2-6 6.3-6 1.2 0 2.3.3 3.2.9 1-.6 2-.9 3.2-.9 3.1 0 5.5 1.9 6.3 6"/></svg>`,
`<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="9" width="25" height="31" rx="3"/><path d="M16 9V6h11v3"/><path d="M15 18l3 3 5-6"/><path d="M15 28l3 3 5-6"/><rect x="30" y="26" width="10" height="14" rx="2"/><path d="M33 26v-3h4v3"/></svg>`
];
const installIcons=()=>{
  document.querySelectorAll('.rules .rule-icon').forEach((el,i)=>{if(icons[i])el.innerHTML=icons[i]});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installIcons,{once:true});else installIcons();
})();
