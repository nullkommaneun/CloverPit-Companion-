const VERSION='2025-10-02-10';
const CACHE='cloverpit-'+VERSION;
const ASSETS=['./','./index.html','./style.css?v='+VERSION,'./manifest.webmanifest?v='+VERSION,'./version.json?v='+VERSION,'./icons/app-192.png','./icons/app-512.png','./charms.json?v='+VERSION];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>(k.startsWith('cloverpit-')&&k!==CACHE)?caches.delete(k):null))))); self.clients.claim();});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  const isHTML=url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');
  const isVersion=url.pathname.endsWith('/version.json');
  if(isHTML||isVersion){
    e.respondWith(fetch(new Request(e.request,{cache:'no-store'})).then(r=>{caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r;}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(resp=>resp||fetch(e.request).then(r=>{caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r;})));
});
