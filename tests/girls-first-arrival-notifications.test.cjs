const fs=require('fs');
const assert=require('assert');

const tour=fs.readFileSync('girls-dashboard-tour.js','utf8');
const push=fs.readFileSync('girls-push-notifications.js','utf8');
const nativePush=fs.readFileSync('native-push.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert(tour.includes("firstArrival=Boolean(mark&&!forced&&currentKind==='first')"),'first-arrival prompt must only follow the genuine first tour, not manual replay');
assert(tour.includes("new CustomEvent('gtg:dashboard-tour-finished'"),'first tour must signal completion after it closes');

for(const token of [
  "FIRST_PROMPT='gtg-push-first-arrival-prompt-v1'",
  "window.addEventListener('gtg:dashboard-tour-finished'",
  'Turn on trip notifications?',
  'Turn on notifications',
  'Not now',
  'data-first-push-enable',
  "localStorage.setItem(FIRST_PROMPT,'1')"
]) assert(push.includes(token),`Missing web first-arrival notification contract: ${token}`);

const webPrompt=push.slice(push.indexOf('async function showFirstArrivalPrompt'),push.indexOf('function scheduleProfileCheck'));
assert(!webPrompt.includes('Notification.requestPermission'),'system notification permission must not be requested merely by showing the onboarding prompt');
assert(push.includes("button.addEventListener('click'"),'notification enable action must remain behind a user click');
assert(push.includes('void enable().then('),'notification enable action must call the existing registration path');

for(const token of [
  "firstPromptKey = 'gtg-native-push-first-arrival-prompt-v1'",
  "window.addEventListener('gtg:dashboard-tour-finished'",
  'Turn on trip notifications?',
  'data-native-first-push-enable',
  'void enable().then('
]) assert(nativePush.includes(token),`Missing native first-arrival notification contract: ${token}`);

assert(loader.includes("'/girls-push-notifications.js?v=2'"),'web push onboarding cache generation must be current');
assert(loader.includes("dashboardTour:['/girls-dashboard-tour.js?v=4']"),'tour cache generation must be current');
assert(html.includes('/girls-performance-loader.js?v=28'),'create-trip must load the current performance loader generation');
assert(sw.includes("gtg-pwa-v48-travel-documents-light"),'PWA cache generation must advance with onboarding behavior');
assert(sw.includes("'/girls-performance-loader.js?v=28'"),'PWA app shell must cache the current performance loader');

console.log('Girls first-arrival notifications contract OK');
