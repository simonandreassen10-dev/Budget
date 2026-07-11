const CACHE_NAVN = 'budget-cache-v1';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAVN).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAVN).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Netværk først (så du altid får den nyeste version, når du er online),
// men falder tilbage til cachen hvis du er offline eller uden forbindelse.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // lad Firebase/Firestore-kald gå direkte til nettet

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const kopi = response.clone();
        caches.open(CACHE_NAVN).then((cache) => cache.put(event.request, kopi));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
