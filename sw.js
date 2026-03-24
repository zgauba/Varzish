// Varzish Service Worker — v13: icon active/dim state fixes
const CACHE = 'varzish-v13';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/ex-knee-push-up.png',
  './assets/ex-push-up.png',
  './assets/ex-door-towel-row.png',
  './assets/ex-bodyweight-squat.png',
  './assets/ex-reverse-lunge.png',
  './assets/ex-glute-bridge.png',
  './assets/ex-glute-bridge-march.png',
  './assets/ex-plank.png',
  './assets/ex-dead-bug.png',
  './assets/ex-superman-hold.png',
  './assets/ex-mountain-climbers.png',
  './assets/ex-bicycle-crunches.png',
  './assets/ex-cat-cow-stretch.png',
  './assets/ex-worlds-greatest-stretch.png',
  './assets/ex-hip-flexor-lunge-stretch.png',
  './assets/ex-butterfly-stretch.png',
  './assets/ex-90-90-hip-stretch.png',
  './assets/ex-pigeon-pose.png',
  './assets/ex-seated-forward-fold.png',
  './assets/ex-downward-dog.png',
  './assets/ex-squat-hold-deep.png',
  './assets/ex-wall-angels.png',
  './assets/ex-chin-tuck.png',
  './assets/ex-thoracic-extension.png',
  './assets/ex-active-rest-walk.png',
  './assets/silent.mp4',
  './assets/ex-banded-glute-bridge.png',
  './assets/ex-banded-row.png',
  './assets/ex-banded-lateral-walk.png',
];

// On install, cache the app shell + all assets, then immediately activate
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  // Skip waiting so the new SW activates as soon as it's installed
  self.skipWaiting();
});

// On activate, remove old caches, claim all clients, then notify them to reload
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => {
      // Claim all open clients immediately
      return self.clients.claim();
    }).then(() => {
      // Tell every open window/tab that a new version is active → triggers auto-reload
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED', version: CACHE }));
      });
    })
  );
});

// Fetch strategy:
// - Google Fonts: network first, cache on success, fall back to cache when offline
// - HTML navigation: network first so updates are always picked up
// - Everything else (images, assets): cache first, network fallback
self.addEventListener('fetch', e => {
  const url = e.request.url;

  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Network-first for HTML so updates are always picked up
  if (e.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for everything else (images, JS, CSS)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
