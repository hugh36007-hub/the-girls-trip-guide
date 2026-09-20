const fs=require('fs');
const src=fs.readFileSync('girls-dashboard-tour.js','utf8');

const checks=[
  ["stable first-tour dismissal key", "stableKey=(kind,r=role())=>\`gtg:dashboard-tour:\${kind}:\${tripId()}:\${r}\`"],
  ["legacy dismissal migration", "legacyFirstDone('free',r)||legacyFirstDone('full',r)"],
  ["persist first dismissal independently of tier/version", "set(stableKey('first',r))"],
  ["persist upgrade dismissal independently of version", "set(stableKey('upgrade',r))"],
  ["manual replay remains available", "window.GTGDashboardTour={start:replay}"],
  ["manual replay closes drawer before starting", "drawer.classList.remove('open');requestAnimationFrame(()=>requestAnimationFrame(replay))"]
];
for(const [name,marker] of checks){
  if(!src.includes(marker))throw new Error(`Missing dashboard tour contract: ${name}`);
}
if(src.includes("const firstDone=(t=tier(),r=role())"))throw new Error('First-tour dismissal must not remain tier-scoped.');
console.log('Girls dashboard tour persistence contract OK');
