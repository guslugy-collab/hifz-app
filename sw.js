const CACHE_VERSION = 'hifz-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;

const SHELL_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './data/data.js',
  './data/wordByWord.js',
  './data/pagesList.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('hifz-') && k !== SHELL_CACHE && k !== IMAGES_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isImage = url.pathname.includes('/pages/');
  const cacheName = isImage ? IMAGES_CACHE : SHELL_CACHE;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(cacheName).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});

// Allow the page to ask how many page images are already cached, and to
// pre-warm the cache with a progress-reporting bulk download.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_STATUS') {
    caches.open(IMAGES_CACHE).then((cache) =>
      cache.keys().then((keys) => {
        event.source.postMessage({ type: 'CACHE_STATUS_RESULT', count: keys.length });
      })
    );
  }
});
