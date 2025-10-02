/* CloverPit SW single-file v 2025-10-02-12 */
(function(){
  'use strict';
  var VERSION = '2025-10-02-12';
  var CACHE = 'cloverpit-' + VERSION;
  var ASSETS = [
    './',
    './index.html',
    './style.css?v=' + VERSION,
    './manifest.webmanifest?v=' + VERSION,
    './version.json?v=' + VERSION,
    './icons/app-192.png',
    './icons/app-512.png',
    './charms.json?v=' + VERSION
  ];

  self.addEventListener('message', function(e){
    if (e && e.data === 'SKIP_WAITING') self.skipWaiting();
  });

  self.addEventListener('install', function(event){
    event.waitUntil(caches.open(CACHE).then(function(cache){ return cache.addAll(ASSETS); }));
    self.skipWaiting();
  });

  self.addEventListener('activate', function(event){
    event.waitUntil(
      caches.keys().then(function(keys){
        return Promise.all(keys.map(function(k){
          if (k.indexOf('cloverpit-') === 0 && k !== CACHE) return caches.delete(k);
          return Promise.resolve();
        }));
      })
    );
    self.clients.claim();
  });

  self.addEventListener('fetch', function(event){
    var url = new URL(event.request.url);
    var isHTML = url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
    var isVersion = url.pathname.endsWith('/version.json');

    if (isHTML || isVersion) {
      event.respondWith(
        fetch(new Request(event.request, { cache: 'no-store' }))
          .then(function(resp){
            var copy = resp.clone();
            caches.open(CACHE).then(function(c){ c.put(event.request, copy); });
            return resp;
          })
          .catch(function(){ return caches.match(event.request); })
      );
      return;
    }

    event.respondWith(
      caches.match(event.request).then(function(resp){
        if (resp) return resp;
        return fetch(event.request).then(function(networkResp){
          var copy = networkResp.clone();
          caches.open(CACHE).then(function(c){ c.put(event.request, copy); });
          return networkResp;
        });
      })
    );
  });
})();