import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    eslint: {
        // Ignorer ESLint fejl under build
        ignoreDuringBuilds: true,
    },

    // Image optimization
    images: {
        formats: [ 'image/webp', 'image/avif' ],
        deviceSizes: [ 48, 64, 96, 128 ],
        imageSizes: [ 16, 20, 24, 32, 48, 64 ],
        minimumCacheTTL: 31536000, // 1 year
    },

    // Compression
    compress: true,

    // Optimize bundle
    experimental: {
        optimizePackageImports: [ 'lucide-react', 'react-icons' ],
    },

    // Cache headers to reduce edge requests
    async headers() 
    {
        return [
            // Static data files - cache for 24 hours, stale-while-revalidate for 7 days
            {
                source: '/data/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
                    },
                ],
            },
            // Champion images - cache for 1 year (immutable)
            {
                source: '/champions/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            // Trait icons - cache for 1 year (immutable)
            {
                source: '/trait-icons/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            // Emblem images - cache for 1 year (immutable)
            {
                source: '/emblems/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            // Static assets (logo, bg, etc.) - cache for 1 year
            {
                source: '/(logo|bg|favicon|og-image).(png|jpg|jpeg|webp|avif|svg|ico)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            // API routes - cache for 1 hour, stale-while-revalidate for 24 hours
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
                    },
                ],
            },
        ];
    },

    // Rewrites for cleaner URLs (optional optimization)
    async rewrites() 
    {
        return [
            // Serve static data files more efficiently
            {
                source: '/static-data/:path*',
                destination: '/data/:path*',
            },
        ];
    },
};

export default nextConfig;