const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/_offline',
  },
});

/** @type {import('next').NextConfig} */
module.exports = withPWA({
  // experimental: { allowedDevOrigins: [...] } // ← keep **only** if you move to canary
});
