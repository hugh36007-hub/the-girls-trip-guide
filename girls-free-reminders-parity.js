/* Girls Free reminders: behavior only. Styling lives in girls-free-reminders-parity.css. */
(()=>{
'use strict';
if(window.__GTG_FREE_REMINDERS_PARITY_V3__)return;
window.__GTG_FREE_REMINDERS_PARITY_V3__=true;

/* Remove the old dynamically injected stylesheet if an earlier cached script created it. */
document.getElementById('gtg-free-reminders-parity-css')?.remove();

const REMINDERS=[
 {code:'F01',title:'Group still missing',trigger:'When nobody else has joined'},
 {code:'F02',title:'Booking details missing',trigger:'When a booking is incomplete'},
 {code:'F03',title:'Payment due',trigger:'When a trip payment is due'},
 {code:'F04',title:'Seven days to go',trigger:'One week before departure'},
 {code:'F05',title:'Final check',trigger:'The day before departure'},
 {code:'F06',title:'Expense incomplete',trigger:'When an expense is incomplete'},
 {code:'F07',title:'Money still unsettled',trigger:'After the trip'}
];

let locked=false;
let lockedScrollY=0;

function isReminderModal(modal){
 return !!(modal?.querySelector?.('.gtg-reminders')&&/trip reminders|standard reminders/i.test(modal.textContent||''));
}

function setScrollLock(on){
 if(on===locked)return;
 locked=on;
 if(on){
   lockedScrollY=window.scrollY||window.pageYOffset||0;
   document.documentElement.classList.add('gtg-reminder-scroll-lock');
   document.body?.classList.add('gtg-reminder-scroll-lock');
   if(document.body){
     document.body.dataset.gtgReminderScrollY=String(lockedScrollY);
     document.body.style.top=`-${lockedScrollY}px`;
   }
   return;
 }
 document.documentElement.classList.remove('gtg-reminder-scroll-lock');
 if(document.body){
   document.body.classList.remove('gtg-reminder-scroll-lock');
   document.body.style.top='';
   delete document.body.dataset.gtgReminderScrollY;
 }
 window.scrollTo(0,lockedScrollY);
}

function addClose(modal){
 if(modal.querySelector('.gtg-reminder-x'))return;
 const b=document.createElement('button');
 b.type='button';
 b.className='gtg-reminder-x';
 b.dataset.parityClose='';
 b.dataset.a='close';
 b.setAttribute('aria-label','Close trip reminders');
 b.textContent='×';
 modal.prepend(b);
}

function normaliseRows(list){
 const buttons=[...list.querySelectorAll(':scope > button')].slice(0,REMINDERS.length);
 buttons.forEach((button,index)=>{
   const row=REMINDERS[index];
   if(!row)return;
   button.dataset.gtgReminderRow='1';
   button.innerHTML=`<span class="gtg-reminder-code">${row.code}</span><div class="gtg-reminder-copy"><b>${row.title}</b><small>${row.trigger}</small></div><em class="gtg-reminder-status">Included</em>`;
 });
}

function enhanceList(modal){
 modal.classList.add('gtg-free-reminders-modal');
 addClose(modal);

 const head=modal.querySelector('.gtg-modal-head');
 if(head&&!head.dataset.gtgReminderEnhanced){
   head.dataset.gtgReminderEnhanced='1';
   const eyebrow=head.querySelector('.eyebrow');
   if(eyebrow)eyebrow.textContent='The standard arrangement';
   const h2=head.querySelector('h2');
   if(h2)h2.innerHTML='A few useful <span>words.</span>';
   const p=head.querySelector('p');
   if(p)p.textContent='Free includes seven practical reminders. No GALS characters, no commentary — just the essentials.';
   const count=head.querySelector('.gtg-reminder-count');
   if(count)count.innerHTML='<strong>7</strong><span>standard reminders</span>';
 }

 const list=modal.querySelector('.gtg-reminders');
 if(list){
   normaliseRows(list);
   if(!modal.querySelector('.gtg-reminders-section-head')){
     const section=document.createElement('div');
     section.className='gtg-reminders-section-head';
     section.innerHTML='<div><div class="eyebrow">Included with Free</div><h3>Standard reminders</h3><p>Enough to keep the essentials visible. Full Trip adds the GALS and the richer message system.</p></div><button type="button" class="btn primary" data-parity-existing="upgrade">See Full Trip →</button>';
     list.before(section);
   }
 }

 const upgrade=modal.querySelector('.gtg-upgrade-comparison');
 if(upgrade&&!upgrade.dataset.gtgReminderEnhanced){
   upgrade.dataset.gtgReminderEnhanced='1';
   const eyebrow=upgrade.querySelector('.eyebrow');
   if(eyebrow)eyebrow.textContent='Full Trip';
   const h3=upgrade.querySelector('h3');
   if(h3)h3.textContent='Bring in the GALS.';
   const p=upgrade.querySelector('p');
   if(p)p.textContent='Full Trip adds 39 trip messages, Grace, Ava, Lola and Seb, richer prompts, Evidence and Hidden Gallery.';
   const button=upgrade.querySelector('[data-parity-existing="upgrade"]');
   if(button)button.textContent='Compare Free vs Full →';
 }
}

function enhancePreview(modal){
 addClose(modal);
}

function sync(){
 const root=document.getElementById('modalRoot');
 if(!root){setScrollLock(false);return;}
 const modal=root.querySelector(':scope > .modal');
 const listOpen=isReminderModal(modal);
 const previewOpen=!!modal?.classList.contains('gtg-reminder-preview');
 const active=listOpen||previewOpen;
 root.classList.toggle('gtg-reminder-experience',active);
 setScrollLock(active);
 if(listOpen)enhanceList(modal);
 else if(previewOpen)enhancePreview(modal);
}

const root=document.getElementById('modalRoot');
if(root)new MutationObserver(sync).observe(root,{childList:true,subtree:true});

document.addEventListener('click',event=>{
 if(event.target.closest?.('[data-parity-reminders],[data-parity-preview],[data-parity-close],[data-a="close"]'))setTimeout(sync,0);
},true);

window.addEventListener('pagehide',()=>setScrollLock(false));
sync();
})();
