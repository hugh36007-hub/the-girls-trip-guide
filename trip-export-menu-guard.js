(()=>{
'use strict';
if(window.__TRIP_EXPORT_MENU_GUARD__)return;window.__TRIP_EXPORT_MENU_GUARD__=true;

function normaliseExportButtons(root=document){
  const lists=[...root.querySelectorAll?.('.drawer-list')||[]];
  for(const list of lists){
    const buttons=[...list.querySelectorAll('[data-trip-export]')];
    if(buttons.length<=1)continue;
    buttons.slice(1).forEach(button=>button.remove());
  }
}

const observer=new MutationObserver(records=>{
  for(const record of records){
    const target=record.target instanceof Element?record.target:record.target?.parentElement;
    if(!target)continue;
    const list=target.matches?.('.drawer-list')?target:target.closest?.('.drawer-list');
    if(list){normaliseExportButtons(list.parentElement||document);return;}
    for(const node of record.addedNodes){
      if(!(node instanceof Element))continue;
      if(node.matches?.('.drawer-list,[data-trip-export]')||node.querySelector?.('.drawer-list,[data-trip-export]')){
        normaliseExportButtons(document);return;
      }
    }
  }
});

observer.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('pointerdown',event=>{
  if(event.target.closest?.('[data-action="menu"],[data-a="drawer"]'))queueMicrotask(()=>normaliseExportButtons(document));
},{capture:true,passive:true});
normaliseExportButtons(document);
})();
