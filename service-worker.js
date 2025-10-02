const VERSION = '2025-10-02-02';
const CACHE = `cloverpit-${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './charms.json',
  './manifest.webmanifest',
  './icons/app-192.png',
  './icons/app-512.png',
  './version.json'
];

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

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
  const scope = self.registration.scope.replace(/\/$/, '');
  const path = url.pathname.startsWith(scope) ? '.' + url.pathname.slice(scope.length) : url.pathname;

  const isHtml = path === './' || path.endsWith('/index.html');
  const isVersion = path.endsWith('/version.json');

  if (isHtml || isVersion) {
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
