const fs=require('fs');
const vm=require('vm');
const assert=require('assert/strict');

const source=fs.readFileSync('girls-fx-expenses-fixed.js','utf8');
const feedback=fs.readFileSync('girls-action-feedback.js','utf8');

const modal={querySelector(){return null}};
const document={
  head:{appendChild(){}},
  documentElement:{},
  getElementById(id){if(id==='modalRoot')return modal;if(id==='gtg-fx-expense-css')return null;if(id==='toast')return {classList:{add(){},remove(){}}};return null},
  createElement(){return {id:'',textContent:'',className:'',dataset:{},classList:{add(){},remove(){}}}},
  querySelector(){return null},
  querySelectorAll(){return[]},
  addEventListener(){}
};
class MutationObserver{observe(){}}
class HTMLFormElement{}
const window={__GTG_FX_TEST__:true,addEventListener(){}};
const context={window,document,MutationObserver,HTMLFormElement,location:{href:'https://thegirlstripguide.com/create-trip?trip_id=dc81b495-65fb-41a6-9dbf-2eb5572ab18e'},URL,Intl,console,Map,Set,Date,Number,String,Promise,FormData:class{},fetch:async()=>({ok:true,json:async()=>({rate:.85})}),setTimeout(){return 1},clearTimeout(){},queueMicrotask(){},requestAnimationFrame(fn){if(fn)fn()}};
context.globalThis=context;
vm.runInNewContext(source,context,{filename:'girls-fx-expenses-fixed.js'});

const hooks=window.__GTG_FX_TEST_HOOKS__;
assert(hooks,'Corrected FX runtime must expose test hooks');
assert.equal(hooks.tripId(),'dc81b495-65fb-41a6-9dbf-2eb5572ab18e','tripId must execute with the native URL constructor');
assert.equal(hooks.inferCurrency('Ibiza'),'EUR','Ibiza must resolve to EUR');
assert(!/const\s+URL\s*=/.test(source),'FX runtime must not shadow the native URL constructor');
assert(source.includes('new globalThis.URL(location.href)'),'tripId must explicitly use the global URL constructor');
assert(feedback.includes("window.__GTG_FX_EXPENSES__ = true"),'Broken legacy FX runtime must be disabled before it executes');
assert(feedback.includes('/girls-fx-expenses-fixed.js?v=20260915-1'),'Corrected FX runtime must be loaded by the early core layer');
console.log('PASS Girls FX URL constructor and corrected runtime bootstrap');
