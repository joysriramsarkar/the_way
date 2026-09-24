/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  async rewrites() {
    return [
      { source: '/article/:slug', destination: '/articles/:slug' },
      { source: '/section/:slug', destination: '/sections/:slug' },
      { source: '/book-reader', destination: '/books' },
      { source: '/resource', destination: '/search' }
    ];
  }
};

export default nextConfig;
