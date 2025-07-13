
import type { NextConfig } from 'next';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/shifts'),
      handler: 'NetworkOnly',
      options: {
        backgroundSync: {
          name: 'shift-mutation-queue',
          options: {
            maxRetentionTime: 24 * 60, // Retry for up to 24 hours
          },
        },
      },
      method: 'POST',
    },
    {
      urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'firestore-data',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
     {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-css-assets',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
    {
       handler: 'StaleWhileRevalidate',
       urlPattern: ({ request }) => request.mode === 'navigate',
       options: {
         cacheName: 'pages-cache',
         expiration: {
           maxEntries: 50,
           maxAgeSeconds: 24 * 60 * 60,
         },
       },
    }
  ],
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: false, // Disabled for now
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};

export default withPWA(withBundleAnalyzer(nextConfig));
