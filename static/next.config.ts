import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Permitir imagens do backend Flask
    images: {
        domains: ['localhost'],
    },
};

export default nextConfig;