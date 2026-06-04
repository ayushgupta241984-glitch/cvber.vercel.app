/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://cvber.vercel.app',
    generateRobotsTxt: false,
    sitemapSize: 7000,
    changefreq: {
        default: 'weekly',
        daily: '/dashboard',
        weekly: ['/', '/features', '/how-it-works', '/art-hub', '/verify'],
        monthly: ['/register', '/login', '/privacy', '/terms'],
        yearly: ['/ping'],
    },
    priority: {
        default: 0.7,
    },
    exclude: ['/api/*', '/ping', '/verify'],
    robotsTxtOptions: {
        additionalSitemaps: [],
    },
    transform: async (config, url) => {
        const overrides = {
            '/': { priority: 1.0, changefreq: 'daily' },
            '/features': { priority: 0.9, changefreq: 'weekly' },
            '/how-it-works': { priority: 0.9, changefreq: 'weekly' },
            '/art-hub': { priority: 0.85, changefreq: 'weekly' },
            '/verify': { priority: 0.8, changefreq: 'weekly' },
            '/register': { priority: 0.9, changefreq: 'monthly' },
            '/login': { priority: 0.9, changefreq: 'monthly' },
            '/privacy': { priority: 0.5, changefreq: 'monthly' },
            '/terms': { priority: 0.5, changefreq: 'monthly' },
            '/copyright-protection-instagram': { priority: 0.8, changefreq: 'monthly' },
            '/copyright-protection-youtube': { priority: 0.8, changefreq: 'monthly' },
            '/copyright-protection-tiktok': { priority: 0.8, changefreq: 'monthly' },
            '/copyright-protection-deviantart': { priority: 0.8, changefreq: 'monthly' },
            '/copyright-protection-reddit': { priority: 0.8, changefreq: 'monthly' },
            '/c2pa-certificate': { priority: 0.85, changefreq: 'monthly' },
            '/dmca-takedown': { priority: 0.85, changefreq: 'monthly' },
            '/ai-art-theft': { priority: 0.85, changefreq: 'monthly' },
            '/how-to-stop-ai-training-on-my-art': { priority: 0.9, changefreq: 'monthly' },
        }

        const override = overrides[url]
        if (override) {
            return {
                loc: url,
                lastmod: new Date().toISOString(),
                changefreq: override.changefreq,
                priority: override.priority,
            }
        }

        return {
            loc: url,
            lastmod: new Date().toISOString(),
            changefreq: config.changefreq.default,
            priority: config.priority.default,
        }
    },
}
