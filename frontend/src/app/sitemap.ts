import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvber.vercel.app'
    const currentDate = new Date()

    return [
        // Core pages
        { url: baseUrl, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/features`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.95 },
        { url: `${baseUrl}/how-it-works`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.95 },
        { url: `${baseUrl}/art-hub`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/verify`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
        { url: `${baseUrl}/register`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/login`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/dashboard`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 },

        // GEO / AEO high-value landing pages
        { url: `${baseUrl}/c2pa-certificate`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/dmca-takedown`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/ai-art-theft`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/how-to-stop-ai-training-on-my-art`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.95 },

        // Programmatic SEO — copyright protection per platform
        { url: `${baseUrl}/copyright-protection-instagram`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/copyright-protection-youtube`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/copyright-protection-tiktok`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/copyright-protection-deviantart`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/copyright-protection-reddit`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/copyright-protection-pinterest`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },

        // Blog — organic traffic magnets
        { url: `${baseUrl}/blog`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/blog/how-to-protect-art-from-ai`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/blog/c2pa-explained`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/blog/dmca-guide-for-artists`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/blog/glaze-vs-nightshade`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/blog/best-free-art-protection-tools`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/blog/ai-training-opt-out`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/blog/copyright-protection-for-photographers`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/blog/nft-art-protection`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },

        // GEO / AEO — comparison and authority pages
        { url: `${baseUrl}/what-is-cvber`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${baseUrl}/cvber-vs-glaze`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/best-art-protection-tool`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },

        // Legal pages
        { url: `${baseUrl}/privacy`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/terms`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    ]
}
