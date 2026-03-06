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
        // This proxy is only used in local development.
        // In production (Vercel), all API calls go directly to NEXT_PUBLIC_API_URL.
        if (process.env.NODE_ENV === 'production') return [];

        const backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) return [];
        return [
            {
                // Proxy /nest/* → NestJS backend.
                // Uses /nest/ prefix (NOT /api/) to avoid conflict with
                // Next.js native API route handlers at src/app/api/*.
                source: '/nest/:path*',
                destination: `${backendUrl}/:path*`,
            },
        ];
    },
};

export default nextConfig;
