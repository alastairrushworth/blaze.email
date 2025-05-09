import { LatestNewsletter } from "@/components/LatestNewsletter"
import Breadcrumb from "@/components/Breadcrumb"
import SchemaJsonLd from "@/components/SchemaJsonLd"
import { SignupForm } from "@/components/SignupForm"
import { SubscriptionPopup } from "@/components/SubscriptionPopup"
import { getNewsletterByDate, getNewsletterArchive } from '@/lib/db'
import { format, parse } from 'date-fns'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { generateNewsletterSchema, getCanonicalUrl } from '@/lib/schema'
import { newsletters, siteMetadata, normalizeTopicPath, formatTopicPath } from '../../../siteConfig'

// Check if the topic exists in newsletters list
function isValidTopic(topic: string): boolean {
  return Object.keys(newsletters).includes(normalizeTopicPath(topic))
}

// Generate dynamic metadata for each archived newsletter page
export async function generateMetadata({ params }: { params: { topic: string, date: string } }): Promise<Metadata> {
  // Check if the topic exists
  if (!isValidTopic(params.topic)) {
    notFound()
  }

  // Parse and validate the date
  let parsedDate;
  try {
    parsedDate = parse(params.date, 'yyyy-MM-dd', new Date())
    if (isNaN(parsedDate.getTime())) throw new Error('Invalid date')
    
    // Check if it's a Tuesday (2 = Tuesday, 0 = Sunday)
    if (parsedDate.getDay() !== 2) {
      console.warn(`Requested date ${params.date} is not a Tuesday (day: ${parsedDate.getDay()})`)
      // We'll continue and let the DB query handle finding newsletters
      // The getNewsletterByDate function will adjust to find the nearest Tuesday
    }
  } catch (error) {
    console.error("Error parsing date:", error)
    notFound()
  }

  const normalizedTopic = normalizeTopicPath(params.topic)
  const topicDetails = newsletters[normalizedTopic]
  const aboutText = topicDetails?.about || normalizedTopic
  
  // Convert the date format for the database query
  const dbDateFormat = format(parsedDate, "dd-MM-yyyy");
  
  // Fetch specific newsletter by date
  const newsletter = await getNewsletterByDate(params.topic, dbDateFormat)
  
  if (!newsletter) {
    notFound()
  }
  
  // Format date for display
  const formattedDate = format(new Date(newsletter.publishedat), "MMMM d, yyyy")

  // Build URLs and descriptions
  const imageUrl = `${siteMetadata.baseUrl}/api/og?topic=${encodeURIComponent(params.topic)}&date=${encodeURIComponent(formattedDate || '')}`;
  const canonicalUrl = getCanonicalUrl(`/${params.topic}/archive/${params.date}`);
  const description = `${normalizedTopic} digest from ${formattedDate} featuring ${aboutText}`;
  const pageTitle = `${topicDetails?.title || normalizedTopic} - ${formattedDate}`;

  return {
    title: pageTitle,
    description,
    keywords: topicDetails?.keywords,
    openGraph: {
      title: pageTitle,
      description,
      type: 'article',
      siteName: siteMetadata.name,
      locale: 'en_US',
      url: canonicalUrl,
      publishedTime: newsletter.publishedat,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
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

export default async function ArchiveNewsletterPage({ params }: { params: { topic: string, date: string } }) {
  // Check if the topic exists
  if (!isValidTopic(params.topic)) {
    notFound()
  }

  // Parse and validate the date
  let parsedDate;
  try {
    parsedDate = parse(params.date, 'yyyy-MM-dd', new Date())
    if (isNaN(parsedDate.getTime())) throw new Error('Invalid date')
    
    // Check if it's a Tuesday (2 = Tuesday, 0 = Sunday)
    if (parsedDate.getDay() !== 2) {
      console.warn(`Requested date ${params.date} is not a Tuesday (day: ${parsedDate.getDay()})`)
      // We'll continue and let the DB query handle finding newsletters
      // The getNewsletterByDate function will adjust to find the nearest Tuesday
    }
  } catch (error) {
    console.error("Error parsing date:", error)
    notFound()
  }

  // Convert the date format for the database query
  const dbDateFormat = format(parsedDate, "dd-MM-yyyy");
  
  // Get specific newsletter by date
  // This will try to find a newsletter on the exact date, but if not found,
  // it will fall back to the most recent newsletter before this date
  const newsletter = await getNewsletterByDate(params.topic, dbDateFormat)
  
  if (!newsletter) {
    // If still no newsletter found even with fallback
    console.error(`No newsletter found for ${params.topic} on or before ${params.date}`);
    notFound()
  }
  
  // Check if we got a newsletter from a different date than requested
  const newsletterDate = new Date(newsletter.publishedat);
  const requestedDate = parsedDate;
  
  if (newsletterDate.getUTCFullYear() !== requestedDate.getFullYear() ||
      newsletterDate.getUTCMonth() !== requestedDate.getMonth() ||
      newsletterDate.getUTCDate() !== requestedDate.getDate()) {
    console.log(`Note: Showing newsletter from ${newsletterDate.toISOString().split('T')[0]} instead of requested date ${params.date}`);
  }
  
  // Get all newsletters for navigation
  const archiveNewsletters = await getNewsletterArchive(params.topic, '2025-04-01');
  
  // Find the current newsletter's index in the archive
  let currentIndex = -1;
  let prevNewsletter = null;
  let nextNewsletter = null;
  
  if (archiveNewsletters && archiveNewsletters.length > 0) {
    // Find the current newsletter's index
    for (let i = 0; i < archiveNewsletters.length; i++) {
      const archiveDate = new Date(archiveNewsletters[i].publishedat);
      if (
        archiveDate.getFullYear() === newsletterDate.getFullYear() &&
        archiveDate.getMonth() === newsletterDate.getMonth() &&
        archiveDate.getDate() === newsletterDate.getDate()
      ) {
        currentIndex = i;
        break;
      }
    }
    
    // In archive array, index 0 is newest, higher indexes are older
    // So "newer" is lower index, "older" is higher index
    
    if (currentIndex > 0) {
      // There's a newer newsletter (smaller index = more recent)
      nextNewsletter = archiveNewsletters[currentIndex - 1];
    }
    
    if (currentIndex < archiveNewsletters.length - 1 && currentIndex !== -1) {
      // There's an older newsletter (larger index = older)
      prevNewsletter = archiveNewsletters[currentIndex + 1];
    }
  }
  
  // Normalize topic and get details
  const normalizedTopic = normalizeTopicPath(params.topic)
  const topicDetails = newsletters[normalizedTopic]
  const aboutText = topicDetails?.about || normalizedTopic
  
  // Format dates
  let formattedTextDate = format(new Date(newsletter.publishedat), "do MMMM yyyy")
  
  // Schema data for SEO
  const schemaData = {
    title: `${topicDetails?.title || normalizedTopic} - ${formattedTextDate}`,
    description: `${normalizedTopic} digest from ${formattedTextDate} featuring ${aboutText}`,
    topic: normalizedTopic,
    url: getCanonicalUrl(`/${params.topic}/archive/${params.date}`),
    publishedAt: newsletter.publishedat,
    imageUrl: `${siteMetadata.baseUrl}/api/og?topic=${encodeURIComponent(params.topic)}&date=${encodeURIComponent(formattedTextDate || '')}`,
    keywords: topicDetails?.keywords
  }

  return (
    <div className="pt-0 pb-3 md:pb-8 relative container mx-auto px-1 sm:px-4 z-0">
      <SchemaJsonLd schema={generateNewsletterSchema(schemaData)} />

      <div className="mt-0 pt-0">
        {/* Breadcrumbs navigation */}
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: topicDetails?.title || normalizedTopic, path: `/${params.topic}` },
            { label: formattedTextDate, path: `/${params.topic}/archive/${params.date}`, isCurrent: true }
          ]}
        />

        <div className="flex items-center justify-center mb-3 md:mb-4">
          <span className="mr-2 text-3xl md:text-4xl" role="img" aria-label={`${topicDetails?.title || normalizedTopic} icon`}>{topicDetails?.emoji}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 dark:text-indigo-200">
            {topicDetails?.title || normalizedTopic}
          </h1>
        </div>
        
        <p className="text-sm md:text-base text-center text-gray-500 dark:text-gray-400 mb-4 md:mb-5">
          {formattedTextDate}
        </p>

        <div className="mb-5 md:mb-6">
          <SignupForm topic={normalizedTopic} />
        </div>
        
        {/* Navigation buttons - just at the top */}
        <div className="mb-4 md:mb-6 flex justify-end space-x-4">
          {/* Newer button (points left toward more recent newsletters) */}
          {nextNewsletter && (
            <Link 
              href={`/${params.topic}/archive/${format(new Date(nextNewsletter.publishedat), "yyyy-MM-dd")}`}
              className="inline-flex items-center justify-center py-2 px-4 rounded-lg bg-white dark:bg-gray-800 shadow transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <svg 
                xmlns="https://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Newer</span>
            </Link>
          )}
          
          {/* Older button (points right toward older newsletters) */}
          {prevNewsletter && (
            <Link 
              href={`/${params.topic}/archive/${format(new Date(prevNewsletter.publishedat), "yyyy-MM-dd")}`}
              className="inline-flex items-center justify-center py-2 px-4 rounded-lg bg-white dark:bg-gray-800 shadow transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <span className="text-sm font-medium">Older</span>
              <svg 
                xmlns="https://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-1.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        <LatestNewsletter newsletter={newsletter} />
        
        {/* Related Newsletters Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-indigo-700 dark:text-indigo-300">
            You may also like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(newsletters)
              .filter(([topic]) => normalizeTopicPath(topic) !== normalizedTopic)
              .slice(0, 3)
              .map(([topic, details]) => (
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