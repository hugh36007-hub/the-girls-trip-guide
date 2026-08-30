(() => {
  'use strict';
  const KEY='gtg-evidence-intro-dismissed-v1';
  const mobile=()=>window.matchMedia?.('(max-width: 700px)').matches!==false;
  const dismissed=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}};
  const save=()=>{try{localStorage.setItem(KEY,'1')}catch{}};

  function enhance(){
    if(!mobile())return;
    const heads=[...document.querySelectorAll('#tab-content .section-head,[data-panel="evidence"] .section-head')];
    const head=heads.find(node=>/evidence/i.test(node.querySelector('h2')?.textContent||''));
    if(!head)return;
    const left=head.firstElementChild;
    const copy=left?.querySelector(':scope > p');
    if(!left||!copy)return;

    if(dismissed()){
      copy.hidden=true;
      left.querySelector('.evidence-intro-dismiss')?.remove();
      return;
    }
    if(left.querySelector('.evidence-intro-dismiss'))return;

    const row=document.createElement('div');
    row.className='evidence-intro-dismiss';
    copy.before(row);
    row.appendChild(copy);

    const close=document.createElement('button');
    close.type='button';
    close.className='evidence-intro-dismiss-close';
    close.setAttribute('aria-label','Hide Evidence introduction');
    close.textContent='×';
    close.addEventListener('click',()=>{
      save();
      row.remove();
    });
    row.appendChild(close);
  }

  const style=document.createElement('style');
  style.textContent=`
    @media(max-width:700px){
      .evidence-intro-dismiss{display:grid;grid-template-columns:minmax(0,1fr) 42px;gap:8px;align-items:start;margin-top:5px}
      .evidence-intro-dismiss>p{margin:0!important;min-width:0}
      .evidence-intro-dismiss-close{width:38px;height:38px;margin:-5px -5px 0 0;padding:0;border:1px solid rgba(255,255,255,.16);border-radius:50%;background:rgba(0,0,0,.18);color:inherit;font-size:24px;line-height:1;display:grid;place-items:center;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
      .evidence-intro-dismiss-close:active{transform:scale(.96)}
    }`;
  document.head.appendChild(style);

  const observer=new MutationObserver(enhance);
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  window.addEventListener('resize',enhance,{passive:true});
  requestAnimationFrame(enhance);
})();
