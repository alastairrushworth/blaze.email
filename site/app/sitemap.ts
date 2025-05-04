import { newsletters } from './siteConfig';
import { MetadataRoute } from 'next';
import { format, addDays, eachTuesdayOfInterval } from 'date-fns';

// This is a static sitemap to avoid database queries during build
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
  
  // Archive page
  const archiveUrl = {
    url: `${baseUrl}/archive`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  };
  
  // Generate static archive URLs for preset dates 
  // Instead of querying the database, we'll use a fixed set of dates
  
  // Generate all Tuesdays from April 1, 2025 to current date
  const startDate = new Date(2025, 3, 1); // April 1, 2025
  const endDate = new Date(); // today
  
  // Add 90 days to ensure we have enough future dates for testing
  const extendedEndDate = addDays(endDate, 90);
  
  // Get all Tuesdays in the range
  const tuesdayDates = eachTuesdayOfInterval({
    start: startDate,
    end: extendedEndDate,
  });
  
  // Generate archive URLs for these dates
  let archiveUrls: MetadataRoute.Sitemap = [];
  
  // For each topic, generate Tuesday archive URLs
  Object.keys(newsletters).forEach(topic => {
    const formattedTopic = topic.replace(/\s+/g, '-');
    
    tuesdayDates.forEach(date => {
      const formattedDate = format(date, "dd-MM-yyyy");
      archiveUrls.push({
        url: `${baseUrl}/archive/${formattedDate}/${formattedTopic}`,
        lastModified: date.toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      });
    });
  });
  
  // Static pages like home page
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];
  
  // Limit the number of URLs to avoid timeouts
  const maxUrls = 1000;
  if (archiveUrls.length > maxUrls) {
    console.warn(`Limiting sitemap to ${maxUrls} URLs (was ${archiveUrls.length})`);
    archiveUrls = archiveUrls.slice(0, maxUrls);
  }
  
  return [...staticPages, ...newsletterUrls, archiveUrl, ...archiveUrls];
}