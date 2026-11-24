    /* =========================================================
       PWA: instalación, actualizaciones y service worker
       ========================================================= */
    (function () {
        /* ---------- Instalar la app ---------- */
        let deferredPrompt = null;

        function isStandalone() {
            return window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true;
        }

        function showInstallButton() {
            const btn = document.getElementById('install-app-btn');
            if (btn && !isStandalone()) btn.classList.remove('hidden');
        }

        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            deferredPrompt = event;
            showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            const btn = document.getElementById('install-app-btn');
            if (btn) btn.classList.add('hidden');
            const help = document.getElementById('install-ios-help');
            if (help) help.classList.add('hidden');
        });

        window.installApp = function () {
            const btn = document.getElementById('install-app-btn');
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choice) => {
                    if (choice.outcome === 'accepted' && btn) btn.classList.add('hidden');
                    deferredPrompt = null;
                }).catch(() => { deferredPrompt = null; });
                return;
            }
            // iOS y navegadores sin beforeinstallprompt
            const help = document.getElementById('install-ios-help');
            if (help) help.classList.toggle('hidden');
        };

        // En iOS no existe beforeinstallprompt: mostramos la ayuda directamente
        if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !isStandalone()) {
            showInstallButton();
            const help = document.getElementById('install-ios-help');
            if (help) help.classList.remove('hidden');
        }

        /* ---------- Service worker y aviso de actualización ---------- */
        if (!('serviceWorker' in navigator)) return;

        const hadController = !!navigator.serviceWorker.controller;
        let userRequestedReload = false;
        let lastUpdateCheck = 0;

        function showUpdateBanner() {
            const banner = document.getElementById('update-banner');
            if (banner) banner.classList.remove('hidden');
        }

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (userRequestedReload) window.location.reload();
        });

        window.addEventListener('load', () => {
            navigator.serviceWorker.register(
                './service-worker.js',
                { scope: './', updateViaCache: 'none' }
            )
                .then((registration) => {
                    if (registration.waiting && hadController) showUpdateBanner();

                    registration.addEventListener('updatefound', () => {
                        const worker = registration.installing;
                        if (!worker) return;
                        worker.addEventListener('statechange', () => {
                            if (worker.state === 'installed' && hadController) showUpdateBanner();
                        });
                    });

                    const btnUpdate = document.getElementById('update-banner-btn');
                    if (btnUpdate) {
                        btnUpdate.addEventListener('click', () => {
                            userRequestedReload = true;
                            if (registration.waiting) {
                                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                            } else {
                                window.location.reload();
                            }
                        });
                    }

                    const btnClose = document.getElementById('update-banner-close');
                    if (btnClose) {
                        btnClose.addEventListener('click', () => {
                            const banner = document.getElementById('update-banner');
                            if (banner) banner.classList.add('hidden');
                        });
                    }

                    // Revisa actualizaciones al volver a la app (máx. 1 vez por hora)
                    document.addEventListener('visibilitychange', () => {
                        if (document.visibilityState !== 'visible') return;
                        const now = Date.now();
                        if (now - lastUpdateCheck < 3600000) return;
                        lastUpdateCheck = now;
                        registration.update().catch(() => {});
                    });
                })
                .catch((error) => {
                    console.error('ADROOSIS: error registrando el service worker', error);
                });
        });
    })();

