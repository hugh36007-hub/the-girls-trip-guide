const fs=require('fs');
const vm=require('vm');
const assert=require('assert/strict');

const source=fs.readFileSync('girls-fx-expenses.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const dateFlow=fs.readFileSync('girls-date-flow.js','utf8');

const listeners={};
const modal={querySelector(){return null},classList:{add(){}},innerHTML:''};
const document={
  head:{appendChild(){}},
  addEventListener(type,fn){(listeners[type]??=[]).push(fn)},
  getElementById(id){
    if(id==='modalRoot')return modal;
    if(id==='gtg-fx-expense-css')return null;
    if(id==='toast')return {textContent:'',classList:{add(){},remove(){}}};
    return null;
  },
  createElement(){return {id:'',textContent:'',dataset:{},classList:{add(){},remove(){}}}},
  querySelector(){return null}
};
class MutationObserver{observe(){}}
class HTMLFormElement{}
const window={__GTG_FX_TEST__:true,addEventListener(){}};
const context={
  window,document,MutationObserver,HTMLFormElement,
  location:{href:'https://thegirlstripguide.com/create-trip?trip_id=dc81b495-65fb-41a6-9dbf-2eb5572ab18e'},
  URL,Intl,console,Map,Set,Date,Number,String,Promise,
  setTimeout(){return 1},clearTimeout(){},queueMicrotask(){},requestAnimationFrame(fn){if(typeof fn==='function')fn()},
  fetch:async()=>({ok:true,json:async()=>({rate:.85,rate_date:'2026-09-15',source:'Test',gbp_amount:85})}),
  FormData:class{}
};
context.globalThis=context;
vm.runInNewContext(source,context,{filename:'girls-fx-expenses.js'});

const hooks=window.__GTG_FX_TEST_HOOKS__;
assert(hooks,'FX runtime must expose test hooks in test mode');
assert.equal(hooks.inferCurrency('Ibiza, Spain'),'EUR','Ibiza must default to EUR');
const markup=hooks.expenseMarkup({destination:'Ibiza',currency:'GBP',currency_override:false},[
  {id:'m1',name:'Hugh'},
  {id:'m2',name:'Hugh Storystone'}
]);
const order=['What was it?','Currency','Amount (EUR)','Paid by','Split between','Save'].map(x=>markup.indexOf(x));
assert(order.every(x=>x>=0),'Add Expense must render every required control');
for(let i=1;i<order.length;i++)assert(order[i]>order[i-1],`Add Expense control order is wrong at index ${i}`);
assert(markup.includes('data-gtg-fx-native="1"')&&markup.includes('data-gtg-fx-ready="1"'),'FX form must be native and ready when shown');
assert.equal((markup.match(/>Hugh<\/span>/g)||[]).length,1,'Hugh must appear once in visible split list');
assert.equal((markup.match(/>Hugh Storystone<\/span>/g)||[]).length,1,'Hugh Storystone must appear once in visible split list');
assert(markup.includes('Enter the amount to see the GBP equivalent.'),'Conversion preview must be visible before entry');

assert(source.includes("save_girls_expense_fx"),'FX-aware save RPC must own Add Expense');
assert(source.includes('p_local_amount:amount')&&source.includes('p_gbp_rate:fx.rate')&&source.includes('p_rate_date:fx.rate_date'),'Save must persist local amount and locked FX metadata');
assert(!/\.rpc\(['\"]save_expense['\"]/.test(source),'Native FX form must not fall through to legacy save_expense');
assert(source.includes("[data-a=\"addExpense\"]")&&source.includes('stopImmediatePropagation()'),'FX runtime must intercept Add Expense before the legacy renderer');

const appPos=html.indexOf('/girls-app-v2.js?v=7');
const fxPos=html.indexOf('/girls-fx-expenses.js?v=4');
const datePos=html.indexOf('/girls-date-flow.js?v=6');
assert(appPos>=0&&fxPos>appPos&&datePos>fxPos,'FX runtime must load directly after app core and before form enhancers');
assert(dateFlow.includes('dedupePeopleOptions(people)')&&dateFlow.includes('const rendered=new Set()'),'Split checkbox renderer must dedupe member IDs before visible rows are built');

console.log('PASS Girls FX runtime: native visible controls, Ibiza EUR default, FX save ownership, and split dedupe');
