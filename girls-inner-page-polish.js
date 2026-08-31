/* Final mobile hierarchy polish for the Girls private app. Presentation/DOM order only. */
(()=>{
'use strict';
if(window.__GTG_INNER_PAGE_POLISH__)return;window.__GTG_INNER_PAGE_POLISH__=true;
let queued=false;
const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;polish()})};

function activePanel(){return document.querySelector('.dashboard .panel.active')}
function placeSummary(panel){
 const head=panel?.querySelector(':scope > .section-head');
 const summary=panel?.querySelector(':scope > [data-parity-block]');
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
  if(tools&&!tools.querySelector('button'))tools.remove();
 }
}

function drawerClose(){
 const wrap=document.getElementById('drawerRoot');
 const drawer=wrap?.querySelector('.drawer');
 if(!wrap?.classList.contains('open')||!drawer||drawer.querySelector('.gtg-drawer-close-top'))return;
 const button=document.createElement('button');
 button.type='button';button.className='gtg-drawer-close-top';button.setAttribute('aria-label','Close trip menu');button.textContent='×';
 button.addEventListener('click',()=>{
  const existing=[...drawer.querySelectorAll('button')].find(el=>(el.textContent||'').trim().toLowerCase()==='close');
  if(existing)existing.click();else wrap.classList.remove('open');
 });
 drawer.appendChild(button);
}

function polish(){
 placeSummary(activePanel());
 drawerClose();
}

const app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
const drawer=document.getElementById('drawerRoot');if(drawer)new MutationObserver(schedule).observe(drawer,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
window.addEventListener('popstate',schedule);
document.addEventListener('click',event=>{if(event.target.closest('.dock [data-tab], [data-a="drawer"]'))setTimeout(schedule,0)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
})();
