const fs=require('fs');
const vm=require('vm');
const assert=require('assert/strict');

const social=fs.readFileSync('girls-home-social-hub-v3.js','utf8');
const parity=fs.readFileSync('girls-parity-refresh-20260904.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const returnRefresh=fs.readFileSync('girls-home-poll-return-refresh.js','utf8');
const helper=vm.runInNewContext(`${social.match(/function choosePollState[\s\S]*?\n}/)[0]};choosePollState`);
const polls=[{id:'new'},{id:'old'}];

assert.deepEqual(JSON.parse(JSON.stringify(helper([polls[0]],[],'me'))),{prompt:polls[0],scoreboard:null},'unvoted poll must produce only a prompt');
assert.deepEqual(JSON.parse(JSON.stringify(helper([polls[0]],[{poll_id:'new',voter_user_id:'me'}],'me'))),{prompt:null,scoreboard:polls[0]},'voted poll must produce only a scoreboard');
assert.deepEqual(JSON.parse(JSON.stringify(helper(polls,[{poll_id:'old',voter_user_id:'me'}],'me'))),{prompt:polls[0],scoreboard:polls[1]},'new unvoted poll must coexist with the existing voted scoreboard');
assert(parity.includes('if(homeOwned){document.querySelectorAll(\'.gtg-poll-hero-alert,.gtg-poll-alert\')'),'parity layer must yield Home poll ownership to social hub v3');
assert(!parity.includes('if(free&&latestOpen&&hero)'),'parity layer must never render a voted latest poll as a hero alert');
const html=fs.readFileSync('create-trip.html','utf8');
assert(html.includes('/girls-home-social-hub-v3.js?v=20260914-1'));
assert(!loader.includes('/girls-home-social-hub-v3.js'));
assert(loader.includes('/girls-parity-refresh-20260904.js?v=4'));
assert(loader.includes('/girls-home-poll-return-refresh.js?v=1'),'Home bundle must load the stale-poll return guard');
assert(returnRefresh.includes("closest?.('[data-tab]')"),'return guard must react to trip-tab navigation');
assert(returnRefresh.includes('clearPollUi();'),'return guard must clear stale poll UI before the Home query settles');
assert(returnRefresh.includes("tab.dataset.tab==='overview'"),'Home tab return must request a post-navigation poll refresh');
assert(returnRefresh.includes("document.createComment('gtg-home-poll-return-refresh')"),'Home return refresh must trigger the existing Home observer without a visible DOM element');
assert(returnRefresh.includes('padding:10px 12px 12px!important'),'short mobile Home poll must not retain the old 94px bottom padding');
assert(!returnRefresh.includes("dispatchEvent(new Event('pageshow'))"),'return guard must not fake page lifecycle events');
console.log('PASS Girls Home poll ownership covers prompt-only, scoreboard-only, mixed, iPhone return-refresh and compact mobile states');
