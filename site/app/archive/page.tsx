import { Metadata } from 'next'
import { newsletters, siteMetadata, formatTopicPath } from '../siteConfig'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { getNewsletterArchive } from '@/lib/db'
import { format } from 'date-fns'

// Add dynamic export to prevent static generation timeout
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Newsletter Archives - Blaze.Email',
  description: 'Browse our archive of past newsletters covering various topics in tech, AI, and more.',
  openGraph: {
    title: 'Newsletter Archives - Blaze.Email',
    description: 'Browse our archive of past newsletters covering various topics in tech, AI, and more.',
    url: `${siteMetadata.baseUrl}/archive`,
    siteName: siteMetadata.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${siteMetadata.baseUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'Newsletter Archives - Blaze.Email',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Newsletter Archives - Blaze.Email',
    description: 'Browse our archive of past newsletters covering various topics in tech, AI, and more.',
    images: [`${siteMetadata.baseUrl}/logo.png`],
    creator: '@blazeemail',
    site: '@blazeemail',
  },
  alternates: {
    canonical: `${siteMetadata.baseUrl}/archive`
  }
}

export default async function ArchivePage() {
  // Get archive data for all topics - use a limit to prevent timeouts
  const topicArchives = await Promise.all(
    Object.keys(newsletters).map(async (topic) => {
      const formattedTopic = formatTopicPath(topic);
      // Limit to the top 20 most recent archives per topic to keep page performance reasonable
      const archives = await getNewsletterArchive(formattedTopic, '2025-04-01');
      return {
        topic,
        formattedTopic,
        archives: archives.slice(0, 20) // Limit to 20 most recent archives per topic
      };
    })
  );

  // Group archives by year and month for each topic
  const groupedArchives = topicArchives.map(({ topic, formattedTopic, archives }) => {
    const grouped = {};
    
    archives.forEach(archive => {
      const date = new Date(archive.publishedat);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      if (!grouped[year]) {
        grouped[year] = {};
      }
      
      if (!grouped[year][month]) {
        grouped[year][month] = [];
      }
      
      grouped[year][month].push({
        date,
        linkDate: format(date, "yyyy-MM-dd")
      });
    });
    
    return {
      topic,
      formattedTopic,
      groupedArchives: grouped
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Archives', path: '/archive', isCurrent: true }
        ]}
      />
      
      <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 dark:text-indigo-200 mb-8 text-center">
        Newsletter Archives
      </h1>
      
      <p className="text-lg text-center max-w-2xl mx-auto mb-10 text-gray-700 dark:text-gray-300">
        Browse our complete collection of past newsletters. Each newsletter provides insights, 
        updates, and resources on their respective topics.
      </p>
      
      <div className="space-y-16">
        {groupedArchives.map(({ topic, formattedTopic, groupedArchives }) => (
          <div key={topic} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="mr-2 text-3xl" role="img" aria-label={`${topic} icon`}>
                {newsletters[topic].emoji}
              </span>
              <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300">
                {newsletters[topic].title || topic}
              </h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {newsletters[topic].about}
            </p>
            
            <div className="mb-6">
              <Link 
                href={`/${formattedTopic}`}
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                View latest issue →
              </Link>
            </div>
            
            {Object.keys(groupedArchives).length > 0 ? (
              <div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-5 border-b border-gray-200 dark:border-gray-600 pb-2">
                  All Archive Issues
                </h3>
                
                <div className="space-y-8">
                  {Object.keys(groupedArchives)
                    .sort((a, b) => parseInt(b) - parseInt(a)) // Sort years descending
                    .map(year => (
                      <div key={year} className="mb-6">
                        <h4 className="text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-3">
                          {year}
                        </h4>
                        
                        <div className="space-y-6">
                          {Object.keys(groupedArchives[year])
                            .sort((a, b) => parseInt(b) - parseInt(a)) // Sort months descending
                            .map(month => {
                              const monthName = new Date(parseInt(year), parseInt(month), 1).toLocaleString('default', { month: 'long' });
                              return (
                                <div key={`${year}-${month}`} className="ml-4">
                                  <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {monthName}
                                  </h5>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 ml-4">
                                    {groupedArchives[year][month]
                                      .sort((a, b) => b.date - a.date) // Sort dates descending
                                      .map(({ date, linkDate }) => (
                                        <Link
                                          key={linkDate}
                                          href={`/${formattedTopic}/archive/${linkDate}`}
                                          className="bg-gray-50 dark:bg-gray-700 rounded-md p-2 hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors text-sm"
                                        >
                                          <span className="text-indigo-600 dark:text-indigo-400">
                                            {format(date, "MMMM d, yyyy")}
                                          </span>
                                        </Link>
                                      ))
                                    }
                                  </div>
                                </div>
                              );
                            })
                          }
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No archived issues available yet.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}