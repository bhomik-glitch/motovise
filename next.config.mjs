/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },
    async rewrites() {
        return [
            {
                // Proxy /nest/* → NestJS backend at localhost:4000.
                // Uses /nest/ prefix (NOT /api/) to avoid conflict with
                // Next.js native API route handlers at src/app/api/*.
                // Next.js always serves real API routes before rewrites.
                source: '/nest/:path*',
                destination: 'http://localhost:4000/:path*',
            },
        ];
    },
};

export default nextConfig;

