(()=>{
'use strict';
if(window.__GTG_GROUP_CARD_REFINEMENT__)return;
window.__GTG_GROUP_CARD_REFINEMENT__=true;

function installStyles(){
 if(document.getElementById('gtg-group-card-refinement-css'))return;
 const style=document.createElement('style');
 style.id='gtg-group-card-refinement-css';
 style.textContent=`
.panel[data-panel="group"] .crew-list{gap:10px!important}
.panel[data-panel="group"] .crew-card.gtg-crew-compact{grid-template-columns:52px minmax(0,1fr)!important;gap:12px!important;align-items:start!important;padding:16px!important;position:relative!important}
.panel[data-panel="group"] .crew-card.gtg-crew-compact .avatar{width:52px!important;height:52px!important}
.panel[data-panel="group"] .gtg-crew-top{display:flex;align-items:center;justify-content:space-between;gap:9px;min-width:0}
.panel[data-panel="group"] .gtg-crew-top>b{font-size:15px!important;line-height:1.15;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.panel[data-panel="group"] .gtg-crew-email{display:block!important;margin-top:4px!important;font-size:10px!important;line-height:1.25;color:var(--muted)!important;overflow-wrap:anywhere}
.panel[data-panel="group"] .gtg-crew-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}
.panel[data-panel="group"] .gtg-crew-chip{display:inline-flex;align-items:center;min-height:25px;padding:5px 8px;border:1px solid var(--line);border-radius:999px;font-size:9px;font-weight:800;line-height:1;text-transform:uppercase;letter-spacing:.035em;color:var(--muted);background:rgba(255,79,163,.045)}
.panel[data-panel="group"] .gtg-crew-chip.gtg-passport-warn{color:#9b6817;border-color:rgba(204,145,49,.35);background:rgba(255,196,92,.10)}
.panel[data-panel="group"] .gtg-crew-chip.gtg-passport-ok{color:#24774a;border-color:rgba(63,163,106,.30);background:rgba(126,226,168,.10)}
.panel[data-panel="group"] .gtg-crew-chip.gtg-money{color:#d9287f;border-color:rgba(255,79,163,.34);background:rgba(255,79,163,.08)}
.panel[data-panel="group"] .gtg-crew-actions{display:flex!important;align-items:center;gap:7px!important;flex-wrap:wrap!important;margin-top:10px!important}
.panel[data-panel="group"] .gtg-crew-actions>.btn,.panel[data-panel="group"] .gtg-crew-more>summary{padding:8px 11px!important;font-size:9px!important;border-radius:10px!important}
.panel[data-panel="group"] .gtg-crew-more{position:relative}
.panel[data-panel="group"] .gtg-crew-more>summary{list-style:none;cursor:pointer;user-select:none;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);background:transparent;font-weight:900;text-transform:uppercase;letter-spacing:.05em}
.panel[data-panel="group"] .gtg-crew-more>summary::-webkit-details-marker{display:none}
.panel[data-panel="group"] .gtg-crew-more>summary:after{content:' ···';letter-spacing:.08em}
.panel[data-panel="group"] .gtg-crew-more-menu{position:absolute;z-index:35;left:0;top:calc(100% + 6px);min-width:155px;padding:7px;border:1px solid rgba(255,79,163,.28);border-radius:12px;background:#fff;box-shadow:0 15px 34px rgba(63,28,46,.16);display:grid;gap:5px}
.panel[data-panel="group"] .gtg-crew-more-menu .btn{width:100%;text-align:left;padding:9px 10px!important;font-size:9px!important;background:#fff;color:#191316}
.panel[data-panel="group"] .gtg-crew-more-menu .btn.danger{color:#c43645;border-color:rgba(196,54,69,.28)}
.panel[data-panel="group"] .gtg-crew-compact>.pill{display:none!important}
html.gtg-app-light .panel[data-panel="group"] .gtg-crew-email{color:#75636c!important}
html.gtg-app-light .panel[data-panel="group"] .gtg-crew-chip{color:#66535d!important;border-color:rgba(255,79,163,.25)!important;background:#fff8fb!important}
html.gtg-app-light .panel[data-panel="group"] .gtg-crew-chip.gtg-passport-warn{color:#8a5b14!important;border-color:rgba(204,145,49,.34)!important;background:#fff9ec!important}
html.gtg-app-light .panel[data-panel="group"] .gtg-crew-chip.gtg-passport-ok{color:#24774a!important;border-color:rgba(63,163,106,.28)!important;background:#f3fff8!important}
html.gtg-app-light .panel[data-panel="group"] .gtg-crew-chip.gtg-money{color:#d9287f!important;border-color:rgba(255,79,163,.30)!important;background:#fff3f9!important}
@media(max-width:600px){
 .panel[data-panel="group"] .crew-card.gtg-crew-compact{padding:14px!important;grid-template-columns:46px minmax(0,1fr)!important;gap:10px!important}
 .panel[data-panel="group"] .crew-card.gtg-crew-compact .avatar{width:46px!important;height:46px!important}
 .panel[data-panel="group"] .gtg-crew-top>b{font-size:14px!important}
 .panel[data-panel="group"] .gtg-crew-chip{min-height:23px;padding:4px 7px;font-size:8px}
}
`;
 document.head.appendChild(style);
}

function chip(text,cls=''){
 const span=document.createElement('span');
 span.className=`gtg-crew-chip ${cls}`.trim();
 span.textContent=text;
 return span;
}

function refineCard(card){
 if(card.dataset.gtgCrewCompact==='1')return;
 const id=card.querySelector('.crew-id');
 const avatar=card.querySelector('.avatar');
 const status=card.querySelector(':scope > .pill');
 const name=id?.querySelector(':scope > b');
 const meta=id?.querySelector(':scope > small');
 const actions=id?.querySelector(':scope > .actions');
 if(!id||!avatar||!name||!meta)return;

 const parts=meta.textContent.split('·').map(x=>x.trim()).filter(Boolean);
 const email=parts.shift()||'No email';
 const role=parts.shift()||'Member';
 const passport=parts.find(x=>/^Passport/i.test(x))||'';
 const uploads=parts.find(x=>/uploads$/i.test(x))||'';
 const balance=parts.find(x=>/ open$/i.test(x))||'';
 const confirmed=(status?.textContent||'').trim().toLowerCase()==='confirmed';

 const top=document.createElement('div');
 top.className='gtg-crew-top';
 name.remove();top.appendChild(name);
 if(status){status.remove();top.appendChild(status)}
 id.prepend(top);

 meta.textContent=email;
 meta.className='gtg-crew-email';

 const chips=document.createElement('div');
 chips.className='gtg-crew-chips';
 chips.appendChild(chip(role));
 if(passport)chips.appendChild(chip(passport,/not confirmed/i.test(passport)?'gtg-passport-warn':'gtg-passport-ok'));
 if(balance)chips.appendChild(chip(balance,'gtg-money'));
 if(uploads&&!/^0 uploads$/i.test(uploads))chips.appendChild(chip(uploads));
 meta.insertAdjacentElement('afterend',chips);

 if(actions){
  actions.className='gtg-crew-actions';
  actions.removeAttribute('style');
  const buttons=[...actions.querySelectorAll(':scope > button')];
  const view=buttons.find(b=>b.dataset.a==='previewMember');
  const edit=buttons.find(b=>b.dataset.a==='editMember');
  const resend=buttons.find(b=>b.dataset.a==='resendInvite');
  const settle=buttons.find(b=>b.dataset.a==='settleMember');
  const remove=buttons.find(b=>b.dataset.a==='removeMember');
  if(resend&&confirmed)resend.remove();
  const extras=[resend&&!confirmed?resend:null,settle,remove].filter(Boolean).filter(b=>b.isConnected);
  actions.replaceChildren();
  if(view)actions.appendChild(view);
  if(edit)actions.appendChild(edit);
  if(extras.length){
   const details=document.createElement('details');details.className='gtg-crew-more';
   const summary=document.createElement('summary');summary.textContent='More';details.appendChild(summary);
   const menu=document.createElement('div');menu.className='gtg-crew-more-menu';
   extras.forEach(b=>menu.appendChild(b));details.appendChild(menu);actions.appendChild(details);
  }
 }
 card.classList.add('gtg-crew-compact');
 card.dataset.gtgCrewCompact='1';
}

function refine(){
 installStyles();
 document.querySelectorAll('.panel[data-panel="group"] .crew-card').forEach(refineCard);
}
function later(ms){setTimeout(refine,ms)}

document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-tab="group"]')){later(0);later(180);later(650);return}
 if(e.target.closest?.('[data-a="editMember"],[data-a="removeMember"],[data-a="settleMember"],[data-a="resendInvite"]')){later(450);later(1100)}
},true);
document.addEventListener('submit',()=>{later(500);later(1200)},true);
window.addEventListener('pageshow',()=>{later(0);later(700)});
later(800);later(1800);
})();
