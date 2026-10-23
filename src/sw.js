// Service Worker for Huli Meke - Offline PWA
const CACHE_NAME = 'huli-meke-v1.0';

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

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
