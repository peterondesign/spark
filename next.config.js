/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['upload.wikimedia.org', 'wikipedia.org', 'cdn.getyourguide.com', 'images.pexels.com', 'getyourguide.com', 'unsplash.com', 'pexels.com'],
        // Add caching configuration for images
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 86400, // Cache images for 24 hours (in seconds)
        formats: ['image/webp', 'image/avif'],
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
    webpack: (config) => {
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
                        value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widget.getyourguide.com https://www.googletagmanager.com https://www.clarity.ms https://va.vercel-scripts.com; connect-src 'self' https://api.pexels.com/v1 https://*.pexels.com https://*.api.sanity.io/ https://pexels.com https://images.pexels.com https://*.unsplash.com https://unsplash.com https://*.supabase.co https://*.google-analytics.com https://region1.google-analytics.com https://*.clarity.ms https://nominatim.openstreetmap.org https://overpass-api.de https://api.openai.com; frame-src 'self' https://embeds.beehiiv.com;"
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