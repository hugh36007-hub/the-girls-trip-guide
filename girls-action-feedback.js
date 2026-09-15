(() => {
  'use strict';

  // Disable the broken direct FX runtime before it executes, then load the corrected
  // controller. The corrected controller uses globalThis.URL for trip URL parsing.
  if (!window.__GTG_FX_FIXED_BOOTSTRAP__) {
    window.__GTG_FX_FIXED_BOOTSTRAP__ = true;
    window.__GTG_FX_EXPENSES__ = true;
    const fxScript = document.createElement('script');
    fxScript.src = '/girls-fx-expenses-fixed.js?v=20260915-1';
    fxScript.async = false;
    fxScript.dataset.gtgFxFixed = '1';
    document.head.appendChild(fxScript);
  }

  // Resend is a core organiser action, not a route enhancement. Start its handler
  // with the core form layer so a slow/deferred theme bundle cannot miss submit.
  if (!document.querySelector('script[data-gtg-resend-core]')) {
    const resendScript = document.createElement('script');
    resendScript.src = '/girls-resend-invite-fix.js?v=20260914-3';
    resendScript.async = false;
    resendScript.dataset.gtgResendCore = '1';
    document.head.appendChild(resendScript);
  }

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
  const MANAGED_FORM_IDS = new Set(['bookingForm', 'expenseForm']);

  function formId(form) {
    return form?.getAttribute?.('id') || '';
  }

  function prepareForm(form) {
    if (!(form instanceof HTMLFormElement) || !MANAGED_FORM_IDS.has(formId(form))) return;
    for (const control of form.querySelectorAll('[name="id"]')) {
      control.dataset.gtgOriginalName = 'id';
      control.name = TEMP_ID_NAME;
    }
  }

  function prepareManagedForms() {
    document.querySelectorAll('#bookingForm,#expenseForm').forEach(prepareForm);
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

  // A named control called "id" shadows HTMLFormElement.id. Prepare the two core
  // Plan/Money forms as soon as they exist so the core submit handler always sees
  // the real form id. Preserve the record id in FormData for edit flows.
  document.addEventListener('formdata', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const recordId = form.querySelector(`[name="${TEMP_ID_NAME}"][data-gtg-original-name="id"]`);
    if (!recordId) return;
    event.formData.delete(TEMP_ID_NAME);
    event.formData.set('id', recordId.value);
  });

  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    prepareForm(form);
    if (form.dataset.actionBusy === '1') {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    start(form);
  }, true);

  new MutationObserver(prepareManagedForms).observe(document.documentElement, { childList: true, subtree: true });
  prepareManagedForms();

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