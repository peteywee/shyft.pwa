/** @type {import('next').NextConfig} */
const nextConfig = {
  // THIS LINE IS THE FIX
  output: 'export',

  // Your other Next.js config can go here
  // For example, if you are using next-pwa:
  // pwa: {
  //   dest: 'public'
  // }
};

module.exports = nextConfig;
