const VERSION='2025-10-02-09';
self.addEventListener('install', e=>{self.skipWaiting();});
self.addEventListener('activate', e=>{self.clients.claim();});
importScripts(`sw-${VERSION}.js`);
