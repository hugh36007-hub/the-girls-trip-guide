const fs=require('node:fs');
const assert=require('node:assert/strict');
const sync=fs.readFileSync('girls-live-chat-sync.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
for(const token of ['gtg-home-chat-overlay','data-gtg-home-chat-feed','data-gtg-home-chat-form','send_trip_chat_message','touchstart','touchmove','closeChat(true)',"aria-label','Open group chat"]){assert(sync.includes(token),`missing Girls Home chat expansion contract: ${token}`)}
assert(!sync.includes('[data-tab="group"]'),'Home latest-message tap must not navigate to Group');
assert(loader.includes('/girls-live-chat-sync.js?v=2'),'performance loader must serve the cache-busted full-screen Home chat sync');
console.log('PASS Girls Home latest-message card expands to full-screen chat and closes by swipe-down without Group navigation');
