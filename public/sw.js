const CACHE_NAME = 'castiq-v1';
const STATIC_ASSETS = ['/', '/index.html'];

// Install: pre-cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API routes, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from the same origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Firebase + Functions calls: network-first (do not cache)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/__/') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('cloudfunctions')
  ) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Static assets: cache-first with network fallback
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
    )
  );
});
