import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvber-free-las-app.vercel.app'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/dashboard/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: '/api/',
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
