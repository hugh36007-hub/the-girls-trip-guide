import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tour=readFileSync(new URL('../girls-dashboard-onboarding.js',import.meta.url),'utf8');
const bridge=readFileSync(new URL('../girls-supabase-auth-bridge.js',import.meta.url),'utf8');
const host=readFileSync(new URL('../girls-user-facing-wording.js',import.meta.url),'utf8');

test('first-dashboard tour covers the four core areas',()=>{
  for(const label of ['The Plan','Money','The Group','Evidence'])assert.ok(tour.includes(`title:'${label}'`),`missing ${label}`);
  for(const target of ['data-tab="plan"','data-tab="money"','data-tab="group"','data-tab="evidence"'])assert.ok(tour.includes(target),`missing ${target}`);
  assert.match(tour,/FIRST TIME HERE · QUICK TOUR/);
});

test('Full Trip gets a separate enhanced tour',()=>{
  for(const label of ['Full Trip is live','Photos & video','Hidden Gallery','Grace & the GALS'])assert.ok(tour.includes(`title:'${label}'`),`missing ${label}`);
  assert.match(tour,/dataset\.homeComposition==='full'/);
  assert.match(tour,/FULL TRIP · QUICK TOUR/);
});

test('completion is account-level with a local per-account fallback',()=>{
  assert.match(tour,/gtg_dashboard_intro_v1/);
  assert.match(tour,/gtg_full_intro_v1/);
  assert.match(tour,/auth\.updateUser\(\{data:next\}\)/);
  assert.match(tour,/localStorage\.setItem\(localKey\(key,user\.id\),'1'\)/);
});

test('Girls auth bridge exposes the existing cached authenticated client',()=>{
  assert.match(bridge,/window\.GTGAuthClient=existing/);
  assert.match(bridge,/window\.GTGAuthClient=client/);
});

test('tour has explicit controls and existing Girls app loads it',()=>{
  for(const text of ['Skip tour','Back','Next','Done'])assert.ok(tour.includes(text),`missing ${text}`);
  assert.match(host,/girls-dashboard-onboarding\.js\?v=1/);
  assert.match(host,/data-gtg-dashboard-onboarding/);
});
