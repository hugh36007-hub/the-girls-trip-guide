(() => {
'use strict';

const SUPABASE_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const SUPABASE_KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const MAX_DOCUMENT=25*1024*1024;
const ALLOWED_TYPES=new Set(['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif']);
let client=null,context=null,decorateTimer=0;

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const safeFile=name=>String(name||'document').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-110)||'document';
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
function db(){if(!client){if(!window.supabase?.createClient)throw new Error('Secure services did not load.');client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}return client}
function toast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3200)}
function modalRoot(){return document.getElementById('modalRoot')}
function close(){const root=modalRoot();if(!root)return;root.classList.remove('open');root.innerHTML=''}

async function loadContext(force=false){
 const id=tripId();if(!id)return null;
 if(!force&&context?.trip?.id===id)return context;
 const q=db(),{data:{user}}=await q.auth.getUser();if(!user)return null;
 const [trip,members]=await Promise.all([
  q.from('trips').select('id,owner_id,product_key').eq('id',id).eq('product_key','girls').maybeSingle(),
  q.from('trip_members').select('id,name,email,user_id,role,status').eq('trip_id',id).order('created_at')
 ]);
 if(trip.error)throw trip.error;if(members.error)throw members.error;
 if(!trip.data)return null;
 context={user,trip:trip.data,members:members.data||[],owner:trip.data.owner_id===user.id};
 return context;
}

function memberChoices(members,selected=[]){
 return members.filter(m=>m.role!=='organiser'&&m.user_id!==context?.trip?.owner_id).map(m=>`<label class="doc-person"><input type="checkbox" name="recipients" value="${esc(m.id)}" ${selected.includes(m.id)?'checked':''}><span><b>${esc(m.name)}</b><small>${esc(m.email||m.status||'Trip member')}</small></span></label>`).join('')||'<div class="empty">Invite someone to the trip before assigning a document.</div>';
}
function audienceFields(members,visibility='everyone',selected=[]){return `<fieldset class="doc-audience-fieldset"><legend>Who is this for?</legend><label class="doc-audience-option"><input type="radio" name="visibility" value="everyone" ${visibility==='everyone'?'checked':''}><span><b>Everyone on the trip</b><small>All confirmed trip members can open it.</small></span></label><label class="doc-audience-option"><input type="radio" name="visibility" value="selected" ${visibility==='selected'?'checked':''}><span><b>Specific people</b><small>Only the people you choose can open it.</small></span></label><div class="doc-member-picker" data-doc-member-picker ${visibility==='selected'?'':'hidden'}>${memberChoices(members,selected)}</div><label class="doc-audience-option"><input type="radio" name="visibility" value="organiser" ${visibility==='organiser'?'checked':''}><span><b>Organiser only</b><small>Keep this document private to you.</small></span></label></fieldset>`}

async function openNewDocument(){
 const ctx=await loadContext(true);if(!ctx?.owner){toast('Only the organiser can add trip documents.');return}
 const root=modalRoot();if(!root)return;
 root.innerHTML=`<div class="modal"><h2>Add travel document</h2><p>Choose who can access this ticket, confirmation or PDF.</p><form id="audienceDocumentForm" class="form"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Note</label><textarea name="note"></textarea></div>${audienceFields(ctx.members)}<div class="field"><label>File</label><input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif" required></div><div class="modal-actions"><button type="button" class="btn" data-doc-close>Cancel</button><button class="btn primary">Add document</button></div></form></div>`;
 root.classList.add('open');
}

async function openAudienceEditor(documentId){
 const ctx=await loadContext(true);if(!ctx?.owner)return;
 const q=db(),[doc,recipients]=await Promise.all([
  q.from('documents').select('id,name,visibility').eq('id',documentId).eq('trip_id',ctx.trip.id).maybeSingle(),
  q.from('document_recipients').select('member_id').eq('document_id',documentId).eq('trip_id',ctx.trip.id)
 ]);
 if(doc.error)throw doc.error;if(recipients.error)throw recipients.error;if(!doc.data)return;
 const selected=(recipients.data||[]).map(x=>x.member_id),root=modalRoot();
 root.innerHTML=`<div class="modal"><h2>Document access</h2><p><strong>${esc(doc.data.name||'Document')}</strong></p><form id="audienceEditForm" class="form"><input type="hidden" name="documentId" value="${esc(documentId)}">${audienceFields(ctx.members,doc.data.visibility||'everyone',selected)}<div class="modal-actions"><button type="button" class="btn" data-doc-close>Cancel</button><button class="btn primary">Save access</button></div></form></div>`;
 root.classList.add('open');
}

function selection(form){
 const visibility=String(new FormData(form).get('visibility')||'everyone');
 const recipients=[...form.querySelectorAll('input[name="recipients"]:checked')].map(x=>x.value);
 if(visibility==='selected'&&!recipients.length)throw new Error('Choose at least one person for this document.');
 return {visibility,recipients};
}

async function createDocument(form){
 const ctx=await loadContext(true);if(!ctx?.owner)throw new Error('Only the organiser can add documents.');
 const data=new FormData(form),file=data.get('file');
 if(!(file instanceof File)||!file.size)throw new Error('Choose a document first.');
 if(file.size>MAX_DOCUMENT)throw new Error('Documents are limited to 25 MB.');
 if(file.type&&!ALLOWED_TYPES.has(file.type))throw new Error('Use a PDF, JPEG, PNG, WebP or HEIC file.');
 const {visibility,recipients}=selection(form),q=db(),path=`${ctx.trip.id}/documents/${crypto.randomUUID()}-${safeFile(file.name)}`;
 let documentId='';
 try{
  const inserted=await q.from('documents').insert({trip_id:ctx.trip.id,name:String(data.get('name')||'').trim(),note:String(data.get('note')||'').trim()||null,storage_path:path,file_name:file.name,mime_type:file.type||'application/octet-stream',size_bytes:file.size,created_by:ctx.user.id,visibility}).select('id').single();
  if(inserted.error)throw inserted.error;documentId=inserted.data.id;
  if(visibility==='selected'){
   const links=recipients.map(member_id=>({document_id:documentId,trip_id:ctx.trip.id,member_id}));
   const linked=await q.from('document_recipients').insert(links);if(linked.error)throw linked.error;
  }
  const upload=await q.storage.from('btg-documents').upload(path,file,{upsert:false,contentType:file.type||undefined});if(upload.error)throw upload.error;
  close();toast(visibility==='everyone'?'Document added for everyone.':visibility==='organiser'?'Private organiser document added.':'Document added for selected people.');
  setTimeout(()=>location.reload(),350);
 }catch(error){
  if(documentId)await q.from('documents').delete().eq('id',documentId).eq('trip_id',ctx.trip.id).catch(()=>{});
  await q.storage.from('btg-documents').remove([path]).catch(()=>{});
  throw error;
 }
}

async function updateAudience(form){
 const ctx=await loadContext(true);if(!ctx?.owner)throw new Error('Only the organiser can change document access.');
 const documentId=String(new FormData(form).get('documentId')||''),{visibility,recipients}=selection(form),q=db();
 const doc=await q.from('documents').update({visibility}).eq('id',documentId).eq('trip_id',ctx.trip.id);if(doc.error)throw doc.error;
 const removed=await q.from('document_recipients').delete().eq('document_id',documentId).eq('trip_id',ctx.trip.id);if(removed.error)throw removed.error;
 if(visibility==='selected'){
  const added=await q.from('document_recipients').insert(recipients.map(member_id=>({document_id:documentId,trip_id:ctx.trip.id,member_id})));if(added.error)throw added.error;
 }
 close();toast('Document access updated.');scheduleDecorate(true);
}

function audienceText(doc,recipients,members,owner){
 if(doc.visibility==='organiser')return 'Organiser only';
 if(doc.visibility!=='selected')return 'Everyone';
 const ids=recipients.filter(x=>x.document_id===doc.id).map(x=>x.member_id),names=ids.map(id=>members.find(m=>m.id===id)?.name).filter(Boolean);
 if(owner)return names.length?names.join(' + '):'Selected people';
 return 'For you';
}
async function decorate(){
 if(new URL(location.href).searchParams.get('action')!=='plan'&&!document.querySelector('[data-panel="plan"].active'))return;
 const buttons=[...document.querySelectorAll('[data-a="openDocument"][data-id]')];if(!buttons.length)return;
 const ctx=await loadContext();if(!ctx)return;const ids=buttons.map(b=>b.dataset.id).filter(Boolean),q=db();
 const [docs,recipients]=await Promise.all([
  q.from('documents').select('id,visibility').eq('trip_id',ctx.trip.id).in('id',ids),
  q.from('document_recipients').select('document_id,member_id').eq('trip_id',ctx.trip.id).in('document_id',ids)
 ]);
 if(docs.error||recipients.error)return;
 for(const button of buttons){
  const row=button.closest('.money-row'),doc=(docs.data||[]).find(x=>x.id===button.dataset.id);if(!row||!doc)continue;
  let label=row.querySelector('.doc-audience-label');if(!label){label=document.createElement('span');label.className='doc-audience-label';const info=row.querySelector('div');info?.appendChild(label)}
  label.textContent=audienceText(doc,recipients.data||[],ctx.members,ctx.owner);
  if(ctx.owner&&!row.querySelector('[data-doc-audience-edit]')){const actions=button.closest('.actions');if(actions){const edit=document.createElement('button');edit.type='button';edit.className='btn';edit.dataset.docAudienceEdit=doc.id;edit.textContent='Access';actions.insertBefore(edit,button)}}
 }
}
function scheduleDecorate(force=false){clearTimeout(decorateTimer);if(force)context=null;decorateTimer=setTimeout(()=>decorate().catch(console.warn),80)}

// Capture Add Document before the legacy modal opens. All other document actions remain
// on the existing Girls runtime, so Open/Delete continue to use its normal pathways.
document.addEventListener('click',event=>{
 const add=event.target.closest('[data-a="addDocument"]');
 if(add){event.preventDefault();event.stopImmediatePropagation();openNewDocument().catch(e=>toast(e.message||'Could not open document upload.'));return}
 const edit=event.target.closest('[data-doc-audience-edit]');
 if(edit){event.preventDefault();event.stopImmediatePropagation();openAudienceEditor(edit.dataset.docAudienceEdit).catch(e=>toast(e.message||'Could not open document access.'));return}
 if(event.target.closest('[data-doc-close]')){event.preventDefault();event.stopImmediatePropagation();close();return}
 const visibility=event.target.closest('input[name="visibility"]');
 if(visibility){const form=visibility.closest('form'),picker=form?.querySelector('[data-doc-member-picker]');if(picker)picker.hidden=visibility.value!=='selected'}
},true);

document.addEventListener('change',event=>{
 if(event.target.matches('input[name="visibility"]')){const picker=event.target.closest('form')?.querySelector('[data-doc-member-picker]');if(picker)picker.hidden=event.target.value!=='selected'}
},true);

document.addEventListener('submit',event=>{
 const form=event.target;
 if(!(form instanceof HTMLFormElement))return;
 if(form.id==='audienceDocumentForm'){
  event.preventDefault();event.stopImmediatePropagation();const submit=form.querySelector('button[type="submit"],button:not([type])');if(submit)submit.disabled=true;
  createDocument(form).catch(e=>{toast(e.message||'Could not add document.');if(submit)submit.disabled=false});
 }
 if(form.id==='audienceEditForm'){
  event.preventDefault();event.stopImmediatePropagation();const submit=form.querySelector('button[type="submit"],button:not([type])');if(submit)submit.disabled=true;
  updateAudience(form).catch(e=>{toast(e.message||'Could not update document access.');if(submit)submit.disabled=false});
 }
},true);

const app=document.getElementById('app');if(app)new MutationObserver(()=>scheduleDecorate()).observe(app,{childList:true,subtree:true});
window.addEventListener('popstate',()=>scheduleDecorate(true));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scheduleDecorate(true),{once:true});else scheduleDecorate(true);
})();
