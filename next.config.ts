import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from Backblaze B2 CDN
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.backblazeb2.com' },
    ],
  },
};

export default nextConfig;
