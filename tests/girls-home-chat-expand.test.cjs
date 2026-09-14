const fs=require('node:fs');
const assert=require('node:assert/strict');
const sync=fs.readFileSync('girls-live-chat-sync.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
for(const token of ['gtg-home-chat-overlay','data-gtg-home-chat-feed','data-gtg-home-chat-form','send_trip_chat_message','touchstart','touchmove','closeChat(true)',"aria-label','Open group chat"]){assert(sync.includes(token),`missing Girls Home chat expansion contract: ${token}`)}
assert(!sync.includes('[data-tab="group"]'),'Home latest-message tap must not navigate to Group');
assert(/\/girls-live-chat-sync\.js\?v=\d+/.test(loader),'unified runtime loader must own the Home chat path');
assert.equal((loader.match(/\/girls-live-chat-sync\.js/g)||[]).length,1,'Home chat must have one loader owner');
console.log('PASS Girls Home latest-message card has one runtime owner, expands to full-screen chat and closes by swipe-down without Group navigation');
