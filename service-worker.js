const CACHE_NAME = "adroosis-v1";
const ASSETS_TO_CACHE = [
  "/ADROOSIS/",
  "/ADROOSIS/index.html",
  "/ADROOSIS/manifest.json",
  "/ADROOSIS/pwa.js",
  "/ADROOSIS/assets/tailwind.css",
  "/ADROOSIS/vendor/fontawesome/css/all.min.css",
  "/ADROOSIS/vendor/fontawesome/webfonts/fa-solid-900.woff2",
  "/ADROOSIS/vendor/fontawesome/webfonts/fa-regular-400.woff2",
  "/ADROOSIS/icons/icon-192.png",
  "/ADROOSIS/icons/icon-512.png"
];

// Instalación: guarda en caché los archivos esenciales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpia cachés viejas si actualizas la versión
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepta peticiones para servir el contenido offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Si no hay red y se pide la página principal, se devuelve el index cacheado
        if (event.request.mode === "navigate") {
          return caches.match("/ADROOSIS/");
        }
      });
    })
  );
});

// Mensaje para forzar actualización inmediata
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});