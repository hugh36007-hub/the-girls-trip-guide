/* Capacitor-only bridge. The shared Girls runtime remains authoritative. */
(() => {
  'use strict';

  if (!window.GTG_NATIVE) return;

  const capacitor = window.Capacitor || {};
  const plugins = capacitor.Plugins || {};
  const App = plugins.App;
  const Browser = plugins.Browser;
  const Keyboard = plugins.Keyboard;
  const Network = plugins.Network;
  const SplashScreen = plugins.SplashScreen;
  const StatusBar = plugins.StatusBar;
  const supabaseUrl = 'https://vtcmvwixfqyxqghibsla.supabase.co';
  const supportEndpoint = `${supabaseUrl}/functions/v1/girls-contact-email`;
  const publishableKey = 'sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
  const blockedUsersKey = 'gtg-native-blocked-users-v1';
  const productionHosts = new Set(['thegirlstripguide.com', 'www.thegirlstripguide.com']);
  const externalProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);
  let nativeClient = null;

  const emit = (name, detail = {}) => window.dispatchEvent(new CustomEvent(name, { detail }));
  const safeCall = async (fn) => {
    try { return await fn(); } catch (error) { console.warn('[GTG native]', error); return null; }
  };

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

  function db() {
    if (nativeClient) return nativeClient;
    if (!window.supabase?.createClient) return null;
    nativeClient = window.supabase.createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return nativeClient;
  }

  async function nativeContext() {
    const client = db();
    const session = client ? (await client.auth.getSession()).data?.session : null;
    const user = session?.user || null;
    const tripId = new URL(window.location.href).searchParams.get('trip_id') || '';
    let trip = null;
    let profile = null;
    if (client && user) {
      const [tripResult, profileResult] = await Promise.all([
        tripId
          ? client.from('trips').select('id,name,owner_id,product_key').eq('id', tripId).eq('product_key', 'girls').maybeSingle()
          : Promise.resolve({ data: null }),
        client.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
      ]);
      trip = tripResult.data || null;
      profile = profileResult.data || null;
    }
    return { client, session, user, trip, profile, tripId };
  }

  function blockedUsers() {
    try { return new Set(JSON.parse(localStorage.getItem(blockedUsersKey) || '[]')); }
    catch { return new Set(); }
  }

  function isBlocked(userId) {
    return Boolean(userId) && blockedUsers().has(String(userId));
  }

  function blockUser(userId, displayName = 'this crew member') {
    if (!userId || !window.confirm(`Block ${displayName}? Their messages will be hidden on this device.`)) return false;
    const blocked = blockedUsers();
    blocked.add(String(userId));
    localStorage.setItem(blockedUsersKey, JSON.stringify([...blocked]));
    emit('gtg:native-block-list-changed', { userId: String(userId) });
    document.querySelectorAll(`[data-native-sender-user-id="${CSS.escape(String(userId))}"]`).forEach((node) => {
      (node.closest('.gtg-chat-msg, .gtg-convo-bubble, .gtg-message-row') || node).remove();
    });
    showToast(`${displayName} has been blocked on this device.`);
    return true;
  }

  async function sendSafetyRequest(category, message) {
    const context = await nativeContext();
    const { user, trip, profile } = context;
    const email = user?.email || '';
    if (!email) throw new Error('Sign in again before sending this request.');
    const name = profile?.display_name || user?.user_metadata?.display_name || 'Girls Trip Guide member';
    const response = await fetch(supportEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: publishableKey
      },
      body: JSON.stringify({
        name,
        email,
        tripName: trip?.name || '',
        category,
        message,
        website: ''
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'The request could not be sent.');
    return result;
  }

  async function reportContent({ kind = 'message', id = '', senderUserId = '', senderName = '', body = '' } = {}) {
    if (!window.confirm('Send this content to The Girls Trip Guide safety team for review?')) return;
    const tripId = new URL(window.location.href).searchParams.get('trip_id') || '';
    const reason = window.prompt('Briefly tell us what is wrong with this content:', 'Inappropriate content');
    if (!reason?.trim()) return;
    try {
      await sendSafetyRequest('safety-report', [
        'Signed-in in-app safety report.',
        `Reason: ${reason.trim().slice(0, 500)}`,
        `Content type: ${kind}`,
        `Content ID: ${id}`,
        `Trip ID: ${tripId}`,
        `Sender: ${senderName || 'Unknown'} (${senderUserId || 'unknown user'})`,
        `Content: ${String(body).slice(0, 1800)}`
      ].join('\n'));
      showToast('Report received. The content will be reviewed.');
    } catch (error) {
      showToast(error?.message || 'The report could not be sent.');
    }
  }

  function moderationControls(message, context) {
    const me = message?.current_user_id;
    if (!message?.sender_user_id || message.sender_user_id === me) return '';
    const details = encodeURIComponent(JSON.stringify({
      kind: context || 'message',
      id: message.id || '',
      senderUserId: message.sender_user_id,
      senderName: message.sender_name || '',
      body: message.message || ''
    }));
    return `<div class="native-safety-actions" data-native-safety="${details}" data-native-sender-user-id="${message.sender_user_id}"><button type="button" data-native-report>Report</button><button type="button" data-native-block>Block</button></div>`;
  }

  function installSafetyAndDeletionControls() {
    window.GTGNativeSafety = { isBlocked, moderationControls, reportContent, blockUser };

    document.addEventListener('click', (event) => {
      const report = event.target.closest('[data-native-report]');
      const block = event.target.closest('[data-native-block]');
      if (!report && !block) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const host = event.target.closest('[data-native-safety]');
      let details = {};
      try { details = JSON.parse(decodeURIComponent(host?.dataset.nativeSafety || '')); } catch {}
      if (report) void reportContent(details);
      if (block) blockUser(details.senderUserId, details.senderName || 'this crew member');
    }, true);

    const applyAccountControl = (root = document) => {
      const form = root.matches?.('#profileForm') ? root : root.querySelector?.('#profileForm');
      if (!form || form.querySelector('[data-native-delete-account]')) return;
      const section = document.createElement('section');
      section.className = 'native-account-deletion';
      section.innerHTML = '<h2>Delete account</h2><p>Request permanent deletion of your account and personal data. If you organise a trip, support will first help transfer or close anything the crew still depends on.</p><button type="button" class="ghost" data-native-delete-account>Request account deletion</button>';
      form.append(section);
    };

    document.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-native-delete-account]');
      if (!button) return;
      event.preventDefault();
      if (!window.confirm('Request permanent account deletion? This cannot be undone after support completes the request.')) return;
      if (window.prompt('Type DELETE to confirm your request:') !== 'DELETE') return;
      button.disabled = true;
      button.textContent = 'Sending request…';
      try {
        const context = await nativeContext();
        await sendSafetyRequest('account-deletion', [
          'Signed-in in-app account deletion request.',
          `User ID: ${context.user?.id || 'unknown'}`,
          `Current trip ID: ${context.trip?.id || 'none'}`,
          'Please verify ownership dependencies, close or transfer organiser-owned trips, and permanently delete the account and associated personal data.'
        ].join('\n'));
        button.textContent = 'Deletion requested';
        showToast('Deletion request received. Support will confirm when it is complete.');
      } catch (error) {
        button.disabled = false;
        button.textContent = 'Request account deletion';
        showToast(error?.message || 'The deletion request could not be sent.');
      }
    }, true);

    applyAccountControl();
    const observer = new MutationObserver((records) => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) applyAccountControl(node);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function installBlockedMediaFilter() {
    let timer = 0;
    const apply = async () => {
      const nodes = [...document.querySelectorAll('[data-panel="evidence"] [data-media-id]')];
      const ids = [...new Set(nodes.map((node) => node.dataset.mediaId).filter(Boolean))];
      const client = db();
      const tripId = new URL(window.location.href).searchParams.get('trip_id') || '';
      if (!client || !tripId || !ids.length) return;
      const { data, error } = await client
        .from('media')
        .select('id,created_by')
        .eq('trip_id', tripId)
        .in('id', ids);
      if (error) return;
      const authors = new Map((data || []).map((row) => [String(row.id), row.created_by]));
      for (const node of nodes) {
        if (!isBlocked(authors.get(String(node.dataset.mediaId)))) continue;
        (node.closest('.gtg-mobile-media-tile, .media') || node).remove();
      }
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void apply(), 120);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('gtg:native-block-list-changed', schedule);
    schedule();
  }

  function openIncomingUrl(rawUrl) {
    const localUrl = globalThis.GTGNativeUrl?.normalise(rawUrl, window.location.pathname);
    if (!localUrl) return false;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (localUrl === current) return true;
    window.history.replaceState({}, '', localUrl);
    emit('gtg:native-deep-link', { url: rawUrl });
    window.location.reload();
    return true;
  }

  function findClosable() {
    const selectors = [
      '[data-viewer] [data-action="close"]',
      '.viewer [data-action="close"]',
      '[data-action="close-viewer"]',
      '[data-modal] [data-action="close-modal"]',
      '.modal [data-action="close-modal"]',
      '[data-drawer] [data-action="close-modal"]'
    ];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.getClientRects().length) return element;
    }
    return null;
  }

  async function handleBackButton({ canGoBack } = {}) {
    const closable = findClosable();
    if (closable) {
      closable.click();
      return;
    }
    if (canGoBack) {
      window.history.back();
      return;
    }
    await safeCall(() => App?.exitApp());
  }

  function isExternalAnchor(anchor) {
    if (!anchor?.href) return false;
    try {
      const url = new URL(anchor.href, window.location.href);
      if (!externalProtocols.has(url.protocol)) return false;
      return url.origin !== window.location.origin;
    } catch {
      return false;
    }
  }

  async function openExternal(url) {
    if (Browser && /^https?:/i.test(url)) {
      await safeCall(() => Browser.open({ url, presentationStyle: 'popover' }));
      return;
    }
    window.location.href = url;
  }

  function installExternalLinkBoundary() {
    document.addEventListener('click', (event) => {
      const purchaseButton = event.target.closest('[data-action="stripe"], [data-action="upgrade"], [data-a="upgrade"], a[href*="full-trip"]');
      if (purchaseButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showToast('Existing Full Trip access is recognised automatically when you sign in.');
        return;
      }

      const anchor = event.target.closest('a[href]');
      if (!anchor || !isExternalAnchor(anchor)) return;
      const url = new URL(anchor.href, window.location.href);
      if (productionHosts.has(url.hostname) && openIncomingUrl(url.href)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      void openExternal(url.href);
    }, true);
  }

  function installNativeCommerceBoundary() {
    const apply = (root = document) => {
      root.querySelectorAll?.('[data-action="stripe"], [data-action="upgrade"], [data-a="upgrade"], a[href*="full-trip"]').forEach((control) => {
        if (control.dataset.nativeCommerceHandled === '1') return;
        const note = document.createElement('p');
        note.className = 'native-entitlement-note';
        note.dataset.nativeCommerceHandled = '1';
        note.textContent = 'Existing Full Trip access is recognised automatically when you sign in.';
        control.replaceWith(note);
      });
      root.querySelectorAll?.('.upgrade-price, .upgrade-final-copy, .compare-row, .price, .amount').forEach((element) => {
        if (/£24\.99|one-off upgrade|one payment/i.test(element.textContent || '')) element.hidden = true;
      });
    };

    apply();
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) apply(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function installNetworkBanner() {
    const banner = document.createElement('div');
    banner.className = 'native-network-banner';
    banner.hidden = true;
    banner.setAttribute('role', 'status');
    banner.textContent = 'No connection. Changes will resume when you are back online.';
    document.body.append(banner);

    const update = (connected) => {
      banner.hidden = connected;
      document.documentElement.classList.toggle('gtg-offline', !connected);
      emit(connected ? 'gtg:native-online' : 'gtg:native-offline');
    };

    if (Network) {
      void safeCall(async () => update((await Network.getStatus()).connected));
      void safeCall(() => Network.addListener('networkStatusChange', (status) => update(status.connected)));
    } else {
      update(navigator.onLine);
      window.addEventListener('online', () => update(true));
      window.addEventListener('offline', () => update(false));
    }
  }

  function installKeyboardHandling() {
    if (!Keyboard) return;
    void safeCall(() => Keyboard.addListener('keyboardWillShow', () => {
      document.documentElement.classList.add('gtg-keyboard-open');
      window.setTimeout(() => document.activeElement?.scrollIntoView?.({ block: 'center' }), 80);
    }));
    void safeCall(() => Keyboard.addListener('keyboardWillHide', () => {
      document.documentElement.classList.remove('gtg-keyboard-open');
    }));
  }

  async function initialiseNativeShell() {
    installExternalLinkBoundary();
    installNativeCommerceBoundary();
    installSafetyAndDeletionControls();
    installBlockedMediaFilter();
    installNetworkBanner();
    installKeyboardHandling();

    await safeCall(() => StatusBar?.setOverlaysWebView({ overlay: capacitor.getPlatform?.() !== 'android' }));
    await safeCall(() => StatusBar?.setStyle({ style: 'LIGHT' }));
    await safeCall(() => StatusBar?.setBackgroundColor({ color: '#070507' }));

    if (App) {
      await safeCall(() => App.addListener('backButton', handleBackButton));
      await safeCall(() => App.addListener('appUrlOpen', ({ url }) => openIncomingUrl(url)));
      await safeCall(() => App.addListener('appStateChange', ({ isActive }) => {
        document.documentElement.classList.toggle('gtg-app-backgrounded', !isActive);
        if (isActive) emit('gtg:native-resume');
      }));
      const launch = await safeCall(() => App.getLaunchUrl());
      if (launch?.url && openIncomingUrl(launch.url)) return;
    }

    await safeCall(() => SplashScreen?.hide({ fadeOutDuration: 220 }));
    emit('gtg:native-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void initialiseNativeShell(), { once: true });
  } else {
    void initialiseNativeShell();
  }
})();
