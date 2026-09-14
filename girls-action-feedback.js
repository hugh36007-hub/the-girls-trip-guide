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
  const TEMP_ID_NAME = '__gtg_record_id';

  function formId(form) {
    return form?.getAttribute?.('id') || '';
  }

  function temporarilyUnclobberId(form) {
    const actualId = formId(form);
    if (!actualId || (typeof form.id === 'string' && form.id === actualId)) return [];
    const controls = [...form.querySelectorAll('[name="id"]')];
    for (const control of controls) {
      control.dataset.gtgOriginalName = 'id';
      control.name = TEMP_ID_NAME;
    }
    return controls;
  }

  function restoreIdControls(controls) {
    for (const control of controls) {
      if (!control.isConnected || control.dataset.gtgOriginalName !== 'id') continue;
      control.name = 'id';
      delete control.dataset.gtgOriginalName;
    }
  }

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
    const label = LABELS[formId(form)] || 'Working…';
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

  // HTML forms expose named controls as properties. A hidden input named "id" can therefore
  // shadow form.id. Keep the stored record id in FormData while allowing downstream handlers
  // to read the form's real id attribute during the submit event.
  document.addEventListener('formdata', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const recordId = form.querySelector(`[name="${TEMP_ID_NAME}"][data-gtg-original-name="id"]`);
    if (recordId) event.formData.set('id', recordId.value);
  });

  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const renamed = temporarilyUnclobberId(form);
    if (renamed.length) window.setTimeout(() => restoreIdControls(renamed), 0);

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
