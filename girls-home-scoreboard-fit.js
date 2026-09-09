/* Girls Home poll scoreboard fit — compact, contained and clear of dates/chat. */
(()=>{
'use strict';
if(window.__GTG_HOME_SCOREBOARD_FIT__)return;window.__GTG_HOME_SCOREBOARD_FIT__=true;
if(document.getElementById('gtg-home-scoreboard-fit-css'))return;
const style=document.createElement('style');
style.id='gtg-home-scoreboard-fit-css';
style.textContent=`
.dashboard .hero-card .gtg-home-score-v3{
  top:auto!important;
  right:auto!important;
  left:14px!important;
  bottom:82px!important;
  width:min(270px,calc(100% - 28px))!important;
  max-width:270px!important;
  padding:9px 11px!important;
  border-radius:12px!important;
  box-sizing:border-box!important;
  display:block!important;
  overflow:hidden!important;
  background:rgba(255,255,255,.96)!important;
  backdrop-filter:blur(10px)!important;
  box-shadow:0 8px 24px rgba(72,32,52,.12)!important;
}
.dashboard .hero-card .gtg-home-score-v3 small{
  font-size:7.5px!important;
  line-height:1!important;
  letter-spacing:.11em!important;
}
.dashboard .hero-card .gtg-home-score-v3 h3{
  margin:4px 0 5px!important;
  font-size:14px!important;
  line-height:1.05!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
.dashboard .hero-card .gtg-score-v3-row{
  grid-template-columns:minmax(0,1fr) auto!important;
  gap:2px 6px!important;
  margin-top:3px!important;
}
.dashboard .hero-card .gtg-score-v3-row span{
  font-size:9px!important;
  line-height:1.1!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
}
.dashboard .hero-card .gtg-score-v3-row b{
  font-size:8px!important;
  line-height:1.1!important;
  white-space:nowrap!important;
}
.dashboard .hero-card .gtg-score-v3-bar{
  height:3px!important;
  margin-top:1px!important;
}
.dashboard .hero-card .gtg-score-v3-total{
  margin-top:5px!important;
  font-size:7.5px!important;
  line-height:1!important;
}
/* When a result card is present, lift only the left title/meta copy slightly.
   Keep the countdown and Trip Dates stack fixed in place. */
.dashboard .hero-card:has(.gtg-home-score-v3) .hero-meta > :first-child{
  transform:translateY(-10px)!important;
}
@media(max-width:700px){
  .dashboard .hero-card .gtg-home-score-v3{
    left:12px!important;
    bottom:80px!important;
    /* Reserve the complete right-hand date column plus a visible gutter.
       This avoids the iPhone-width corner collision while remaining fluid. */
    width:min(232px,calc(100% - 160px))!important;
    max-width:232px!important;
    padding:8px 10px!important;
  }
  .dashboard .hero-card .gtg-home-score-v3 h3{font-size:13px!important;margin:3px 0 4px!important}
  .dashboard .hero-card .gtg-score-v3-row{margin-top:2px!important}
  /* Give the poll a little more breathing room below the trip name/group line
     without moving the poll toward the chat strip below it. */
  .dashboard .hero-card:has(.gtg-home-score-v3) .hero-meta > :first-child{
    transform:translateY(-18px)!important;
  }
}
@media(max-width:380px){
  .dashboard .hero-card .gtg-home-score-v3{
    width:calc(100% - 158px)!important;
    max-width:218px!important;
  }
}
`;
document.head.appendChild(style);
})();
