/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['upload.wikimedia.org', 'wikipedia.org', 'images.pexels.com', 'getyourguide.com'],
    },
    async rewrites() {
        return [
            {
                source: '/api/scrape',
                destination: '/api/scrape',
            },
        ];
    },
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        appDir: true
    },
    // Add transpilePackages if needed
    transpilePackages: [],
    webpack: (config, { isServer }) => {
        // Add the resolver for the Skypack CDN URL
        config.resolve.alias['https://cdn.skypack.dev/@mozilla/readability'] = '@mozilla/readability';
        
        return config;
    },
}

export default nextConfig;