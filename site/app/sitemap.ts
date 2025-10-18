import { newsletters } from './siteConfig';
import { MetadataRoute } from 'next';
import { format, addDays } from 'date-fns';

// Dynamic sitemap that generates URLs for all pages
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

  // RSS feed URLs for each newsletter
  const rssFeedUrls = Object.keys(newsletters).map(topic => ({
    url: `${baseUrl}/${topic.replace(/\s+/g, '-')}/feed.xml`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
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
  
  // Generate all Tuesdays from a start date to current date + future dates
  const startDate = new Date(2025, 3, 1); // April 1, 2025
  const endDate = new Date(); // today
  
  // Add 30 days to include a reasonable number of future dates
  const extendedEndDate = addDays(endDate, 30);
  
  // Get all Tuesdays in the range by looping through dates
  const tuesdayDates: Date[] = [];
  const currentDate1 = new Date(startDate);
  while (currentDate1 <= extendedEndDate) {
    // 2 is Tuesday in JavaScript (0 is Sunday, 1 is Monday, etc.)
    if (currentDate1.getDay() === 2) {
      tuesdayDates.push(new Date(currentDate1));
    }
    currentDate1.setDate(currentDate1.getDate() + 1);
  }
  
  // Generate archive URLs for these dates
  let archiveUrls: MetadataRoute.Sitemap = [];
  
  // For each topic, generate Tuesday archive URLs
  Object.keys(newsletters).forEach(topic => {
    const formattedTopic = topic.replace(/\s+/g, '-');
    
    tuesdayDates.forEach(date => {
      const formattedDate = format(date, "yyyy-MM-dd");
      archiveUrls.push({
        url: `${baseUrl}/${formattedTopic}/archive/${formattedDate}`,
        lastModified: date.toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      });
    });
  });
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/unsubscribe`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/feeds`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];
  
  // Limit the number of URLs to avoid timeouts
  const maxUrls = 1000;
  if (archiveUrls.length > maxUrls) {
    console.warn(`Limiting sitemap to ${maxUrls} URLs (was ${archiveUrls.length})`);
    archiveUrls = archiveUrls.slice(0, maxUrls);
  }
  
  return [...staticPages, ...newsletterUrls, ...rssFeedUrls, archiveUrl, ...archiveUrls];
}