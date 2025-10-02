const CACHE = 'cloverpit-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './charms.json',
  './manifest.webmanifest',
  './icons/app-192.png',
  './icons/app-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (ASSETS.includes(url.pathname.replace(self.registration.scope.replace(/\/$/, ''), '.'))) {
    event.respondWith(caches.match(event.request));
    return;
  }
  event.respondWith(
   caches.match(event.request).then(resp => resp || fetch(event.request).then(networkResp => {
      const copy = networkResp.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return networkResp;
    }).catch(() => caches.match('./index.html')))
  );
});
