import { SubscriptionPopup } from "@/components/SubscriptionPopup"
import { SignupForm } from "@/components/SignupForm"
import { LatestNewsletter } from "@/components/LatestNewsletter"
import Breadcrumb from "@/components/Breadcrumb"
import SchemaJsonLd from "@/components/SchemaJsonLd"
import { getLatestNewsletter, getNewsletterArchive } from '@/lib/db'
import { format } from 'date-fns'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { generateNewsletterSchema, getCanonicalUrl } from '@/lib/schema'
import { newsletters, siteMetadata, formatTopicPath, normalizeTopicPath } from '../siteConfig'

// Check if the topic exists in newsletters list
function isValidTopic(topic: string): boolean {
  return Object.keys(newsletters).includes(normalizeTopicPath(topic))
}

// Generate dynamic metadata for each topic page
export async function generateMetadata({ params }: { params: { topic: string } }): Promise<Metadata> {
  // Check if the topic exists
  if (!isValidTopic(params.topic)) {
    notFound()
  }

  const normalizedTopic = normalizeTopicPath(params.topic)
  const topicDetails = newsletters[normalizedTopic]
  const aboutText = topicDetails?.about || normalizedTopic
  
  const latestNewsletter = await getLatestNewsletter(params.topic)
  
  // Format date for OG image
  const formattedDate = latestNewsletter?.publishedat 
    ? format(new Date(latestNewsletter.publishedat), "MMMM d, yyyy")
    : null;

  // Build URLs and descriptions
  const imageUrl = `${siteMetadata.baseUrl}/api/og?topic=${encodeURIComponent(params.topic)}&date=${encodeURIComponent(formattedDate || '')}`;
  const canonicalUrl = getCanonicalUrl(`/${params.topic}`);
  const description = topicDetails?.description || `${normalizedTopic} digest featuring ${aboutText}`;

  return {
    title: topicDetails?.title || normalizedTopic,
    description,
    keywords: topicDetails?.keywords,
    openGraph: {
      title: topicDetails?.title || normalizedTopic,
      description,
      type: 'article',
      siteName: siteMetadata.name,
      locale: 'en_US',
      url: canonicalUrl,
      publishedTime: latestNewsletter?.publishedat,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: topicDetails?.title || normalizedTopic }],
    },
    twitter: {
      card: 'summary_large_image',
      title: topicDetails?.title || normalizedTopic,
      description,
      images: [imageUrl],
      creator: '@blazeemail',
      site: '@blazeemail',
    },
    alternates: {
      canonical: canonicalUrl
    }
  }
}

export default async function TopicPage({ params }: { params: { topic: string } }) {
  // Check if the topic exists
  if (!isValidTopic(params.topic)) {
    notFound()
  }

  // Get latest newsletter data
  const latestNewsletter = await getLatestNewsletter(params.topic)
  
  // Get archive newsletters starting from April 1, 2025 (only Tuesdays)
  const archiveNewsletters = await getNewsletterArchive(params.topic, '2025-04-01')
  
  // Normalize topic and get details
  const normalizedTopic = normalizeTopicPath(params.topic)
  const topicDetails = newsletters[normalizedTopic]
  const aboutText = topicDetails?.about || normalizedTopic
  
  // Format dates
  let formattedDate = null
  let formattedTextDate = null
  
  if (latestNewsletter?.publishedat) {
    try {
      const date = new Date(latestNewsletter.publishedat)
      formattedDate = format(date, "dd-MM-yyyy")
      formattedTextDate = format(date, "do MMMM yyyy")
    } catch (error) {
      console.error("Error formatting date:", error)
      formattedDate = latestNewsletter.publishedat.toString().split('T')[0]
    }
  }
  
  // Schema data for SEO
  const schemaData = {
    title: topicDetails?.title || normalizedTopic,
    description: topicDetails?.description || `Weekly curated ${normalizedTopic} newsletter featuring latest trends, research, tools, and articles about ${aboutText}`,
    topic: normalizedTopic,
    url: getCanonicalUrl(`/${params.topic}`),
    publishedAt: latestNewsletter?.publishedat,
    imageUrl: `${siteMetadata.baseUrl}/api/og?topic=${encodeURIComponent(params.topic)}&date=${encodeURIComponent(formattedDate || '')}`,
    keywords: topicDetails?.keywords
  }
  
  // Get related newsletters (excluding current one)
  const relatedNewsletters = Object.entries(newsletters)
    .filter(([topic]) => topic !== normalizedTopic)
    .slice(0, 3) // Get at most 3 related newsletters

  return (
    <div className="pt-0 pb-3 md:pb-8 relative container mx-auto px-1 sm:px-4 z-0">
      <SchemaJsonLd schema={generateNewsletterSchema(schemaData)} />

      <div className="mt-0 pt-0">
        {/* Breadcrumbs navigation */}
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: topicDetails?.title || normalizedTopic, path: `/${params.topic}`, isCurrent: true }
          ]}
        />

        <div className="flex items-center justify-center mb-3 md:mb-4">
          <span className="mr-2 text-3xl md:text-4xl" role="img" aria-label={`${topicDetails?.title || normalizedTopic} icon`}>{topicDetails?.emoji}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 dark:text-indigo-200">
            {topicDetails?.title || normalizedTopic}
          </h1>
        </div>
        {formattedTextDate && (
          <p className="text-sm md:text-base text-center text-gray-500 dark:text-gray-400 mb-4 md:mb-5">
            {formattedTextDate}
          </p>
        )}

        <div className="mb-6 md:mb-8">
          <SignupForm topic={normalizedTopic} />
        </div>

        <LatestNewsletter newsletter={latestNewsletter} />
        
        {/* Newsletter Archive Section */}
        {archiveNewsletters && archiveNewsletters.length > 0 && (
          <section className="mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300">
              Previous {topicDetails?.title || normalizedTopic} Newsletters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {archiveNewsletters.map((newsletter, index) => {
                // Skip the latest newsletter since it's already displayed
                const newsletterDate = new Date(newsletter.publishedat);
                const latestDate = latestNewsletter?.publishedat ? new Date(latestNewsletter.publishedat) : null;
                
                // Verify it's a Tuesday and skip if not
                const dayOfWeek = newsletterDate.getDay();
                if (dayOfWeek !== 2) { // 0 is Sunday, 1 is Monday, 2 is Tuesday
                  console.log(`Skipping non-Tuesday date: ${newsletterDate.toISOString()}`);
                  return null;
                }
                
                // Skip if this is the same date as latest newsletter (compare year, month, day)
                if (latestDate && 
                    newsletterDate.getFullYear() === latestDate.getFullYear() &&
                    newsletterDate.getMonth() === latestDate.getMonth() &&
                    newsletterDate.getDate() === latestDate.getDate()) {
                  return null;
                }
                
                const formattedArchiveDate = format(newsletterDate, "dd-MM-yyyy");
                const displayDate = format(newsletterDate, "do MMMM yyyy");
                
                return (
                  <Link 
                    key={formattedArchiveDate}
                    href={`/archive/${formattedArchiveDate}/${params.topic}`}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-indigo-600 dark:text-indigo-400 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{displayDate}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Newsletters Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-indigo-700 dark:text-indigo-300">
            You may also like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedNewsletters.map(([topic, details]) => (
              <Link
                key={topic}
                href={`/${formatTopicPath(topic)}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300 relative cursor-pointer"
              >
                <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-300 mb-2">
                  <span role="img" aria-label={`${topic} icon`}>{details.emoji}</span> {topic}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{details.about}</p>

                {/* Vertically centered arrow on right */}
                <svg
                  xmlns="https://www.w3.org/2000/svg"
                  className="h-4 w-4 text-indigo-400 dark:text-indigo-500 absolute top-1/2 -translate-y-1/2 right-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Topic Overview Section - Adds more content about the topic */}
        <section className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300">
            About {topicDetails?.title || normalizedTopic}
          </h2>
          <div className="max-w-none">
            {topicDetails?.overview?.content?.map((paragraph, index) => (
              <p key={index} className={`${index < topicDetails.overview.content.length - 1 ? 'mb-4' : ''} text-gray-800 dark:text-gray-200`}>
                {paragraph}
              </p>
            )) || (
              // Fallback content if overview is not defined
              <>
                <p className="mb-4 text-gray-800 dark:text-gray-200">
                  Our {topicDetails?.title || normalizedTopic} newsletter covers the latest developments, trends, tools, and insights in {aboutText.toLowerCase()}.
                  Each week, we curate the most important content so you don't have to spend hours searching.
                </p>
                <p className="mb-4 text-gray-800 dark:text-gray-200">
                  Whether you're a beginner or expert in {(topicDetails?.title || normalizedTopic).toLowerCase()}, our newsletter provides valuable information
                  to keep you informed and ahead of the curve in this rapidly evolving field.
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  Subscribe now to join thousands of professionals who receive our weekly updates!
                </p>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Popup subscription form that appears when user scrolls near the bottom */}
      <SubscriptionPopup topic={normalizedTopic} />
    </div>
  )
}