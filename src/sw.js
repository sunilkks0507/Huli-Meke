// Service Worker for Huli Meke - Offline PWA
const CACHE_NAME = 'huli-meke-v1.1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './privacy.html',
  './css/styles.css',
  './data/boards.json',
  './js/main.js',
  './js/dialog.js',
  './js/settings-view.js',
  './js/engine.js',
  './js/board-view.js',
  './js/game-view.js',
  './js/game-controller.js',
  './js/setup-screens.js',
  './js/tutorial.js',
  './js/sound.js',
  './js/storage.js',
  './js/ai.js',
  './js/ai-worker.js',
  './js/ai-service.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network-first for navigation / HTML requests to ensure fresh app versions
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first with network fallback and background update for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
