import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvber.vercel.app'
    const currentDate = new Date()

    return [
        // Homepage - Highest priority
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        // Authentication pages
        {
            url: `${baseUrl}/register`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        // Verification pages
        {
            url: `${baseUrl}/verify`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        // Dashboard - Protected, but include for authenticated users
        {
            url: `${baseUrl}/dashboard`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.7,
        },
        // Features - Weekly
        {
            url: `${baseUrl}/features`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        // How It Works - Monthly
        {
            url: `${baseUrl}/how-it-works`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.85,
        },
        // Art Hub - Weekly
        {
            url: `${baseUrl}/art-hub`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.85,
        },
    ]
}
