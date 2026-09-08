const fs=require('fs');
const vm=require('vm');
const assert=require('assert/strict');

const social=fs.readFileSync('girls-home-social-hub-v3.js','utf8');
const parity=fs.readFileSync('girls-parity-refresh-20260904.js','utf8');
const loader=fs.readFileSync('girls-critical-style-loader.js','utf8');
const helper=vm.runInNewContext(`${social.match(/function choosePollState[\s\S]*?\n}/)[0]};choosePollState`);
const polls=[{id:'new'},{id:'old'}];

assert.deepEqual(JSON.parse(JSON.stringify(helper([polls[0]],[],'me'))),{prompt:polls[0],scoreboard:null},'unvoted poll must produce only a prompt');
assert.deepEqual(JSON.parse(JSON.stringify(helper([polls[0]],[{poll_id:'new',voter_user_id:'me'}],'me'))),{prompt:null,scoreboard:polls[0]},'voted poll must produce only a scoreboard');
assert.deepEqual(JSON.parse(JSON.stringify(helper(polls,[{poll_id:'old',voter_user_id:'me'}],'me'))),{prompt:polls[0],scoreboard:polls[1]},'new unvoted poll must coexist with the existing voted scoreboard');
assert(parity.includes('if(homeOwned){document.querySelectorAll(\'.gtg-poll-hero-alert,.gtg-poll-alert\')'),'parity layer must yield Home poll ownership to social hub v3');
assert(!parity.includes('if(free&&latestOpen&&hero)'),'parity layer must never render a voted latest poll as a hero alert');
assert(loader.includes('/girls-home-social-hub-v3.js?v=20260908-4'));
assert(loader.includes('/girls-parity-refresh-20260904.js?v=4'));
console.log('PASS Girls Home poll ownership covers prompt-only, scoreboard-only and mixed states');
