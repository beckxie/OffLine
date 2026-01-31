/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

import { version } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(version)
    },
    base: './', // Relative base path for GitHub Pages compatibility
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],
            manifest: {
                name: 'OffLine - LINE Chat Viewer',
                short_name: 'OffLine',
                description: 'Offline LINE chat history viewer',
                theme_color: '#000000',
                background_color: '#000000',
                display: 'standalone',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    // @ts-expect-error - vitest types not automatically augmenting vite
    test: {
        globals: true,
        environment: 'jsdom',
    },
})
