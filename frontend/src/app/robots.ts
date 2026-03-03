import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvber.vercel.app'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/'],
            },
            {
                userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'Googlebot-Extended'],
                allow: ['/', '/features', '/how-it-works', '/art-hub'],
                disallow: ['/api/'],
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
