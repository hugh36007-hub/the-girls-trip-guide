(() => {
  'use strict';

  const allowed = new Set(['overview','plan','money','evidence','group']);

  function currentTab(){
    const active = document.querySelector('.dock [data-tab].active');
    if(active?.dataset?.tab && allowed.has(active.dataset.tab)) return active.dataset.tab;
    const action = new URL(location.href).searchParams.get('action') || 'overview';
    return allowed.has(action) ? action : 'overview';
  }

  function syncLayout(){
    const dashboard = document.querySelector('.dashboard');
    if(!dashboard) return;
    const tab = currentTab();
    dashboard.classList.toggle('section-workspace', tab !== 'overview');
    dashboard.dataset.activeSection = tab;
  }

  document.addEventListener('click', event => {
    const tabButton = event.target.closest('[data-tab]');
    if(!tabButton) return;
    requestAnimationFrame(syncLayout);
  }, true);

  window.addEventListener('popstate', () => requestAnimationFrame(syncLayout));

  const app = document.getElementById('app');
  if(app){
    const observer = new MutationObserver(() => requestAnimationFrame(syncLayout));
    observer.observe(app, {childList:true, subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncLayout, {once:true});
  else syncLayout();
})();
