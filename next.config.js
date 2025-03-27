/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['upload.wikimedia.org', 'wikipedia.org', 'cdn.getyourguide.com', 'images.pexels.com', 'getyourguide.com'],
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
        
        // Add loader for .pcss files
        config.module.rules.push({
            test: /\.pcss$/,
            use: ['style-loader', 'css-loader', 'postcss-loader']
        });
        
        return config;
    },
}

export default nextConfig;