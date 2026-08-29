(() => {
  'use strict';

  const LABELS = {
    emailForm: 'Sending code…',
    otpForm: 'Signing in…',
    createTripForm: 'Creating trip…',
    joinForm: 'Joining trip…',
    bookingForm: 'Saving…',
    expenseForm: 'Saving…',
    requestForm: 'Creating request…',
    inviteForm: 'Sending invite…',
    settingsForm: 'Saving…',
    editTripForm: 'Saving…',
    profileForm: 'Saving…',
    memberForm: 'Saving…',
    messageForm: 'Sending…',
    uploadForm: 'Uploading…',
    documentForm: 'Uploading…',
    heroForm: 'Uploading…',
    vaultUploadForm: 'Uploading…',
    setPinForm: 'Saving PIN…',
    unlockForm: 'Unlocking…'
  };

  const active = new Set();

  function submitButton(form) {
    return form.querySelector('button[type="submit"], .modal-actions .btn.primary, button.btn.primary:not([type="button"])');
  }

  function start(form) {
    if (!form || form.dataset.actionBusy === '1') return false;
    const button = submitButton(form);
    if (!button) return true;

    form.dataset.actionBusy = '1';
    form.setAttribute('aria-busy', 'true');
    button.dataset.busyOriginal = button.innerHTML;
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
    button.classList.add('is-busy');
    const label = LABELS[form.id] || 'Working…';
    button.innerHTML = `<span class="action-spinner" aria-hidden="true"></span><span>${label}</span>`;
    active.add(form);

    // Absolute failsafe: never leave a live form stuck if a network request dies silently.
    window.setTimeout(() => {
      if (form.isConnected && form.dataset.actionBusy === '1') reset(form);
    }, 15000);
    return true;
  }

  function reset(form) {
    if (!form) return;
    const button = submitButton(form);
    form.removeAttribute('aria-busy');
    delete form.dataset.actionBusy;
    if (button) {
      if (button.dataset.busyOriginal !== undefined) button.innerHTML = button.dataset.busyOriginal;
      delete button.dataset.busyOriginal;
      button.disabled = false;
      button.removeAttribute('aria-disabled');
      button.classList.remove('is-busy');
    }
    active.delete(form);
  }

  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.dataset.actionBusy === '1') {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    start(form);
  }, true);

  const toast = document.getElementById('toast');
  if (toast) {
    new MutationObserver(() => {
      if (!toast.classList.contains('show')) return;
      for (const form of [...active]) {
        if (form.isConnected) reset(form);
        else active.delete(form);
      }
    }).observe(toast, { attributes: true, childList: true, characterData: true, subtree: true });
  }
})();
