const APP_CACHE = 'ask-before-buy-shell-v1';
const DATA_CACHE = 'ask-before-buy-data-v1';
const APP_SHELL = [
  './','./index.html','./styles.css','./app.js','./manifest.webmanifest',
  './icon-192.png','./icon-512.png','./product-lookup.js','./barcode-v49.js',
  './offline.js','./offline-v46.js','./offline-v47.js','./offline-v48.js',
  './v66-trust-deal-guard.js','./v68-final-ui.js','./v69-release-ui.js','./v80-purchase-decision.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => ![APP_CACHE,DATA_CACHE].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(DATA_CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
