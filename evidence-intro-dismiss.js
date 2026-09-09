(() => {
  'use strict';
  const KEY='gtg-evidence-gallery-guide-dismissed-v1';
  const dismissed=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}};
  const save=()=>{try{localStorage.setItem(KEY,'1')}catch{}};

  function enhance(){
    const panel=document.querySelector('[data-panel="evidence"].active');
    const head=panel?.querySelector(':scope > .section-head');
    if(!panel||!head)return;

    if(dismissed()){
      panel.querySelector('.evidence-intro-dismiss')?.remove();
      return;
    }
    if(panel.querySelector('.evidence-intro-dismiss'))return;

    const banner=document.createElement('aside');
    banner.className='evidence-intro-dismiss';
    banner.setAttribute('role','status');
    banner.innerHTML='<div><b>Two separate galleries</b><p>Evidence is visible to everyone confirmed on the trip. Hidden Gallery is separate: the first time the organiser opens it, they will be asked to create the 4-digit trip PIN. Members can add hidden photos without the PIN, but the PIN is required to open, view or manage them. Hidden photos never appear in Evidence or on Home.</p></div>';

    const close=document.createElement('button');
    close.type='button';
    close.className='evidence-intro-dismiss-close';
    close.setAttribute('aria-label','Hide Evidence introduction');
    close.textContent='×';
    close.addEventListener('click',()=>{
      save();
      banner.remove();
    });
    banner.appendChild(close);
    head.insertAdjacentElement('afterend',banner);
  }

  const style=document.createElement('style');
  style.textContent=`
    .evidence-intro-dismiss{display:grid;grid-template-columns:minmax(0,1fr) 42px;gap:12px;align-items:start;margin:0 0 18px;padding:16px 14px 16px 16px;border:1px solid rgba(234,43,143,.24);border-radius:18px;background:linear-gradient(145deg,#fffafd,#fbe7f1);color:#2c2027;box-shadow:0 10px 28px rgba(95,31,68,.08)}
    .evidence-intro-dismiss>div{display:grid;gap:6px;min-width:0}
    .evidence-intro-dismiss b{color:#d91f82;font:800 14px/1.2 Inter,sans-serif;text-transform:uppercase;letter-spacing:.08em}
    .evidence-intro-dismiss p{margin:0!important;color:#614b57!important;font:500 13px/1.55 Inter,sans-serif}
    .evidence-intro-dismiss-close{width:38px;height:38px;margin:-4px -2px 0 0;padding:0;border:1px solid rgba(217,31,130,.28);border-radius:50%;background:rgba(255,255,255,.76);color:#b51b70;font-size:24px;line-height:1;display:grid;place-items:center;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .evidence-intro-dismiss-close:active{transform:scale(.96)}`;
  document.head.appendChild(style);

  const observer=new MutationObserver(enhance);
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  window.addEventListener('resize',enhance,{passive:true});
  requestAnimationFrame(enhance);
})();
