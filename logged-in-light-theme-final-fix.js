(()=>{
'use strict';
if(document.getElementById('gtg-auth-light-final-fix'))return;
const style=document.createElement('style');
style.id='gtg-auth-light-final-fix';
style.textContent=`
/* Final authenticated light-theme cleanup. Keep dark only where it is deliberate media/photography. */
html.gtg-app-light .gtg-plan-summary,
html.gtg-app-light .gtg-money-summary,
html.gtg-app-light .gtg-group-summary,
html.gtg-app-light .gtg-evidence-summary,
html.gtg-app-light .gtg-parity-overview,
html.gtg-app-light section[data-parity-block]{
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
  color:#191316!important;
}

html.gtg-app-light .gtg-overview-strip,
html.gtg-app-light .gtg-money-strip,
html.gtg-app-light .gtg-plan-categories{
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
  overflow:visible!important;
}

html.gtg-app-light .gtg-overview-strip>span,
html.gtg-app-light .gtg-money-strip>span,
html.gtg-app-light .gtg-plan-categories>button{
  background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;
  border:1.5px solid rgba(255,79,163,.30)!important;
  color:#191316!important;
  box-shadow:0 13px 32px rgba(63,28,46,.06)!important;
}
html.gtg-app-light .gtg-overview-strip b,
html.gtg-app-light .gtg-money-strip b,
html.gtg-app-light .gtg-plan-categories b{color:#191316!important}
html.gtg-app-light .gtg-overview-strip small,
html.gtg-app-light .gtg-money-strip small,
html.gtg-app-light .gtg-plan-categories small{color:#75636c!important}
html.gtg-app-light .gtg-plan-categories span{color:#ed2f8b!important}

/* Money only renders two owner summary cells: do not leave a legacy dark third column. */
html.gtg-app-light .gtg-money-strip{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important}

/* Payment nudges belong to the same card system. */
html.gtg-app-light .gtg-payment-nudges,
html.gtg-app-light .gtg-nudge-grid{background:transparent!important}
html.gtg-app-light .gtg-payment-nudges-head h3{color:#191316!important}
html.gtg-app-light .gtg-payment-nudges-head p,
html.gtg-app-light .gtg-nudge-card small{color:#75636c!important}
html.gtg-app-light .gtg-nudge-card{
  background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;
  border:1.5px solid rgba(255,79,163,.30)!important;
  color:#191316!important;
  box-shadow:0 13px 32px rgba(63,28,46,.06)!important;
}
html.gtg-app-light .gtg-nudge-card strong{color:#ed2f8b!important}
html.gtg-app-light .gtg-nudge-note{
  background:#fff6fa!important;
  border-color:rgba(255,79,163,.30)!important;
  color:#66535d!important;
}

/* Evidence: remove the dark backing rectangle that shows through rounded corners. */
html.gtg-app-light .gtg-evidence-summary{overflow:visible!important}
html.gtg-app-light .gtg-free-evidence{
  position:relative!important;
  background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;
  border:1.5px solid rgba(255,79,163,.30)!important;
  color:#191316!important;
  box-shadow:0 13px 32px rgba(63,28,46,.06)!important;
  overflow:hidden!important;
}
html.gtg-app-light .gtg-free-evidence::before,
html.gtg-app-light .gtg-free-evidence::after{content:none!important;display:none!important;background:none!important}
html.gtg-app-light .gtg-free-evidence h2{color:#191316!important}
html.gtg-app-light .gtg-free-evidence p{color:#62515a!important}

/* Do not let old parity backgrounds peek through between rounded children. */
html.gtg-app-light .gtg-group-summary>.gtg-overview-strip,
html.gtg-app-light .gtg-money-summary>.gtg-money-strip,
html.gtg-app-light .gtg-evidence-summary>.gtg-overview-strip,
html.gtg-app-light .gtg-plan-summary>.gtg-plan-categories{padding:0!important}

@media(max-width:650px){
  html.gtg-app-light .gtg-money-strip{grid-template-columns:1fr!important}
}
`;
document.head.appendChild(style);
})();
