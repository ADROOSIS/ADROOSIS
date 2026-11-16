
const CACHE_NAME = "adroosis-v2";
const RUNTIME_CACHE = "adroosis-runtime-v2";

// Archivos que SÍ existen en la raíz del repositorio.
const ASSETS_TO_CACHE = [
    "/ADROOSIS/",
    "/ADROOSIS/index.html",
    "/ADROOSIS/manifest.json",
    "/ADROOSIS/logo1.png",
    "/ADROOSIS/icon-192.png",
    "/ADROOSIS/icon-512.png",
    "/ADROOSIS/fa-brands-400.woff2",
    "/ADROOSIS/fa-regular-400.woff2",
    "/ADROOSIS/fa-solid-900.woff2",
    "/ADROOSIS/fa-v4compatibility.woff2"
];

// Instalación
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Activación
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key =>
                        key.startsWith("adroosis-") &&
                        key !== CACHE_NAME &&
                        key !== RUNTIME_CACHE
                    )
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Interceptar solicitudes
self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // Navegación: primero intenta conectarse y luego usa la copia local.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone();

                    event.waitUntil(
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(
                                "/ADROOSIS/index.html",
                                copy
                            ))
                    );

                    return response;
                })
                .catch(async () => {
                    return await caches.match("/ADROOSIS/index.html") ||
                           await caches.match("/ADROOSIS/");
                })
        );

        return;
    }

    // Archivos externos utilizados por la interfaz.
    const allowedCDN = [
        "cdn.tailwindcss.com",
        "cdnjs.cloudflare.com"
    ];

    if (
        url.origin !== self.location.origin &&
        !allowedCDN.includes(url.hostname)
    ) {
        return;
    }

    // Caché primero y actualización en segundo plano.
    event.respondWith(
        (async () => {
            const cache = await caches.open(
                url.origin === self.location.origin
                    ? CACHE_NAME
                    : RUNTIME_CACHE
            );

            const cached = await cache.match(request);

            const network = fetch(request)
                .then(response => {
                    if (response && response.ok) {
                        const copy = response.clone();

                        cache.put(request, copy).catch(() => {});
                    }

                    return response;
                })
                .catch(() => null);

            if (cached) {
                event.waitUntil(network);
                return cached;
            }

            const response = await network;

            return response || new Response(
                "Recurso no disponible sin conexión.",
                {
                    status: 503,
                    headers: {
                        "Content-Type": "text/plain; charset=utf-8"
                    }
                }
            );
        })()
    );
});

// Permitir actualización desde la aplicación.
self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
