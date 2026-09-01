/* Shared, testable URL boundary for production invitation/deep links. */
(() => {
  'use strict';

  const productionHosts = new Set(['thegirlstripguide.com', 'www.thegirlstripguide.com']);
  const appPaths = new Set(['/', '/index.html', '/create-trip', '/create-trip.html', '/invite.html']);

  function normalise(rawUrl, currentPath = '/') {
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== 'https:') return null;
      if (!productionHosts.has(url.hostname)) return null;
      if (!appPaths.has(url.pathname)) return null;
      let safePath = url.pathname;
      if (safePath === '/create-trip') safePath = '/create-trip.html';
      if ((safePath === '/' || safePath === '/index.html') && url.searchParams.has('trip_id')) {
        safePath = '/create-trip.html';
      }
      if ((safePath === '/' || safePath === '/index.html') && currentPath === '/create-trip.html') {
        safePath = currentPath;
      }
      return `${safePath}${url.search}${url.hash}`;
    } catch {
      return null;
    }
  }

  globalThis.GTGNativeUrl = Object.freeze({ normalise });
})();
