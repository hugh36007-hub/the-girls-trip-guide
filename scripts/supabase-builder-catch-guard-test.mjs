/* Static guard: supabase-js PostgREST query builders are thenables with `then` but no
 * `catch`, so `db.from(t).update(...).eq(...).catch(...)` throws a TypeError before the
 * request is sent. Fails if any app source chains `.catch(` directly onto a builder from
 * `.from(t).select|insert|update|upsert|delete(...)` or `.rpc(...)`. Storage calls and
 * builder chains that pass through `.then(`/`.finally(` return real Promises and are allowed.
 * Use `try{const {error}=await builder}catch{}` instead. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', 'scripts', 'tests', 'audit', 'android', 'ios', 'mobile-web', 'dist', '.native-push-package']);
const SOURCE = /\.(js|mjs|cjs|ts|tsx|html)$/;

function sourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory()) { if (!SKIP_DIRS.has(entry.name)) sourceFiles(path.join(dir, entry.name), out); }
    else if (SOURCE.test(entry.name)) out.push(path.join(dir, entry.name));
  }
  return out;
}

// Walk backwards from `end` over a member/call chain (identifiers, dots, balanced
// (...) / [...] groups, string literals) and return where the chain starts.
function chainStart(s, end) {
  let j = end;
  for (;;) {
    let k = j - 1;
    while (k >= 0 && /\s/.test(s[k])) k--;
    if (s[k] === ')' || s[k] === ']') {
      let depth = 0;
      for (; k >= 0; k--) {
        const c = s[k];
        if (c === "'" || c === '"' || c === '`') { k--; while (k >= 0 && !(s[k] === c && s[k - 1] !== '\\')) k--; continue; }
        if (c === ')' || c === ']' || c === '}') depth++;
        else if ((c === '(' || c === '[' || c === '{') && --depth === 0) break;
      }
      j = k;
      continue;
    }
    if (/[\w$]/.test(s[k])) {
      let m = k;
      while (m >= 0 && /[\w$]/.test(s[m])) m--;
      if (['await', 'return', 'void', 'typeof', 'yield', 'new'].includes(s.slice(m + 1, k + 1))) return k + 1;
      j = m + 1;
      let p = m;
      while (p >= 0 && /\s/.test(s[p])) p--;
      if (s[p] === '.') { j = s[p - 1] === '?' ? p - 1 : p; continue; }
      return j;
    }
    return j;
  }
}

// Keep only the chain's own calls: empty every (...) / [...] / {...} group so queries
// made inside an argument or an async function body are not mistaken for the receiver.
function ownCalls(chain) {
  let out = '', depth = 0;
  for (let i = 0; i < chain.length; i++) {
    const c = chain[i];
    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      while (j < chain.length && !(chain[j] === c && chain[j - 1] !== '\\')) j++;
      if (depth === 0) out += chain.slice(i, j + 1);
      i = j;
      continue;
    }
    if (c === '(' || c === '[' || c === '{') { if (depth++ === 0) out += c; continue; }
    if (c === ')' || c === ']' || c === '}') { if (--depth === 0) out += c; continue; }
    if (depth === 0) out += c;
  }
  return out;
}

// A receiver that is one parenthesised expression, `(expr)`, is that expression: look inside it.
// Without this, emptying groups would hide `(db.from(t).delete()).catch(...)`.
function unwrapParens(chain) {
  let s = chain.trim();
  for (;;) {
    if (s[0] !== '(') return s;
    let depth = 0, i = 0;
    for (; i < s.length; i++) {
      const c = s[i];
      if (c === "'" || c === '"' || c === '`') { i++; while (i < s.length && !(s[i] === c && s[i - 1] !== '\\')) i++; continue; }
      if (c === '(' || c === '[' || c === '{') depth++;
      else if ((c === ')' || c === ']' || c === '}') && --depth === 0) break;
    }
    if (i !== s.length - 1) return s;
    s = s.slice(1, -1).trim();
  }
}

const BUILDER = /\.from\s*\([^)]*\)\s*\.\s*(select|insert|update|upsert|delete)\s*\(|\.rpc\s*\(/;
const PROMISE_BOUNDARY = /\.storage\b|\.(then|finally)\s*\(/;

export function builderCatchSites(text) {
  const sites = [];
  for (const match of text.matchAll(/\??\.\s*catch\s*\(/g)) {
    const chain = text.slice(chainStart(text, match.index), match.index), calls = ownCalls(unwrapParens(chain));
    if (BUILDER.test(calls) && !PROMISE_BOUNDARY.test(calls)) sites.push({line: text.slice(0, match.index).split('\n').length, chain: chain.replace(/\s+/g, ' ').trim()});
  }
  return sites;
}

// Self-check so the guard cannot silently stop detecting the pattern.
const bad = [
  "await B.db().from('media').update({a:1}).eq('id',row.id).eq('trip_id',t).catch(()=>{});",
  "await db().from('payment_requests').delete().eq('id',row.id).catch(()=>{});",
  "db.from('x')\n  .select('id')\n  .maybeSingle()\n  .catch(console.warn)",
  "await client.rpc('fn',{p:1}).catch(()=>null)",
  "x?.db().from('t').upsert(rows,{onConflict:'id'})?.catch(()=>{})",
  "await db.from('a').delete().in('id',ids(db.from('b').select('id'))).catch(()=>{})",
  "await (db.from('t').delete().eq('id',1)).catch(()=>{})",
  "((client.rpc('fn',{p:')'}))).catch(()=>null)",
];
const good = [
  "await db().storage.from('btg-documents').remove([path]).catch(()=>{});",
  "db.from('t').select('id').eq('id',1).then(({error})=>{if(error)throw error}).catch(()=>{})",
  "db.rpc('fn').then(r=>r).finally(done).catch(()=>{})",
  "await response.json().catch(()=>({}))",
  "try{const {error}=await db().from('t').delete().eq('id',1)}catch{}",
  "p=(async()=>{const q=await c.from('t').select('id').eq('id',1);return q.data})().catch(()=>null)",
  "await Promise.all([c.from('a').select('id'),c.rpc('fn')]).catch(()=>[])",
  "await run(db.from('t').delete().eq('id',1)).catch(()=>{})",
  "(async()=>{await c.rpc('fn')})().catch(()=>{})",
  "(db.from('t').select('id').then(r=>r)).catch(()=>{})",
];
for (const snippet of bad) assert.equal(builderCatchSites(snippet).length, 1, `guard must flag: ${snippet}`);
for (const snippet of good) assert.equal(builderCatchSites(snippet).length, 0, `guard must allow: ${snippet}`);

const failures = [];
let scanned = 0;
for (const file of sourceFiles(root)) {
  scanned++;
  for (const site of builderCatchSites(fs.readFileSync(file, 'utf8'))) failures.push(`${path.relative(root, file)}:${site.line}  ${site.chain.length > 160 ? '…' + site.chain.slice(-160) : site.chain}.catch(`);
}
if (failures.length) {
  console.error(`FAIL: .catch chained onto a supabase-js query builder (${failures.length}):\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`Supabase builder .catch guard: PASS (${scanned} source files)`);
