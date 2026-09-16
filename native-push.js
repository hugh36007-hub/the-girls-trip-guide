/* Capacitor-only native push bridge. Notifications default ON; OS permission remains user-controlled. */
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
  let client = null;
  let lastAccessToken = '';
  let listenersInstalled = false;

  if (localStorage.getItem(prefKey) === null) localStorage.setItem(prefKey, '1');
  const wanted = () => localStorage.getItem(prefKey) !== '0';

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
      body: JSON.stringify({ action, product_key: productKey, platform, provider, endpoint })
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
    if (!wanted()) return;
    const token = String(value || '').trim();
    if (!token || !provider) return;
    const currentSession = await session();
    if (!currentSession?.access_token) return;
    const previous = localStorage.getItem(tokenKey) || '';
    if (previous && previous !== token) await post('unregister', previous, currentSession.access_token).catch(() => {});
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
    localStorage.setItem(prefKey, '1');
    let state = await permissionState();
    if (state === 'prompt' || state === 'prompt-with-rationale') {
      const result = await PushNotifications.requestPermissions();
      state = result?.receive || 'denied';
    }
    if (state !== 'granted') throw new Error('Notifications are blocked in phone settings.');
    localStorage.removeItem(errorKey);
    await PushNotifications.register();
    refreshAll();
  }

  async function disable() {
    const currentSession = await session();
    await unregisterStored(currentSession?.access_token || lastAccessToken).catch((error) => console.warn('[GTG native push] unregister failed', error));
    localStorage.setItem(prefKey, '0');
    localStorage.removeItem(errorKey);
    refreshAll();
  }

  function statusText() {
    if (!PushNotifications || !provider) return 'Native notifications unavailable in this build';
    if (!wanted()) return 'Off';
    const error = localStorage.getItem(errorKey);
    if (error) return error;
    const token = localStorage.getItem(tokenKey);
    if (token) return 'On for this device';
    return 'On by default · waiting for phone permission';
  }

  function refresh(root) {
    const status = root?.querySelector('[data-gtg-native-push-status]');
    const button = root?.querySelector('[data-gtg-native-push-toggle]');
    if (!status || !button) return;
    const on = wanted();
    status.textContent = statusText();
    button.textContent = on ? 'Turn off notifications' : 'Turn on notifications';
    button.dataset.pushOn = on ? '1' : '0';
    button.disabled = !PushNotifications || !provider;
  }

  function refreshAll() { document.querySelectorAll('[data-gtg-native-push-settings]').forEach(refresh); }

  function decorateProfile() {
    const form = document.querySelector('#profileForm');
    if (!form || form.querySelector('[data-gtg-native-push-settings]')) return;
    form.querySelector('[data-gtg-push-settings]')?.remove();
    const actions = form.querySelector('.form-actions, .actions, [data-profile-actions]');
    const section = document.createElement('div');
    section.className = 'field';
    section.dataset.gtgNativePushSettings = '1';
    section.innerHTML = '<label>Push notifications</label><p class="field-note">Notifications are on by default. Your phone will ask permission the first time.</p><button class="ghost" type="button" data-gtg-native-push-toggle>Checking…</button><small class="field-note" data-gtg-native-push-status>Checking…</small>';
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
    if (!wanted() || !PushNotifications) return;
    if (await permissionState() !== 'granted') return;
    localStorage.removeItem(errorKey);
    await safeCall(() => PushNotifications.register());
  }

  async function ensureDefaultEnabled() {
    if (!wanted() || !PushNotifications || !provider) return;
    const currentSession = await session();
    if (!currentSession?.access_token) return;
    const state = await permissionState();
    if (state === 'granted') { await silentRefresh(); return; }
    if (state === 'prompt' || state === 'prompt-with-rationale') {
      try { await enable(); }
      catch (error) { localStorage.setItem(errorKey, error?.message || 'Phone permission is required.'); refreshAll(); }
      return;
    }
    if (state === 'denied') {
      localStorage.setItem(errorKey, 'On in app · blocked in phone settings');
      refreshAll();
    }
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
    await PushNotifications.addListener('pushNotificationReceived', (notification) => window.dispatchEvent(new CustomEvent('gtg:native-push-received', { detail: notification || {} })));
  }

  function installAuthBoundary() {
    const c = db();
    if (!c) return;
    void session();
    c.auth.onAuthStateChange((event, nextSession) => {
      if (nextSession?.access_token) lastAccessToken = nextSession.access_token;
      if (event === 'SIGNED_IN' && wanted()) void ensureDefaultEnabled();
      if (event === 'SIGNED_OUT') {
        const token = lastAccessToken;
        void unregisterStored(token).catch(() => {}).finally(() => refreshAll());
      }
    });
  }

  function scheduleProfileCheck() { [0, 80, 240, 600].forEach((ms) => setTimeout(decorateProfile, ms)); }

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
    await ensureDefaultEnabled();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void initialise(), { once: true });
  else void initialise();
})();
