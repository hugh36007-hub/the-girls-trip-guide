(()=>{
'use strict';
if(document.getElementById('gtg-evidence-light-corner-fix'))return;
const s=document.createElement('style');
s.id='gtg-evidence-light-corner-fix';
s.textContent=`
html.gtg-app-light .panel[data-panel="evidence"] .gtg-evidence-summary,
html.gtg-app-light .panel[data-panel="evidence"] section[data-parity-block="evidence"]{
  background:#fff!important;
  border:0!important;
  border-radius:20px!important;
  box-shadow:none!important;
  overflow:hidden!important;
  padding:0!important;
}
html.gtg-app-light .panel[data-panel="evidence"] .gtg-evidence-summary>.gtg-free-evidence,
html.gtg-app-light .panel[data-panel="evidence"] .gtg-free-evidence.card{
  margin:0!important;
  background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;
  border:1.5px solid rgba(255,79,163,.30)!important;
  border-radius:19px!important;
  color:#191316!important;
  box-shadow:0 13px 32px rgba(63,28,46,.06)!important;
  outline:0!important;
  overflow:hidden!important;
}
html.gtg-app-light .panel[data-panel="evidence"] .gtg-free-evidence::before,
html.gtg-app-light .panel[data-panel="evidence"] .gtg-free-evidence::after{
  content:none!important;
  display:none!important;
  background:transparent!important;
  box-shadow:none!important;
}
`;
document.head.appendChild(s);
})();
