const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('girls-chat-visibility-stability-fix.js','utf8');

assert.match(src,/\[data-gtg-chat-feed\]/,'swipe dismissal must start from the chat feed');
assert.match(src,/feed\.scrollTop>1/,'normal feed scrolling must not be hijacked away from the top');
assert.match(src,/dy>82/,'downward swipe must use an intentional close threshold');
assert.match(src,/\[data-gtg-chat-close\]/,'successful swipe must use the existing chat close path');
assert.match(src,/touchmove[\s\S]*passive:false/,'touch move must be cancelable so Android\/iOS overscroll does not win');

console.log('Girls chat swipe-dismiss regression checks passed.');
