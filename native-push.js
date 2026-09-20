/* Capacitor-only native push bridge. */
(() => {
  'use strict';

  if (!window.GTG_NATIVE || window.__GTG_NATIVE_PUSH__) return;
  window.__GTG_NATIVE_PUSH__ = true;

  const capacitor = window.Capacitor || {};
  const PushNotifications = capacitor.Plugins?.PushNotifications;
  const platform = capacitor.getPlatform?.() || '';
  const provider = platform === 'ios' ? 'apns' : platform === 'android' ? 'fcm' : '';
  const productKey = 'girls';
  const supabaseUrl = 'https://vtcmvwixfqyxqghibsla.supabase.co';
  const publishableKey = 'sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
  const registerEndpoint = `${supabaseUrl}/functions/v1/push-register`;
  const prefKey = 'gtg-native-push-optin-v1';
  const tokenKey = 'gtg-native-push-token-v1';
  const errorKey = 'gtg-native-push-error-v1';
  const firstPromptKey = 'gtg-native-push-first-arrival-prompt-v1';
  let client = null;
  let lastAccessToken = '';
  let listenersInstalled = false;

  const safeCall = async (fn) => {
    try { return await fn(); }
    catch (error) { console.warn('[GTG native push]', error); return null; }
  };

  function db() {
    if (client) return client;
    if (!window.supabase?.createClient) return null;
    client = window.supabase.createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return client;
  }

  async function session() {
    const c = db();
    if (!c) return null;
    const current = (await c.auth.getSession()).data?.session || null;
    if (current?.access_token) lastAccessToken = current.access_token;
    return current;
  }

  function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast native-toast';
      toast.setAttribute('aria-live', 'polite');
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3200);
  }

  async function post(action, endpoint, accessToken) {
    if (!endpoint || !provider) throw new Error('Native notification token is unavailable.');
    const token = accessToken || (await session())?.access_token || lastAccessToken;
    if (!token) throw new Error('Sign in required.');
    const response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        action,
        product_key: productKey,
        platform,
        provider,
        endpoint
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Notification registration failed.');
    return result;
  }

  async function unregisterStored(accessToken) {
    const oldToken = localStorage.getItem(tokenKey) || '';
    if (!oldToken) return;
    try { await post('unregister', oldToken, accessToken); }
    finally {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(errorKey);
    }
  }

  async function registerToken(value) {
    const token = String(value || '').trim();
    if (!token || !provider) return;
    const currentSession = await session();
    if (!currentSession?.access_token) return;
    const previous = localStorage.getItem(tokenKey) || '';
    if (previous && previous !== token) {
      await post('unregister', previous, currentSession.access_token).catch(() => {});
    }
    await post('register', token, currentSession.access_token);
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(prefKey, '1');
    localStorage.removeItem(errorKey);
    refreshAll();
  }

  async function permissionState() {
    if (!PushNotifications) return 'unavailable';
    const result = await safeCall(() => PushNotifications.checkPermissions());
    return result?.receive || 'prompt';
  }

  async function enable() {
    if (!PushNotifications || !provider) throw new Error('Native notifications are unavailable in this build.');
    let state = await permissionState();
    if (state === 'prompt' || state === 'prompt-with-rationale') {
      const result = await PushNotifications.requestPermissions();
      state = result?.receive || 'denied';
    }
    if (state !== 'granted') throw new Error('Notifications are blocked in phone settings.');
    localStorage.setItem(prefKey, '1');
    localStorage.removeItem(errorKey);
    await PushNotifications.register();
    refreshAll();
  }

  async function disable() {
    const currentSession = await session();
    await unregisterStored(currentSession?.access_token || lastAccessToken).catch((error) => {
      console.warn('[GTG native push] unregister failed', error);
    });
    localStorage.removeItem(prefKey);
    refreshAll();
  }

  function statusText() {
    if (!PushNotifications || !provider) return 'Native notifications unavailable in this build';
    const error = localStorage.getItem(errorKey);
    if (error) return error;
    const on = localStorage.getItem(prefKey) === '1';
    const token = localStorage.getItem(tokenKey);
    if (on && token) return 'On for this device';
    if (on) return 'Waiting for device registration';
    return 'Off';
  }

  function refresh(root) {
    const status = root?.querySelector('[data-gtg-native-push-status]');
    const button = root?.querySelector('[data-gtg-native-push-toggle]');
    if (!status || !button) return;
    const on = localStorage.getItem(prefKey) === '1';
    status.textContent = statusText();
    button.textContent = on ? 'Turn off notifications' : 'Turn on notifications';
    button.dataset.pushOn = on ? '1' : '0';
    button.disabled = !PushNotifications || !provider;
  }

  function refreshAll() {
    document.querySelectorAll('[data-gtg-native-push-settings]').forEach(refresh);
  }

  function decorateProfile() {
    const form = document.querySelector('#profileForm');
    if (!form || form.querySelector('[data-gtg-native-push-settings]')) return;
    form.querySelector('[data-gtg-push-settings]')?.remove();
    const actions = form.querySelector('.form-actions, .actions, [data-profile-actions]');
    const section = document.createElement('div');
    section.className = 'field';
    section.dataset.gtgNativePushSettings = '1';
    section.innerHTML = '<label>Push notifications</label><p class="field-note">Get trip updates on this device. Notifications are only enabled when you choose them.</p><button class="ghost" type="button" data-gtg-native-push-toggle>Turn on notifications</button><small class="field-note" data-gtg-native-push-status>Checking…</small>';
    if (actions) form.insertBefore(section, actions); else form.append(section);
    refresh(section);
  }

  function routeNotification(notification) {
    const data = notification?.data || {};
    let rawUrl = data.url || '';
    if (!rawUrl && data.trip_id) {
      const target = new URL('https://thegirlstripguide.com/create-trip');
      target.searchParams.set('trip_id', data.trip_id);
      if (data.action) target.searchParams.set('action', data.action);
      rawUrl = target.toString();
    }
    if (!rawUrl) return;
    const localUrl = globalThis.GTGNativeUrl?.normalise?.(rawUrl, window.location.pathname);
    if (!localUrl) return;
    window.history.replaceState({}, '', localUrl);
    window.location.reload();
  }

  async function silentRefresh() {
    if (localStorage.getItem(prefKey) !== '1' || !PushNotifications) return;
    if (await permissionState() !== 'granted') return;
    await safeCall(() => PushNotifications.register());
  }

  async function installListeners() {
    if (listenersInstalled || !PushNotifications) return;
    listenersInstalled = true;
    await PushNotifications.addListener('registration', (token) => {
      void registerToken(token?.value).catch((error) => {
        console.warn('[GTG native push] registration failed', error);
        localStorage.setItem(errorKey, error?.message || 'Registration failed');
        refreshAll();
      });
    });
    await PushNotifications.addListener('registrationError', (error) => {
      const message = error?.error || error?.message || 'Device registration failed';
      localStorage.setItem(errorKey, String(message).slice(0, 160));
      refreshAll();
    });
    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => routeNotification(action?.notification));
    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      window.dispatchEvent(new CustomEvent('gtg:native-push-received', { detail: notification || {} }));
    });
  }

  function installAuthBoundary() {
    const c = db();
    if (!c) return;
    void session();
    c.auth.onAuthStateChange((event, nextSession) => {
      if (nextSession?.access_token) lastAccessToken = nextSession.access_token;
      if (event === 'SIGNED_IN' && localStorage.getItem(prefKey) === '1') void silentRefresh();
      if (event === 'SIGNED_OUT') {
        const token = lastAccessToken;
        void unregisterStored(token).catch(() => {}).finally(() => refreshAll());
      }
    });
  }

  function firstPromptSeen() {
    try { return localStorage.getItem(firstPromptKey) === '1'; }
    catch { return false; }
  }

  function markFirstPromptSeen() {
    try { localStorage.setItem(firstPromptKey, '1'); }
    catch {}
  }

  function installFirstPromptStyle() {
    if (document.getElementById('gtg-native-first-push-prompt-css')) return;
    const style = document.createElement('style');
    style.id = 'gtg-native-first-push-prompt-css';
    style.textContent = `
.gtg-native-first-push{position:fixed;inset:0;z-index:2147482999;display:grid;place-items:center;padding:20px;background:rgba(20,10,17,.52);backdrop-filter:blur(4px)}
.gtg-native-first-push__card{width:min(420px,100%);border:1px solid rgba(255,79,163,.28);border-radius:20px;background:#fff;color:#191316;padding:22px;box-shadow:0 24px 70px rgba(36,17,28,.24);font-family:Inter,system-ui,sans-serif}
.gtg-native-first-push__icon{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:#fff0f7;color:#ed2f8b;font-size:24px;margin-bottom:14px}
.gtg-native-first-push__card h2{margin:0 0 8px;font-size:22px;line-height:1.15;color:#191316}
.gtg-native-first-push__card p{margin:0;color:#6c5962;font-size:13px;line-height:1.5}
.gtg-native-first-push__actions{display:flex;justify-content:flex-end;gap:9px;margin-top:20px}
.gtg-native-first-push button{border:0;border-radius:999px;padding:10px 14px;font:800 12px/1 Inter,system-ui,sans-serif;cursor:pointer}
.gtg-native-first-push [data-native-first-push-later]{background:#f5edf1;color:#5d4853}
.gtg-native-first-push [data-native-first-push-enable]{background:#ff4fa3;color:#fff}
.gtg-native-first-push button:disabled{opacity:.55;cursor:wait}
.gtg-native-first-push__status{display:block;min-height:18px;margin-top:10px;color:#a23a6f;font-size:11px}
`;
    document.head.appendChild(style);
  }

  async function showFirstArrivalPrompt() {
    if (firstPromptSeen() || localStorage.getItem(prefKey) === '1' || !PushNotifications || !provider) return false;
    markFirstPromptSeen();
    installFirstPromptStyle();
    const state = await permissionState();
    const denied = state === 'denied';
    const root = document.createElement('div');
    root.className = 'gtg-native-first-push';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Turn on trip notifications');
    root.innerHTML = `<section class="gtg-native-first-push__card"><div class="gtg-native-first-push__icon" aria-hidden="true">🔔</div><h2>Turn on trip notifications?</h2><p>${denied ? 'Notifications are currently blocked in your phone settings. Turn them on there so you do not miss trip updates and reminders.' : 'Get trip updates, reminders and important changes on this device. You can turn notifications off later in My details.'}</p><small class="gtg-native-first-push__status" data-native-first-push-status></small><div class="gtg-native-first-push__actions"><button type="button" data-native-first-push-later>${denied ? 'Close' : 'Not now'}</button>${denied ? '' : '<button type="button" data-native-first-push-enable>Turn on notifications</button>'}</div></section>`;
    document.body.appendChild(root);
    root.querySelector('[data-native-first-push-later]')?.addEventListener('click', () => root.remove(), { once: true });
    const button = root.querySelector('[data-native-first-push-enable]');
    const status = root.querySelector('[data-native-first-push-status]');
    if (button) {
      button.addEventListener('click', () => {
        button.disabled = true;
        status.textContent = 'Turning notifications on…';
        void enable().then(() => {
          status.textContent = 'Notifications are on.';
          window.setTimeout(() => root.remove(), 450);
        }).catch((error) => {
          status.textContent = error?.message || 'Notifications could not be enabled.';
          button.disabled = false;
        });
      }, { once: true });
    }
    return true;
  }

  function scheduleProfileCheck() {
    [0, 80, 240, 600].forEach((ms) => setTimeout(decorateProfile, ms));
  }

  window.addEventListener('gtg:dashboard-tour-finished', (event) => {
    if (event.detail?.kind === 'first') window.setTimeout(() => void showFirstArrivalPrompt(), 100);
  });

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest?.('[data-gtg-native-push-toggle]');
    if (toggle) {
      event.preventDefault();
      const root = toggle.closest('[data-gtg-native-push-settings]');
      toggle.disabled = true;
      const run = toggle.dataset.pushOn === '1' ? disable() : enable();
      void run.catch((error) => showToast(error?.message || 'Notifications could not be changed.')).finally(() => refresh(root));
      return;
    }
    scheduleProfileCheck();
  }, true);

  async function initialise() {
    await installListeners();
    installAuthBoundary();
    scheduleProfileCheck();
    await silentRefresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void initialise(), { once: true });
  } else {
    void initialise();
  }
})();
