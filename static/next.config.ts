import type { NextConfig } from 'next';

const nextConfig = {
    experimental: {
        appDir: true,
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://backend:5000/api/:path*',
            },
        ]
    },
    images: {
        domains: ['localhost'],
    },
}

export default nextConfig