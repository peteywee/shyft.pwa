// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // ⚠ remove "fallback" — not supported in v5
  // fallback: { document: '/offline.html' }
})

module.exports = withPWA({
  // keep the rest of your Next.js config
})
