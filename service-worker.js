const VERSION='2025-10-02-08';
self.addEventListener('install', e=>{self.skipWaiting();});
self.addEventListener('activate', e=>{self.clients.claim();});
importScripts(`sw-${VERSION}.js`);
