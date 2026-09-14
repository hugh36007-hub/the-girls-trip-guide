/* Final mobile hierarchy polish for the Girls private app. Presentation/DOM order only. */
(()=>{
'use strict';
if(window.__GTG_INNER_PAGE_POLISH__)return;window.__GTG_INNER_PAGE_POLISH__=true;
let queued=false;
const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;polish()})};

function activePanel(){return document.querySelector('.dashboard .panel.active')}
function installPlanMoneyAuthority(){
 if(document.getElementById('gtg-plan-money-mobile-authority'))return;
 const style=document.createElement('style');
 style.id='gtg-plan-money-mobile-authority';
 style.textContent=`
@media(max-width:700px){
 html.gtg-app-light body:has(.panel[data-panel="plan"].active),
 html.gtg-app-light body:has(.panel[data-panel="money"].active){background:#fff!important;color:#191316!important}

 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .appbar,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .appbar{
  min-height:52px!important;height:52px!important;padding:5px 12px!important;
  background:rgba(255,255,255,.985)!important;border-bottom:1px solid rgba(255,79,163,.18)!important;
  box-shadow:none!important;color:#191316!important
 }
 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .appbar-inner,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .appbar-inner{width:100%!important;min-height:42px!important;gap:8px!important}
 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .appbar .brand,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .appbar .brand{display:none!important}
 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .trip-title,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .trip-title{display:grid!important;align-content:center!important;gap:1px!important;margin:0 auto 0 0!important;text-align:left!important;min-width:0!important}
 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .trip-title strong,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .trip-title strong{display:block!important;max-width:220px!important;color:#191316!important;font-size:12px!important;font-weight:800!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .trip-title span,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .trip-title span{display:block!important;max-width:220px!important;color:#9a7487!important;font-size:8px!important;font-weight:800!important;letter-spacing:.11em!important;text-transform:uppercase!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .trip-title span:before,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .trip-title span:before{content:none!important}
 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .icon-btn,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .icon-btn{width:38px!important;height:38px!important;flex:0 0 38px!important;background:#fff!important;color:#191316!important;border:1px solid rgba(255,79,163,.28)!important}

 html.gtg-app-light .panel[data-panel="plan"].active>.section-head h2,
 html.gtg-app-light .panel[data-panel="money"].active>.section-head h2{color:#191316!important}
 html.gtg-app-light .panel[data-panel="plan"].active>.section-head p,
 html.gtg-app-light .panel[data-panel="money"].active>.section-head p{color:#75636c!important}

 html.gtg-app-light .panel[data-panel="plan"].active .card,
 html.gtg-app-light .panel[data-panel="money"].active .card,
 html.gtg-app-light .panel[data-panel="plan"].active .empty,
 html.gtg-app-light .panel[data-panel="money"].active .empty,
 html.gtg-app-light .panel[data-panel="plan"].active .gtg-plan-categories>button,
 html.gtg-app-light .panel[data-panel="money"].active .gtg-money-strip>span,
 html.gtg-app-light .panel[data-panel="money"].active .gtg-nudge-card{
  background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;
  border-color:rgba(255,79,163,.28)!important;color:#191316!important;
  box-shadow:0 10px 26px rgba(63,28,46,.055)!important
 }
 html.gtg-app-light .panel[data-panel="plan"].active .card h2,
 html.gtg-app-light .panel[data-panel="plan"].active .card h3,
 html.gtg-app-light .panel[data-panel="money"].active .card h2,
 html.gtg-app-light .panel[data-panel="money"].active .card h3,
 html.gtg-app-light .panel[data-panel="plan"].active .gtg-plan-categories b,
 html.gtg-app-light .panel[data-panel="money"].active .gtg-money-strip b{color:#191316!important}
 html.gtg-app-light .panel[data-panel="plan"].active .card p,
 html.gtg-app-light .panel[data-panel="money"].active .card p,
 html.gtg-app-light .panel[data-panel="plan"].active .gtg-plan-categories small,
 html.gtg-app-light .panel[data-panel="money"].active .gtg-money-strip small{color:#75636c!important}
 html.gtg-app-light .panel[data-panel="plan"].active .eyebrow,
 html.gtg-app-light .panel[data-panel="money"].active .eyebrow,
 html.gtg-app-light .panel[data-panel="plan"].active .gtg-plan-categories span{color:#ed2f8b!important}

 html.gtg-app-light .panel[data-panel="money"].active .balance-grid{grid-template-columns:1fr!important;gap:12px!important}
 html.gtg-app-light .panel[data-panel="money"].active .money-row{
  display:grid!important;grid-template-columns:1fr!important;gap:9px!important;
  padding:13px 0!important;background:transparent!important;border-color:rgba(25,19,22,.10)!important;
  box-shadow:none!important;color:#191316!important;overflow:visible!important
 }
 html.gtg-app-light .panel[data-panel="money"].active .money-row b{color:#191316!important}
 html.gtg-app-light .panel[data-panel="money"].active .money-row>div:first-child>div{color:#75636c!important}
 html.gtg-app-light .panel[data-panel="money"].active .money-row>div:last-child{display:flex!important;flex-wrap:wrap!important;align-items:center!important;width:100%!important;gap:8px!important}
 html.gtg-app-light .panel[data-panel="money"].active .money-row>div:last-child>span{flex:0 0 100%!important;color:#ed2f8b!important;font-weight:900!important;font-size:18px!important}
 html.gtg-app-light .panel[data-panel="money"].active .money-row .btn{flex:1 1 calc(50% - 4px)!important;min-width:0!important;background:#fff!important;color:#ed2f8b!important;border-color:rgba(255,79,163,.32)!important}
 html.gtg-app-light .panel[data-panel="money"].active .gtg-payment-nudges,
 html.gtg-app-light .panel[data-panel="money"].active .gtg-nudge-grid{background:transparent!important}
 html.gtg-app-light .panel[data-panel="money"].active .gtg-payment-nudges-head h3{color:#191316!important}
 html.gtg-app-light .panel[data-panel="money"].active .gtg-payment-nudges-head p,
 html.gtg-app-light .panel[data-panel="money"].active .gtg-nudge-card small{color:#75636c!important}

 html.gtg-app-light .panel[data-panel="plan"].active .card-footer{display:grid!important;grid-template-columns:1fr!important;gap:9px!important;align-items:start!important}
 html.gtg-app-light .panel[data-panel="plan"].active .card-footer .btn{width:100%!important;background:#fff!important;color:#ed2f8b!important;border-color:rgba(255,79,163,.32)!important}

 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .dashboard.section-workspace,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .dashboard.section-workspace{padding-bottom:calc(128px + env(safe-area-inset-bottom))!important;scroll-padding-bottom:calc(112px + env(safe-area-inset-bottom))!important}
 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .dock,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .dock{
  width:calc(100% - 24px)!important;height:68px!important;bottom:calc(8px + env(safe-area-inset-bottom))!important;
  background:#fff!important;border:1px solid rgba(255,79,163,.30)!important;
  box-shadow:0 12px 32px rgba(55,27,42,.15)!important;opacity:1!important
 }
 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .dock button,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .dock button{color:#75636c!important;background:transparent!important}
 html.gtg-app-light body:has(.panel[data-panel="plan"].active) .dock button.active,
 html.gtg-app-light body:has(.panel[data-panel="money"].active) .dock button.active{color:#ed2f8b!important;background:#fff3f8!important}

 #bookingForm select[name="kind"][data-gtg-mobile-kind-source="1"]{display:none!important}
 #bookingForm .gtg-kind-chooser{position:relative;display:grid;gap:6px;width:100%}
 #bookingForm .gtg-kind-trigger{width:100%;min-height:48px;display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border:1.5px solid rgba(255,79,163,.42);border-radius:12px;background:#fff;color:#191316;font:600 16px/1.2 Inter,Arial,sans-serif;text-align:left}
 #bookingForm .gtg-kind-trigger:after{content:'⌄';color:#75636c;font-size:18px}
 #bookingForm .gtg-kind-trigger[aria-expanded="true"]{border-color:#ff4fa3;box-shadow:0 0 0 3px rgba(255,79,163,.08)}
 #bookingForm .gtg-kind-menu{display:grid;gap:2px;border:1px solid rgba(255,79,163,.24);border-radius:12px;background:#fff;padding:5px;box-shadow:0 12px 28px rgba(63,28,46,.12)}
 #bookingForm .gtg-kind-menu[hidden]{display:none!important}
 #bookingForm .gtg-kind-option{min-height:42px;padding:9px 11px;border:0;border-radius:9px;background:#fff;color:#191316;text-align:left;font:600 15px/1.2 Inter,Arial,sans-serif}
 #bookingForm .gtg-kind-option[aria-selected="true"]{background:#fff0f6;color:#ed2f8b;font-weight:800}
}
`;
 document.head.appendChild(style);
}
function placeOverview(){
 const panel=document.querySelector('.dashboard .panel[data-panel="overview"].active');
 const summary=panel?.querySelector(':scope > [data-parity-block="overview"]');
 if(!panel||!summary)return;
 /* Messaging belongs in Group; keeping it on Home made the overview unnecessarily long. */
 summary.querySelector('.gtg-message-panel')?.remove();
 const head=[...panel.querySelectorAll(':scope > .section-head')].find(el=>/overview/i.test(el.textContent||''));
 if(head&&head.nextElementSibling!==summary)head.insertAdjacentElement('afterend',summary);
}
function placeSummary(panel){
 if(!panel||panel.dataset.panel==='overview')return;
 const head=panel.querySelector(':scope > .section-head');
 const summary=panel.querySelector(':scope > [data-parity-block]');
 if(!head||!summary)return;
 if(head.nextElementSibling!==summary)head.insertAdjacentElement('afterend',summary);

 const tab=panel.dataset.panel||'';
 if(tab==='plan'){
  summary.querySelectorAll('[data-parity-existing]').forEach(el=>el.remove());
  const tools=summary.querySelector('.gtg-plan-tools');
  if(tools&&!tools.querySelector('button'))tools.remove();
 }
 if(tab==='money'){
  const originalActions=head.querySelector('.actions');
  if(originalActions?.querySelector('button'))summary.querySelector('.gtg-plan-tools')?.remove();
 }
 if(tab==='group'){
  summary.querySelector('[data-parity-existing="invite"]')?.remove();
  const tools=summary.querySelector('.gtg-plan-tools');
  const comms=tools?.querySelector('[data-parity-comms],[data-parity-reminders]');
  const actions=head.querySelector('.actions');
  if(comms&&actions&&!actions.querySelector('[data-parity-comms],[data-parity-reminders]'))actions.appendChild(comms);
  const all=[...panel.querySelectorAll('[data-parity-comms],[data-parity-reminders]')];
  const keep=actions?.querySelector('[data-parity-comms],[data-parity-reminders]')||all[0];
  all.forEach(button=>{if(button!==keep)button.remove()});
  if(tools&&!tools.querySelector('button'))tools.remove();
 }
}
function syncHeader(){
 const tab=activePanel()?.dataset.panel||'overview';
 const appbar=document.querySelector('.appbar');
 if(!appbar)return;
 appbar.classList.toggle('gtg-inner-appbar',['plan','money','group','evidence'].includes(tab));
}
function enhanceBookingType(){
 if(!window.matchMedia('(max-width:700px)').matches)return;
 const form=document.getElementById('bookingForm');
 const select=form?.querySelector('select[name="kind"]');
 if(!select||select.dataset.gtgMobileKindSource==='1')return;
 select.dataset.gtgMobileKindSource='1';
 select.tabIndex=-1;select.setAttribute('aria-hidden','true');
 const chooser=document.createElement('div');chooser.className='gtg-kind-chooser';
 const trigger=document.createElement('button');trigger.type='button';trigger.className='gtg-kind-trigger';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
 const menu=document.createElement('div');menu.className='gtg-kind-menu';menu.setAttribute('role','listbox');menu.hidden=true;
 const buttons=[];
 const sync=()=>{
  const selected=select.options[select.selectedIndex]||select.options[0];
  trigger.textContent=selected?.textContent||'Choose type';
  buttons.forEach(button=>button.setAttribute('aria-selected',button.dataset.value===select.value?'true':'false'));
 };
 const close=()=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false')};
 for(const option of select.options){
  const button=document.createElement('button');button.type='button';button.className='gtg-kind-option';button.setAttribute('role','option');button.dataset.value=option.value;button.textContent=option.textContent||option.value;
  button.addEventListener('click',()=>{
   select.value=option.value;
   select.dispatchEvent(new Event('input',{bubbles:true}));
   select.dispatchEvent(new Event('change',{bubbles:true}));
   sync();close();requestAnimationFrame(()=>trigger.focus({preventScroll:true}));
  });
  buttons.push(button);menu.appendChild(button);
 }
 trigger.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;trigger.setAttribute('aria-expanded',open?'true':'false')});
 select.addEventListener('change',sync);
 chooser.append(trigger,menu);select.insertAdjacentElement('afterend',chooser);sync();
}

function drawerClose(){
 const wrap=document.getElementById('drawerRoot');
 const drawer=wrap?.querySelector('.drawer');
 if(!wrap?.classList.contains('open')||!drawer)return;
 const legacy=[...drawer.querySelectorAll('button')].find(el=>(el.textContent||'').trim().toLowerCase()==='close');
 if(legacy)legacy.classList.add('gtg-legacy-drawer-close');
 if(drawer.querySelector('.gtg-drawer-close-top'))return;
 const button=document.createElement('button');
 button.type='button';button.className='gtg-drawer-close-top';button.setAttribute('aria-label','Close trip menu');button.textContent='×';
 button.addEventListener('click',()=>{if(legacy)legacy.click();else wrap.classList.remove('open')});
 drawer.prepend(button);
}

function polish(){
 installPlanMoneyAuthority();
 placeOverview();
 placeSummary(activePanel());
 syncHeader();
 enhanceBookingType();
 drawerClose();
}

const app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
const drawer=document.getElementById('drawerRoot');if(drawer)new MutationObserver(schedule).observe(drawer,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
const modal=document.getElementById('modalRoot')||document.getElementById('modal-root');if(modal)new MutationObserver(schedule).observe(modal,{childList:true,subtree:true});
window.addEventListener('popstate',schedule);
document.addEventListener('click',event=>{
 const chooser=event.target.closest?.('.gtg-kind-chooser');
 if(!chooser){document.querySelectorAll('.gtg-kind-menu:not([hidden])').forEach(menu=>{menu.hidden=true;menu.previousElementSibling?.setAttribute('aria-expanded','false')})}
 if(event.target.closest('.dock [data-tab], [data-a="drawer"]'))setTimeout(schedule,0);
},true);
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.gtg-kind-menu:not([hidden])').forEach(menu=>{menu.hidden=true;menu.previousElementSibling?.setAttribute('aria-expanded','false')})});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
})();
