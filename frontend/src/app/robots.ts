import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvber.vercel.app'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/dashboard'],
            },
            // Allow ALL AI search engines to crawl for GEO/AEO visibility
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'Google-Extended',
                    'Googlebot',
                    'BingBot',
                    'Bingbot',
                    'BingPreview',
                    'PerplexityBot',
                    'YouBot',
                    'ClaudeBot',
                    'Claude-Web',
                    'anthropic-ai',
                    'cohere-ai',
                    'meta-externalagent',
                    'meta-externalfetch',
                    'Applebot-Extended',
                    'Bytespider',
                    'Amazonbot',
                    'YandexBot',
                    'DuckDuckBot',
                    'Slurp',
                    'Sogou',
                    'facebot',
                    'Pinterestbot',
                    'Slackbot',
                    'TelegramBot',
                    'WhatsApp',
                    'Twitterbot',
                    'LinkedInBot',
                    'Redditbot',
                ],
                allow: [
                    '/',
                    '/features',
                    '/how-it-works',
                    '/art-hub',
                    '/verify',
                    '/c2pa-certificate',
                    '/dmca-takedown',
                    '/ai-art-theft',
                    '/how-to-stop-ai-training-on-my-art',
                    '/copyright-protection-instagram',
                    '/copyright-protection-youtube',
                    '/copyright-protection-tiktok',
                    '/copyright-protection-deviantart',
                    '/copyright-protection-reddit',
                    '/copyright-protection-pinterest',
                ],
                disallow: ['/api/', '/dashboard'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
