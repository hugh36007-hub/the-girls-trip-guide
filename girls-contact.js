(() => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  if (!form || !status) return;

  const submit = form.querySelector('button[type="submit"]');
  const fileInput = form.querySelector('input[name="attachment"]');
  const fileName = document.getElementById('attachment-name');
  const endpoint = 'https://vtcmvwixfqyxqghibsla.supabase.co/functions/v1/girls-contact-email';
  const apikey = 'sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
  const maxBytes = 10 * 1024 * 1024;
  const allowedTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]);
  let hideTimer;

  function showStatus(type, message) {
    clearTimeout(hideTimer);
    status.className = 'contact-status show ' + type;
    status.textContent = message;
    hideTimer = setTimeout(() => {
      status.className = 'contact-status';
      status.textContent = '';
    }, 7000);
  }

  function readAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const comma = result.indexOf(',');
        if (comma < 0) return reject(new Error('The attachment could not be read.'));
        resolve(result.slice(comma + 1));
      };
      reader.onerror = () => reject(new Error('The attachment could not be read.'));
      reader.readAsDataURL(file);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        if (fileName) fileName.textContent = 'No file selected.';
        return;
      }
      if (!allowedTypes.has(file.type) || file.size > maxBytes) {
        fileInput.value = '';
        if (fileName) fileName.textContent = 'No file selected.';
        showStatus('bad', file.size > maxBytes
          ? '✕ Attachment is too large. Maximum file size is 10 MB.'
          : '✕ Please attach a JPG, PNG, WebP, PDF, DOC or DOCX file.');
        return;
      }
      if (fileName) fileName.textContent = file.name;
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'contact-status';
    status.textContent = '';
    submit.disabled = true;
    submit.textContent = 'Sending…';

    try {
      const formData = new FormData(form);
      const data = {
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        tripName: formData.get('tripName') || '',
        category: formData.get('category') || 'general',
        message: formData.get('message') || '',
        website: formData.get('website') || ''
      };

      const file = fileInput && fileInput.files && fileInput.files[0];
      if (file) {
        if (file.size > maxBytes) throw new Error('Attachment is too large. Maximum file size is 10 MB.');
        if (!allowedTypes.has(file.type)) throw new Error('Please attach a JPG, PNG, WebP, PDF, DOC or DOCX file.');
        data.attachment = {
          filename: file.name,
          type: file.type,
          content: await readAsBase64(file)
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apikey
        },
        body: JSON.stringify(data)
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Message could not be sent.');

      showStatus('ok', '✓ Message sent successfully. Neville has it from here.');
      form.reset();
      if (fileName) fileName.textContent = 'No file selected.';
    } catch (err) {
      showStatus('bad', '✕ Message not sent. ' + (err && err.message ? err.message : 'Please try again.'));
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send to Neville →';
    }
  });
})();
