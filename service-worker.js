/* =========================================================
   ADROOSIS - Service Worker
   Estrategia:
   - Navegación (index.html): network-first con timeout.
     Si hay red se sirve la versión nueva; si no, la copia local.
   - Estáticos (CSS, fuentes, imágenes): stale-while-revalidate.
   - Solo peticiones GET del mismo origen.
   - Rutas relativas: funciona en /ADROOSIS/ o en la raíz.
   ========================================================= */

const VERSION = "2.8.0";
const STATIC_CACHE = `adroosis-static-${VERSION}`;
const HTML_CACHE = `adroosis-html-${VERSION}`;
const INDEX_KEY = "./index.html";
const NAV_TIMEOUT_MS = 4000;

const PRECACHE_STATIC = [
  "./manifest.json",
  "./tailwind.min.css",
  "./css/app.css",
  "./js/data.js",
  "./js/app.js",
  "./js/pwa.js",
  "./js/nihss.js",
  "./vendor/fontawesome/css/all.min.css",
  "./logo-192.webp",
  "./icon-192.png",
  "./icon-512.png",
  "./vendor/fontawesome/webfonts/fa-brands-400.woff2",
  "./vendor/fontawesome/webfonts/fa-regular-400.woff2",
  "./vendor/fontawesome/webfonts/fa-solid-900.woff2",
  "./vendor/fontawesome/webfonts/fa-v4compatibility.woff2",
  "./nihss-precarious-painter.jpg"
];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ADROOSIS - Sin conexión</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc;color:#0f172a;text-align:center;padding:24px}div{max-width:420px}h1{font-size:1.25rem}p{color:#475569;font-size:.95rem;line-height:1.6}</style>
</head><body><div><h1>Sin conexión</h1>
<p>ADROOSIS no pudo cargar la aplicación. Abre la app al menos una vez con internet para que quede guardada en el dispositivo.</p></div></body></html>`;

/* ---------- Utilidades ---------- */

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))
  ]);
}

async function precache(cacheName, urls) {
  const cache = await caches.open(cacheName);
  const results = await Promise.allSettled(
    urls.map((url) => cache.add(new Request(url, { cache: "reload" })))
  );
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.warn("[SW] No se pudo precachear:", urls[i], result.reason);
    }
  });
}

/* ---------- Ciclo de vida ---------- */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await Promise.all([
        precache(STATIC_CACHE, PRECACHE_STATIC),
        precache(HTML_CACHE, [INDEX_KEY])
      ]);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC_CACHE, HTML_CACHE]);
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => (keep.has(key) ? null : caches.delete(key))));
      await self.clients.claim();
    })()
  );
});

/* ---------- Estrategias ---------- */

async function handleNavigate(request) {
  const cache = await caches.open(HTML_CACHE);
  try {
    const response = await withTimeout(fetch(request), NAV_TIMEOUT_MS);
    // Si hay red y responde bien, se sirve y se guarda la copia nueva.
    if (response && response.ok) {
      cache.put(INDEX_KEY, response.clone());
      return response;
    }
  } catch (error) {
    // Sin red o tiempo de espera agotado: se usa la copia local.
  }
  const cached = await cache.match(INDEX_KEY);
  if (cached) return cached;
  return new Response(OFFLINE_HTML, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });

  const network = fetch(request)
    .then((response) => {
      if (response && response.ok && response.type === "basic") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    network.catch(() => {});
    return cached;
  }

  const fresh = await network;
  if (fresh) return fresh;

  return new Response("", { status: 504, statusText: "Offline" });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

/* ---------- Mensajes desde la página ---------- */

self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data === "SKIP_WAITING" || event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (event.data.type === "GET_VERSION" && event.source) {
    event.source.postMessage({ type: "VERSION", version: VERSION });
  }
});
