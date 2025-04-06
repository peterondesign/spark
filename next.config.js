/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['upload.wikimedia.org', 'wikipedia.org', 'cdn.getyourguide.com', 'images.pexels.com', 'getyourguide.com', 'unsplash.com', 'pexels.com'],
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
    // Add script source to external scripts
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pexels.com https://unsplash.com https://widget.getyourguide.com https://www.googletagmanager.com https://www.clarity.ms; frame-src 'self' https://embeds.beehiiv.com;"
                    }
                ]
            },
            {
                source: "/sitemap.xml",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "no-cache, no-store, must-revalidate",
                    },
                    {
                        key: "Pragma",
                        value: "no-cache",
                    },
                    {
                        key: "Expires",
                        value: "0",
                    },
                ]
            }
        ];
    }
}

export default nextConfig;