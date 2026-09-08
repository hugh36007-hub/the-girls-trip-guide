/* Girls Home social hub v3 — deterministic Home chat + poll rendering. */
(()=>{
'use strict';
if(window.__GTG_HOME_SOCIAL_HUB_V3__)return;
window.__GTG_HOME_SOCIAL_HUB_V3__=true;
window.__GTG_HOME_SOCIAL_HUB__=true;

const SUPABASE_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,user=null,members=[],mountedTrip='',loadToken=0,channel=null,overlay=null,pageLock=null,busy=false;
let startY=0,lastY=0,startAt=0,dragging=false;

const db=()=>client||(client=window.supabase?.createClient?.(SUPABASE_URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const tripId=()=>new globalThis.URL(location.href).searchParams.get('trip_id')||'';
const action=()=>new globalThis.URL(location.href).searchParams.get('action')||'overview';
const isHome=()=>action()==='overview'&&Boolean(document.querySelector('.dashboard'));
const hero=()=>document.querySelector('.dashboard .shell > .hero-card')||document.querySelector('.dashboard .hero-card');
const isFreeHome=()=>document.querySelector('.dashboard')?.dataset.homeComposition==='free';
const rel=v=>{const ms=Date.now()-new Date(v||0).getTime();if(!Number.isFinite(ms)||ms<0)return'';const m=Math.floor(ms/60000);if(m<1)return'now';if(m<60)return`${m}m ago`;const h=Math.floor(m/60);if(h<24)return`${h}h ago`;return`${Math.floor(h/24)}d ago`};
const full=v=>{try{return new Date(v).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}catch{return''}};
const memberName=id=>members.find(m=>m.id===id)?.name||'Group member';
function say(msg){const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(el.__gtgHomeV3);el.__gtgHomeV3=setTimeout(()=>el.classList.remove('show'),3200)}

function installStyles(){
 if(document.getElementById('gtg-home-social-v3-css'))return;
 const s=document.createElement('style');s.id='gtg-home-social-v3-css';s.textContent=`
.hero-card.gtg-has-home-chat .hero-meta{bottom:86px!important}.gtg-home-chat-strip{position:absolute;z-index:12;left:14px;right:14px;bottom:12px;min-height:54px;padding:10px 13px;border:1px solid rgba(255,79,163,.38);border-radius:14px;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);color:#21181d;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px 10px;align-items:center;text-align:left;cursor:pointer;box-shadow:0 8px 24px rgba(72,32,52,.08)}.gtg-home-chat-strip .avatar{width:30px;height:30px;border:1px solid rgba(255,79,163,.35);border-radius:50%;display:grid;place-items:center;color:#ed2f8b;background:#fff6fa;font-size:10px;font-weight:900}.gtg-home-chat-strip .copy{min-width:0}.gtg-home-chat-strip b{display:block;font-size:10px;color:#ed2f8b}.gtg-home-chat-strip p{margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#5c4e55;font-size:12px}.gtg-home-chat-strip time{color:#8d7d85;font-size:9px}.gtg-home-chat-strip.loading{cursor:default}.gtg-home-chat-strip.loading .copy p{color:#9a8a92}
.gtg-home-poll-v3{width:100%;box-sizing:border-box;margin:12px 0 0;padding:14px 16px;border:1px solid rgba(255,79,163,.3);border-radius:16px;background:linear-gradient(135deg,#fff8fb,#fff);color:#21181d;box-shadow:0 9px 28px rgba(72,32,52,.07)}.gtg-home-poll-v3.loading{min-height:88px;display:grid;align-content:center}.gtg-home-poll-v3 small,.gtg-home-score-v3 small{display:block;color:#ed2f8b;font-size:9px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.gtg-home-poll-v3 h3,.gtg-home-score-v3 h3{margin:7px 0 12px;font:800 22px/1.15 'Barlow Condensed',sans-serif}.gtg-home-poll-v3 .opts{display:grid;gap:8px}.gtg-home-poll-v3 button{width:100%;padding:11px 12px;border:1px solid rgba(255,79,163,.25);border-radius:11px;background:#fff;color:#21181d;text-align:left;font-weight:800}.gtg-home-poll-v3 button:disabled{opacity:.55}.gtg-home-score-v3{position:absolute;z-index:13;top:14px;right:14px;width:min(360px,calc(100% - 28px));box-sizing:border-box;padding:13px 14px;border:1px solid rgba(255,79,163,.28);border-radius:15px;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);color:#21181d;box-shadow:0 8px 24px rgba(72,32,52,.08)}.gtg-score-v3-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 9px;align-items:center;margin-top:7px}.gtg-score-v3-row span{font-size:11px}.gtg-score-v3-row b{font-size:10px;color:#ed2f8b}.gtg-score-v3-bar{grid-column:1/-1;height:5px;border-radius:999px;background:#f3e7ed;overflow:hidden}.gtg-score-v3-bar i{display:block;height:100%;background:#ed2f8b;border-radius:999px}.gtg-score-v3-total{margin-top:8px;color:#8d7d85;font-size:9px}
html.gtg-home-chat-v3-open,body.gtg-home-chat-v3-open{overflow:hidden!important;overscroll-behavior:none!important}.gtg-home-chat-v3{position:fixed;left:0;right:0;top:var(--gtg-chat-v3-top,0px);height:var(--gtg-chat-v3-height,100dvh);z-index:2147483200;background:#090609;color:#fff;display:flex;flex-direction:column;transform:translateY(var(--gtg-chat-v3-drag,0px));transition:transform .2s ease}.gtg-home-chat-v3.dragging{transition:none}.gtg-home-chat-v3-toolbar{position:relative;display:grid;grid-template-columns:52px 1fr 52px;align-items:center;min-height:calc(64px + env(safe-area-inset-top));padding:env(safe-area-inset-top) 10px 0;border-bottom:1px solid rgba(255,123,190,.18);background:#0d090d;touch-action:none}.gtg-home-chat-v3-grab{position:absolute;top:calc(7px + env(safe-area-inset-top));left:50%;width:42px;height:5px;border-radius:99px;background:rgba(255,255,255,.28);transform:translateX(-50%)}.gtg-home-chat-v3-title{text-align:center;padding-top:6px}.gtg-home-chat-v3-title strong{display:block}.gtg-home-chat-v3-title small{display:block;margin-top:3px;color:rgba(255,255,255,.55);font-size:9px;text-transform:uppercase}.gtg-home-chat-v3-close{grid-column:3;width:42px;height:42px;border:0;background:transparent;color:#fff;font-size:30px;cursor:pointer}.gtg-home-chat-v3-feed{flex:1;min-height:0;overflow-y:auto;padding:18px max(14px,calc((100vw - 760px)/2)) 22px;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain;background:radial-gradient(circle at 20% 0,rgba(255,79,163,.055),transparent 30%),#090609}.gtg-home-chat-v3-empty{margin:auto;color:#8f7c87;text-align:center}.gtg-home-chat-v3-msg{max-width:min(82%,620px);padding:9px 11px;border:1px solid rgba(255,255,255,.09);border-radius:15px 15px 15px 4px;background:#171017}.gtg-home-chat-v3-msg.own{margin-left:auto;border-radius:15px 15px 4px 15px;background:rgba(255,79,163,.15);border-color:rgba(255,123,190,.4)}.gtg-home-chat-v3-msg b{display:block;color:#ff4fa3;font-size:10px}.gtg-home-chat-v3-msg p{margin:3px 0 0;color:#fff!important;white-space:pre-wrap;overflow-wrap:anywhere;font-size:15px;line-height:1.38}.gtg-home-chat-v3-msg small{display:block;margin-top:4px;text-align:right;color:rgba(255,255,255,.5);font-size:9px}.gtg-home-chat-v3-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:9px max(10px,calc((100vw - 760px)/2)) calc(9px + env(safe-area-inset-bottom));border-top:1px solid rgba(255,123,190,.16);background:#0d090d}.gtg-home-chat-v3-form textarea{height:44px;min-height:44px;max-height:110px;padding:11px 15px;border:1px solid rgba(255,123,190,.25);border-radius:22px;background:#171017;color:#fff!important;-webkit-text-fill-color:#fff!important;caret-color:#fff;font:16px/20px inherit;resize:none}.gtg-home-chat-v3-form button{min-width:62px;height:44px;border:1px solid #ff4fa3;border-radius:22px;background:#ff4fa3;color:#160a11;font-weight:900;text-transform:uppercase}.gtg-home-chat-v3-form button:disabled{opacity:.55}
@media(max-width:700px){.hero-card.gtg-has-home-chat .hero-meta{bottom:82px!important}.gtg-home-chat-strip{left:12px;right:12px;bottom:12px}.gtg-home-chat-v3-msg{max-width:88%}.gtg-home-score-v3{top:10px;right:10px;width:min(320px,calc(100% - 20px));padding:10px 11px}.gtg-home-score-v3 h3{font-size:18px;margin-bottom:8px}}@media(max-width:700px) and (max-height:700px){.gtg-home-poll-v3{padding:10px 12px 94px!important}.gtg-home-poll-v3 h3{margin:4px 0 7px!important;font-size:19px!important}.gtg-home-poll-v3 .opts{gap:6px!important}.gtg-home-poll-v3 .opts button{padding:8px 10px!important;min-height:34px!important}}
`;
 document.head.appendChild(s);
}

function clearHome(){document.querySelectorAll('.gtg-home-chat-strip,.gtg-home-poll-v3,.gtg-home-score-v3,.gtg-home-poll-v2,.gtg-home-score-v2').forEach(n=>n.remove());document.querySelectorAll('.hero-card.gtg-has-home-chat').forEach(n=>n.classList.remove('gtg-has-home-chat'))}
function mountShell(){
 const h=hero();if(!h||!tripId()||!isHome()||!isFreeHome()){clearHome();return false}
 h.classList.add('gtg-has-home-chat');
 let chat=h.querySelector('.gtg-home-chat-strip');if(!chat){chat=document.createElement('button');chat.type='button';chat.className='gtg-home-chat-strip loading';chat.dataset.gtgHomeChatV3='1';chat.innerHTML='<span class="avatar">G</span><span class="copy"><b>Group chat</b><p>Loading conversation…</p></span><time></time>';h.appendChild(chat)}
 let poll=document.querySelector('.gtg-home-poll-v3');if(!poll){poll=document.createElement('section');poll.className='gtg-home-poll-v3 loading';poll.innerHTML='<small>Group decision</small><h3>Checking for active polls…</h3>';h.after(poll)}
 return true;
}
async function context(){
 const id=tripId(),q=db();if(!q||!id||!isHome())return null;
 if(!user){const r=await q.auth.getUser();user=r.data?.user||null}if(!user)return null;
 if(!members.length||mountedTrip!==id){const r=await q.from('trip_members').select('id,name,user_id').eq('trip_id',id).order('created_at');if(r.error)throw r.error;members=r.data||[]}
 return{q,id,user,h:hero()};
}
async function latestChat(x){const {data,error}=await x.q.from('trip_chat_messages').select('id,sender_user_id,sender_member_id,message,created_at').eq('trip_id',x.id).order('created_at',{ascending:false}).limit(1);if(error)throw error;return data?.[0]||null}
function choosePollState(open,votes,userId){
 const votedIds=new Set((votes||[]).filter(v=>v.voter_user_id===userId).map(v=>String(v.poll_id)));
 return{prompt:(open||[]).find(p=>!votedIds.has(String(p.id)))||null,scoreboard:(open||[]).find(p=>votedIds.has(String(p.id)))||null};
}
async function activePoll(x){
 const {data:polls,error}=await x.q.from('trip_polls').select('id,question,status,closes_at,created_at').eq('trip_id',x.id).eq('status','open').order('created_at',{ascending:false}).limit(10);if(error)throw error;
 const open=(polls||[]).filter(p=>!p.closes_at||new Date(p.closes_at)>new Date());if(!open.length)return null;
 const ids=open.map(p=>p.id),[{data:options,error:oe},{data:votes,error:ve}]=await Promise.all([x.q.from('trip_poll_options').select('id,poll_id,label,sort_order').in('poll_id',ids).order('sort_order'),x.q.from('trip_poll_votes').select('poll_id,option_id,voter_user_id').in('poll_id',ids)]);if(oe)throw oe;if(ve)throw ve;
 const selected=choosePollState(open,votes||[],x.user.id),hydrate=p=>p?{poll:p,options:(options||[]).filter(o=>o.poll_id===p.id),votes:(votes||[]).filter(v=>v.poll_id===p.id)}:null;
 return{prompt:hydrate(selected.prompt),scoreboard:hydrate(selected.scoreboard)};
}
function renderChat(row){const h=hero(),card=h?.querySelector('.gtg-home-chat-strip');if(!card)return;card.classList.remove('loading');card.dataset.gtgHomeChatV3='1';card.innerHTML=row?`<span class="avatar">${esc(memberName(row.sender_member_id).slice(0,1).toUpperCase())}</span><span class="copy"><b>${esc(memberName(row.sender_member_id))}</b><p>${esc(row.message)}</p></span><time>${esc(rel(row.created_at))}</time>`:`<span class="avatar">G</span><span class="copy"><b>Group chat</b><p>No messages yet. Tap to start the chat.</p></span><time></time>`}
function renderPoll(state){
 const h=hero();if(!h)return;h.querySelectorAll('.gtg-home-score-v3,.gtg-home-score-v2').forEach(n=>n.remove());
 let box=document.querySelector('.gtg-home-poll-v3');const prompt=state?.prompt||null,scoreboard=state?.scoreboard||null;
 if(scoreboard){const total=scoreboard.votes.length,board=document.createElement('section');board.className='gtg-home-score-v3';board.innerHTML=`<small>Poll progress</small><h3>${esc(scoreboard.poll.question)}</h3>${scoreboard.options.map(o=>{const n=scoreboard.votes.filter(v=>v.option_id===o.id).length,p=total?Math.round(n/total*100):0;return`<div class="gtg-score-v3-row"><span>${esc(o.label)}</span><b>${n} · ${p}%</b><div class="gtg-score-v3-bar"><i style="width:${p}%"></i></div></div>`}).join('')}<div class="gtg-score-v3-total">${total} vote${total===1?'':'s'} so far</div>`;h.appendChild(board)}
 if(!prompt){box?.remove();return}
 if(!box){box=document.createElement('section');box.className='gtg-home-poll-v3';h.after(box)}box.classList.remove('loading');box.innerHTML=`<small>Vote needed</small><h3>${esc(prompt.poll.question)}</h3><div class="opts">${prompt.options.map(o=>`<button type="button" data-gtg-v3-vote="${esc(prompt.poll.id)}" data-option="${esc(o.id)}">${esc(o.label)}</button>`).join('')}</div>`;
}
async function loadHome(){
 if(!isHome()||!tripId()||!isFreeHome()){clearHome();return}
 if(!mountShell())return;
 const token=++loadToken,id=tripId();
 try{
  const x=await context();if(!x||token!==loadToken||x.id!==tripId()||!isFreeHome()){clearHome();return}mountedTrip=id;
  const [chat,poll]=await Promise.all([latestChat(x),activePoll(x)]);if(token!==loadToken||id!==tripId()||!isHome()||!isFreeHome()){clearHome();return}
  renderChat(chat);renderPoll(poll);subscribe(x);
 }catch(err){if(token!==loadToken)return;console.warn('Girls Home social load failed',err);const chat=hero()?.querySelector('.gtg-home-chat-strip');if(chat){chat.classList.remove('loading');chat.innerHTML='<span class="avatar">G</span><span class="copy"><b>Group chat</b><p>Could not load conversation. Tap to retry.</p></span><time></time>'}const poll=document.querySelector('.gtg-home-poll-v3');if(poll){poll.classList.remove('loading');poll.innerHTML='<small>Group decision</small><h3>Polls could not be loaded.</h3>'}}
}
function subscribe(x){
 if(channel&&channel.__trip===x.id)return;if(channel){try{x.q.removeChannel(channel)}catch{}}
 channel=x.q.channel(`gtg-home-v3-${x.id}`);channel.__trip=x.id;
 channel.on('postgres_changes',{event:'*',schema:'public',table:'trip_chat_messages',filter:`trip_id=eq.${x.id}`},()=>void refreshChat());
 channel.on('postgres_changes',{event:'*',schema:'public',table:'trip_polls',filter:`trip_id=eq.${x.id}`},()=>void refreshPoll());
 channel.on('postgres_changes',{event:'*',schema:'public',table:'trip_poll_votes',filter:`trip_id=eq.${x.id}`},()=>void refreshPoll());
 channel.subscribe();
}
async function refreshChat(){try{const x=await context();if(x)renderChat(await latestChat(x));if(overlay)await fillFeed(false)}catch{}}
async function refreshPoll(){try{const x=await context();if(x)renderPoll(await activePoll(x))}catch{}}

function lock(){if(pageLock)return;const y=scrollY||0,b=document.body,h=document.documentElement;pageLock={y,bp:b.style.position,bt:b.style.top,bl:b.style.left,br:b.style.right,bw:b.style.width,bo:b.style.overflow,ho:h.style.overflow};b.style.position='fixed';b.style.top=`-${y}px`;b.style.left='0';b.style.right='0';b.style.width='100%';b.style.overflow='hidden';h.style.overflow='hidden';b.classList.add('gtg-home-chat-v3-open');h.classList.add('gtg-home-chat-v3-open')}
function unlock(){if(!pageLock)return;const p=pageLock,b=document.body,h=document.documentElement;pageLock=null;b.classList.remove('gtg-home-chat-v3-open');h.classList.remove('gtg-home-chat-v3-open');b.style.position=p.bp;b.style.top=p.bt;b.style.left=p.bl;b.style.right=p.br;b.style.width=p.bw;b.style.overflow=p.bo;h.style.overflow=p.ho;requestAnimationFrame(()=>scrollTo(0,p.y))}
function syncViewport(){if(!overlay)return;const vv=window.visualViewport,top=vv?Math.max(0,vv.offsetTop):0,height=vv?vv.height:innerHeight;overlay.style.setProperty('--gtg-chat-v3-top',`${top}px`);overlay.style.setProperty('--gtg-chat-v3-height',`${height}px`)}
async function chatRows(){const x=await context();if(!x)return[];const {data,error}=await x.q.from('trip_chat_messages').select('id,sender_user_id,sender_member_id,message,created_at').eq('trip_id',x.id).order('created_at',{ascending:true}).limit(150);if(error)throw error;return data||[]}
async function fillFeed(force=true){if(!overlay)return;const feed=overlay.querySelector('[data-gtg-v3-feed]');if(!feed)return;try{const x=await context(),rows=await chatRows();if(!x||!overlay)return;const near=feed.scrollHeight-feed.scrollTop-feed.clientHeight<150;feed.innerHTML=rows.map(m=>`<article class="gtg-home-chat-v3-msg ${m.sender_user_id===x.user.id?'own':''}"><b>${esc(memberName(m.sender_member_id))}</b><p>${esc(m.message)}</p><small>${esc(full(m.created_at))}</small></article>`).join('')||'<div class="gtg-home-chat-v3-empty">No messages yet. Someone has to start it.</div>';if(force||near)requestAnimationFrame(()=>feed.scrollTop=feed.scrollHeight)}catch{}}
async function openChat(){if(overlay)return;const x=await context().catch(()=>null);if(!x)return;lock();overlay=document.createElement('section');overlay.className='gtg-home-chat-v3';overlay.innerHTML=`<div class="gtg-home-chat-v3-toolbar" data-gtg-v3-drag><span class="gtg-home-chat-v3-grab"></span><span></span><div class="gtg-home-chat-v3-title"><strong>Group chat</strong><small>${esc(document.querySelector('.trip-title strong')?.textContent||'The trip')}</small></div><button type="button" class="gtg-home-chat-v3-close" data-gtg-v3-close aria-label="Close chat">×</button></div><div class="gtg-home-chat-v3-feed" data-gtg-v3-feed><div class="gtg-home-chat-v3-empty">Loading chat…</div></div><form class="gtg-home-chat-v3-form" data-gtg-v3-form><textarea name="message" maxlength="1000" required placeholder="Message the group…"></textarea><button type="submit">Send</button></form>`;document.body.appendChild(overlay);syncViewport();await fillFeed(true)}
function closeChat(){if(!overlay)return;const old=overlay;overlay=null;old.style.setProperty('--gtg-chat-v3-drag',`${Math.max(innerHeight,500)}px`);setTimeout(()=>old.remove(),200);dragging=false;unlock()}

function boot(){installStyles();if(isHome()&&tripId()&&isFreeHome()){mountShell();void loadHome()}else clearHome()}
const app=document.getElementById('app');if(app)new MutationObserver(()=>{if(isHome()&&tripId()){mountShell();void loadHome()}else clearHome()}).observe(app,{childList:true,subtree:false});
window.addEventListener('popstate',()=>{members=[];mountedTrip='';loadToken++;setTimeout(boot,0)});window.addEventListener('pageshow',boot);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')boot()});

document.addEventListener('click',e=>{const chat=e.target.closest?.('[data-gtg-home-chat-v3]');if(chat&&!chat.classList.contains('loading')){e.preventDefault();void openChat();return}if(e.target.closest?.('[data-gtg-v3-close]')){e.preventDefault();closeChat();return}const vote=e.target.closest?.('[data-gtg-v3-vote]');if(vote&&!busy){e.preventDefault();busy=true;document.querySelectorAll('[data-gtg-v3-vote]').forEach(b=>b.disabled=true);context().then(x=>x?.q.rpc('cast_trip_poll_vote',{p_poll_id:vote.dataset.gtgV3Vote,p_option_id:vote.dataset.option})).then(r=>{if(r?.error)throw r.error;return refreshPoll()}).catch(err=>say(err.message||'Vote could not be saved.')).finally(()=>busy=false)}},true);
document.addEventListener('submit',e=>{const f=e.target.closest?.('[data-gtg-v3-form]');if(!f)return;e.preventDefault();e.stopImmediatePropagation();const text=String(new FormData(f).get('message')||'').trim(),btn=f.querySelector('button');if(!text||busy)return;busy=true;btn.disabled=true;btn.textContent='Sending…';context().then(x=>{if(!x)throw Error('Trip session unavailable.');return x.q.rpc('send_trip_chat_message',{p_trip_id:x.id,p_message:text})}).then(({error})=>{if(error)throw error;f.reset();return fillFeed(true)}).then(()=>refreshChat()).catch(err=>say(err.message||'Message could not be sent.')).finally(()=>{busy=false;btn.disabled=false;btn.textContent='Send'})},true);

document.addEventListener('touchstart',e=>{if(!overlay)return;const t=e.touches?.[0];if(!t)return;const feed=e.target.closest?.('[data-gtg-v3-feed]');if(e.target.closest?.('[data-gtg-v3-drag]')||(feed&&feed.scrollTop<=0)){startY=lastY=t.clientY;startAt=performance.now();dragging=true;overlay.classList.add('dragging')}},{capture:true,passive:true});
document.addEventListener('touchmove',e=>{if(!dragging||!overlay)return;const t=e.touches?.[0];if(!t)return;lastY=t.clientY;const dy=Math.max(0,lastY-startY);if(dy>0)e.preventDefault();overlay.style.setProperty('--gtg-chat-v3-drag',`${Math.min(dy,320)}px`)},{capture:true,passive:false});
document.addEventListener('touchend',()=>{if(!dragging||!overlay)return;const dy=Math.max(0,lastY-startY),velocity=dy/Math.max(1,performance.now()-startAt);dragging=false;if(dy>92||velocity>.7){closeChat();return}overlay.classList.remove('dragging');overlay.style.setProperty('--gtg-chat-v3-drag','0px')},{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(overlay&&e.key==='Escape')closeChat()});
window.visualViewport?.addEventListener('resize',syncViewport);window.visualViewport?.addEventListener('scroll',syncViewport);window.addEventListener('resize',syncViewport);

boot();
})();
