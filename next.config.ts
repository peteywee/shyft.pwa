const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // offline fallback (works in v6+)
  fallback: {
    document: '/_offline'
  }
})

module.exports = withPWA({
  // remove experimental.allowedDevOrigins if you stay on Next 15.4;
  // re‑add only after upgrading to canary where the flag exists
})
