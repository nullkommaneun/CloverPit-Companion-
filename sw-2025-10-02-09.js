const VERSION='2025-10-02-09';
const CACHE = `cloverpit-${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  `./style.css?v=${VERSION}`,
  `./manifest.webmanifest?v=${VERSION}`,
  `./version.json?v=${VERSION}`,
  './icons/app-192.png',
  './icons/app-512.png',
  `./charms.json?v=${VERSION}`
];
self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k.startsWith('cloverpit-') && k !== CACHE) ? caches.delete(k) : null)))
  );
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isHTML = url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  const isVersion = url.pathname.endsWith('/version.json');
  if (isHTML || isVersion) {
    event.respondWith(
      fetch(new Request(event.request, { cache: 'no-store' }))
        .then(resp => { caches.open(CACHE).then(c => c.put(event.request, resp.clone())); return resp; })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).then(networkResp => {
      const copy = networkResp.clone();
      caches.open(CACHE).then(c => c.put(event.request, copy));
      return networkResp;
    }))
  );
});
