const VERSION='2025-10-02-10';
self.addEventListener('install', e=>{self.skipWaiting();});
self.addEventListener('activate', e=>{self.clients.claim();});
importScripts(`sw-${VERSION}.js`);
