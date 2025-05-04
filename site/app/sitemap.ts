import { newsletters } from './siteConfig';
import { MetadataRoute } from 'next';
import { getNewsletterArchive } from '@/lib/db';
import { format } from 'date-fns';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email';
  const currentDate = new Date().toISOString();
  
  // Newsletter topic URLs
  const newsletterUrls = Object.keys(newsletters).map(topic => ({
    url: `${baseUrl}/${topic.replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));
  
  // Archive page
  const archiveUrl = {
    url: `${baseUrl}/archive`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  };
  
  // Generate archive URLs for each newsletter
  let archiveUrls: MetadataRoute.Sitemap = [];
  
  // Get archive newsletters for each topic
  for (const topic of Object.keys(newsletters)) {
    try {
      const archiveNewsletters = await getNewsletterArchive(topic, '2025-04-01');
      
      const topicArchiveUrls = archiveNewsletters.map(newsletter => {
        const archiveDate = new Date(newsletter.publishedat);
        const formattedArchiveDate = format(archiveDate, "dd-MM-yyyy");
        const formattedTopic = topic.replace(/\s+/g, '-');
        
        return {
          url: `${baseUrl}/archive/${formattedArchiveDate}/${formattedTopic}`,
          lastModified: newsletter.publishedat,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        };
      });
      
      archiveUrls = [...archiveUrls, ...topicArchiveUrls];
    } catch (error) {
      console.error(`Error fetching archive for ${topic}:`, error);
    }
  }
  
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
  
  return [...staticPages, ...newsletterUrls, archiveUrl, ...archiveUrls];
}