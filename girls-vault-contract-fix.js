/* Girls Hidden Gallery PIN contract guard.
   The shared vault backend accepts exactly four digits. Keep the Girls setup UI
   aligned with that contract without changing Boys or the shared database logic. */
(() => {
'use strict';
function syncVaultPinUi(){
  const form=document.getElementById('setPinForm');
  if(!form)return;
  const input=form.elements?.pin;
  if(input){
    input.pattern='[0-9]{4}';
    input.minLength=4;
    input.maxLength=4;
    input.inputMode='numeric';
    input.autocomplete='off';
    input.setAttribute('aria-describedby','girls-vault-pin-help');
  }
  const modal=form.closest('.modal');
  const copy=modal?.querySelector('p');
  if(copy)copy.textContent='Set a 4-digit PIN. This gallery remains hidden until unlocked.';
  if(!form.querySelector('#girls-vault-pin-help')){
    const help=document.createElement('small');
    help.id='girls-vault-pin-help';
    help.textContent='Use exactly four numbers.';
    help.style.display='block';
    help.style.marginTop='-6px';
    help.style.color='var(--muted)';
    input?.closest('.field')?.appendChild(help);
  }
}
const observer=new MutationObserver(syncVaultPinUi);
observer.observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('focusin',event=>{if(event.target?.name==='pin')syncVaultPinUi()});
syncVaultPinUi();
})();
