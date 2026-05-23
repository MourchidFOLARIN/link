import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        tailwindcss(),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: false,
            includeAssets: ['favicon.ico', 'robots.txt', 'logo.svg', 'offline.html'],
            workbox: {
                cleanupOutdatedCaches: true,
                navigateFallback: null,
                additionalManifestEntries: [
                    { url: '/offline.html', revision: null },
                    { url: '/logo.svg', revision: null },
                ],
                globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
                runtimeCaching: [
                    {
                        urlPattern: ({ request }) => request.mode === 'navigate',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'exellencelink-pages',
                            networkTimeoutSeconds: 3,
                            expiration: {
                                maxEntries: 24,
                                maxAgeSeconds: 7 * 24 * 60 * 60,
                            },
                            precacheFallback: {
                                fallbackURL: '/offline.html',
                            },
                        },
                    },
                    {
                        urlPattern: ({ request }) => request.destination === 'image',
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'exellencelink-images',
                            expiration: {
                                maxEntries: 80,
                                maxAgeSeconds: 30 * 24 * 60 * 60,
                            },
                        },
                    },
                    {
                        urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com'
                            || url.origin === 'https://fonts.gstatic.com',
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'exellencelink-fonts',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 365 * 24 * 60 * 60,
                            },
                        },
                    },
                ],
            },
            manifest: {
                name: 'ExellenceLink',
                short_name: 'ExellenceLink',
                description: 'ExellenceLink - Votre plateforme intelligente de gestion de liens',
                lang: 'fr',
                id: '/',
                start_url: '/',
                scope: '/',
                theme_color: '#0f172a',
                background_color: '#0f172a',
                display: 'standalone',
                orientation: 'portrait-primary',
                categories: ['productivity', 'utilities'],
                icons: [
                    {
                        src: '/logo.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
