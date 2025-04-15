// public/service-worker.js

self.addEventListener("install", (event) => {
  // Yeni service worker direkt devreye girsin
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Tüm eski cache'leri sil
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((cache) => caches.delete(cache)))
    )
  );
  self.clients.claim(); // Tüm client'lara kontrolü hemen al
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Sadece kendi alan adından gelen istekleri işliyoruz (güvenli yol)
  if (requestUrl.origin === location.origin) {
    event.respondWith(fetch(event.request));
  }
});
