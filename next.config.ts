import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    eslint: {
        // Ignorer ESLint fejl under build
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;