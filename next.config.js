/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'upload.wikimedia.org', 
            'wikipedia.org', 
            'cdn.getyourguide.com', 
            'images.pexels.com', 
            'getyourguide.com', 
            'unsplash.com', 
            'pexels.com', 
            'via.placeholder.com',
            'images.unsplash.com',
            'cdn.sanity.io',
            'placeholder.com',
            'media.getyourguide.com',
            'static.getyourguide.com',
            'images.pexels.com'
        ],
        // Add caching configuration for images
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 86400, // Cache images for 24 hours (in seconds)
        formats: ['image/webp', 'image/avif'],
        // Using unoptimized for remote placeholder images to avoid 500 errors
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'placeholder.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.getyourguide.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
                port: '',
                pathname: '/**'
            }
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/scrape',
                destination: '/api/scrape',
            },
            // Add rewrite for GetYourGuide API if needed
            {
                source: '/api/getYourGuide/:path*',
                destination: 'https://widget.getyourguide.com/api/:path*',
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
                        value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widget.getyourguide.com https://*.getyourguide.com https://cdn.getyourguide.com https://static.getyourguide.com https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms https://scripts.clarity.ms https://va.vercel-scripts.com https://js.stripe.com https://www.tiktok.com https://*.ttwstatic.com https://sf16-website-login.neutral.ttwstatic.com https://*.tiktokcdn-us.com https://lf16-tiktok-web.tiktokcdn-us.com; connect-src 'self' * https://api.pexels.com/v1 https://*.pexels.com https://*.api.sanity.io/ https://pexels.com https://images.pexels.com https://*.unsplash.com https://unsplash.com https://*.supabase.co https://*.google-analytics.com https://region1.google-analytics.com https://*.clarity.ms https://nominatim.openstreetmap.org https://overpass-api.de https://api.openai.com https://*.getyourguide.com https://widget.getyourguide.com https://api.stripe.com; frame-src 'self' https://embeds.beehiiv.com https://widget.getyourguide.com https://*.getyourguide.com https://www.tiktok.com https://vm.tiktok.com https://js.stripe.com;"
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'accelerometer=*, camera=(), geolocation=*, gyroscope=*, magnetometer=*, microphone=(), payment=*, usb=(), autoplay=*, fullscreen=*, display-capture=(), battery=(), ambient-light-sensor=*, device-motion=*'
                    }
                ]
            },
            {
                source: "/robots.txt",
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
                    {
                        key: "X-Robots-Tag",
                        value: "all",
                    },
                ]
            }
        ];
    },
    // Updated configuration for external packages in Next.js 15.1.0
    serverExternalPackages: [
        '@puppeteer/core',
        'puppeteer-extra',
        'puppeteer-extra-plugin-stealth',
        'puppeteer-extra-plugin-recaptcha',
        'puppeteer-extra-plugin-adblocker',
        'merge-deep',
        'clone-deep',
        'lazy-cache',
        'is-plain-object',
        'shallow-clone',
        'kind-of',
        'for-own'
    ],
    experimental: {
        // Remove the deprecated option from experimental
    },
    // Required for next-sitemap to work correctly with Next.js 15.1.0
    distDir: '.next'
}

export default nextConfig;