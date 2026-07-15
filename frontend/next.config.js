/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    generateEtags: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 30,
    },
    compress: true,
    poweredByHeader: false,
    reactStrictMode: true,
    output: 'standalone',
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
                    },
                ],
            },
            {
                source: '/(c2pa-certificate|dmca-takedown|ai-art-theft|how-to-stop-ai-training-on-my-art|what-is-cvber|best-art-protection-tool|cvber-vs-glaze|features|how-it-works|about|verify)',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=3600, s-maxage=86400',
                    },
                ],
            },
            {
                source: '/(blog/:path*)',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'index, follow, max-image-preview:large, max-snippet:-1',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=3600, s-maxage=86400',
                    },
                ],
            },
            {
                source: '/(copyright-protection-:platform*)',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'index, follow, max-image-preview:large, max-snippet:-1',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=3600, s-maxage=86400',
                    },
                ],
            },
            {
                source: '/(llms.txt|llms-full.txt)',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'text/plain; charset=utf-8',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=3600, s-maxage=86400',
                    },
                    {
                        key: 'X-Robots-Tag',
                        value: 'index, follow',
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig
