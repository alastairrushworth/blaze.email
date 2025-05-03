import { newsletters } from './newsletters';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email';
  const currentDate = new Date().toISOString();
  
  // Newsletter topic URLs
  const newsletterUrls = Object.keys(newsletters).map(topic => ({
    url: `${baseUrl}/${topic.replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));
  
  // Only include the home page in the sitemap
  // The about, privacy, and unsubscribe pages have canonical URLs pointing to the home page
  // so they should not be included in the sitemap
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];
  
  return [...staticPages, ...newsletterUrls];
}