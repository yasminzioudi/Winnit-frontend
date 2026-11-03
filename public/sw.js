// WINNIT OS Service Worker v1
const VERSION = 'v1';
const STATIC_CACHE = `winnit-static-${VERSION}`;
const PAGES_CACHE = `winnit-pages-${VERSION}`;
const API_CACHE = `winnit-api-${VERSION}`;
const MAX_API_ENTRIES = 60;
const API_TTL = 24 * 60 * 60 * 1000; // 24 hours

const PRECACHE_ASSETS = [
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-192.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
];

// Install - precache offline assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

// Activate - delete old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('winnit-') && key !== STATIC_CACHE && key !== PAGES_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - routing strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET or requests with Authorization header
  if (request.method !== 'GET' || request.headers.has('Authorization')) {
    return;
  }

  // Never cache reports
  if (url.pathname.startsWith('/api/v1/reports')) {
    return;
  }

  // Navigation requests (HTML pages) - Network First
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Static assets - Cache First
  if (
    url.pathname.startsWith('/_next/static/') ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
        );
      })
    );
    return;
  }

  // API routes - Stale-While-Revalidate with TTL
  if (
    url.pathname.startsWith('/api/v1/analytics/') ||
    url.pathname.startsWith('/api/v1/orders') ||
    url.pathname.startsWith('/api/v1/expenses') ||
    url.pathname.startsWith('/api/v1/marketing/ad-spend') ||
    url.pathname.startsWith('/api/v1/settlements') ||
    url.pathname.startsWith('/api/v1/scenarios') ||
    url.pathname.startsWith('/api/v1/products')
  ) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response.ok) {
                const clone = response.clone();
                // Add timestamp header for TTL
                const headers = new Headers(response.headers);
                headers.set('sw-cached-at', Date.now().toString());
                const cachedResponse = new Response(clone.body, {
                  status: response.status,
                  statusText: response.statusText,
                  headers: headers,
                });
                
                // Limit cache size
                cache.put(request, cachedResponse).then(() => {
                  cache.keys().then((keys) => {
                    if (keys.length > MAX_API_ENTRIES) {
                      cache.delete(keys[0]);
                    }
                  });
                });
              }
              return response;
            })
            .catch(() => cached);

          // Check TTL on cached response
          if (cached) {
            const cachedAt = cached.headers.get('sw-cached-at');
            if (cachedAt && Date.now() - parseInt(cachedAt) > API_TTL) {
              return fetchPromise;
            }
          }

          return cached || fetchPromise;
        });
      })
    );
    return;
  }
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_USER_CACHES') {
    event.waitUntil(
      caches.delete(API_CACHE).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});
