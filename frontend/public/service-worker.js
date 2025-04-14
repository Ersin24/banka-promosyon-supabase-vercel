// public/service-worker.js

self.addEventListener("install", (event) => {
    self.skipWaiting(); // Yeni SW hemen devreye girsin
  });
  
  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) =>
        Promise.all(cacheNames.map((cache) => caches.delete(cache)))
      )
    );
    self.clients.claim();
  });
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(fetch(event.request));
  });
  