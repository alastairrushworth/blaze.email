import { getRecentNewsletters } from '@/lib/db';
import { generateRSSFeed, markdownToHTML, formatRSSDate } from '@/lib/rss';
import { newsletters, siteMetadata, normalizeTopicPath } from '@/app/siteConfig';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

export async function GET(
  request: Request,
  { params }: { params: { topic: string } }
) {
  // Validate topic
  const normalizedTopic = normalizeTopicPath(params.topic);
  const topicDetails = newsletters[normalizedTopic];

  if (!topicDetails) {
    return notFound();
  }

  try {
    // Fetch the last 10 newsletters for this topic
    const recentNewsletters = await getRecentNewsletters(params.topic, 10);

    // Build RSS items
    const rssItems = recentNewsletters.map((newsletter) => {
      const pubDate = new Date(newsletter.publishedat);
      const formattedDate = format(pubDate, 'yyyy-MM-dd');
      const link = `${siteMetadata.baseUrl}/${params.topic}/archive/${formattedDate}`;

      return {
        title: `${topicDetails.title} - ${format(pubDate, 'MMMM do, yyyy')}`,
        link,
        guid: link,
        description: `${topicDetails.description} - Issue from ${format(pubDate, 'MMMM do, yyyy')}`,
        pubDate: formatRSSDate(pubDate),
        content: markdownToHTML(newsletter.content),
      };
    });

    // Generate RSS feed
    const rssFeed = generateRSSFeed({
      title: `${siteMetadata.name} - ${topicDetails.title}`,
      description: topicDetails.description,
      link: `${siteMetadata.baseUrl}/${params.topic}`,
      items: rssItems,
    });

    // Return RSS feed with proper headers
    return new Response(rssFeed, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
}
