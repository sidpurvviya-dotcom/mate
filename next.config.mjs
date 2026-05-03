/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // Fix for the Turbopack/Tracing root conflict
  experimental: {
    // Server actions are enabled by default in Next.js 15+
  },
  // Ensure we don't have conflicting root settings
  output: 'standalone',
};

export default nextConfig;
