import { SubscriptionPopup } from "@/components/SubscriptionPopup"
import { SignupForm } from "@/components/SignupForm"
import { LatestNewsletter } from "@/components/LatestNewsletter"
import Breadcrumb from "@/components/Breadcrumb"
import SchemaJsonLd from "@/components/SchemaJsonLd"
import { getLatestNewsletter } from '@/lib/db'
import { format, parseISO } from 'date-fns'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { newsletters } from '../newsletters'
import Link from 'next/link'
import { generateNewsletterSchema, getCanonicalUrl } from '@/lib/schema'

// Check if the topic exists in newsletters list
function isValidTopic(topic: string): boolean {
  const normalizedTopic = topic.replace(/-/g, ' ')
  return Object.keys(newsletters).includes(normalizedTopic)
}

// Generate dynamic metadata for each topic page
export async function generateMetadata({ params }: { params: { topic: string } }): Promise<Metadata> {
  // Check if the topic exists
  if (!isValidTopic(params.topic)) {
    notFound()
  }

  const latestNewsletter = await getLatestNewsletter(params.topic)

  let formattedDate = null
  if (latestNewsletter?.publishedat) {
    try {
      const date = new Date(latestNewsletter.publishedat)
      formattedDate = format(date, "MMMM d, yyyy")
    } catch (error) {
      formattedDate = latestNewsletter.publishedat.toString().split('T')[0]
    }
  }

  const normalizedTopic = params.topic.replace(/-/g, ' ')
  const aboutText = newsletters[normalizedTopic]?.about || `${normalizedTopic}`

  const title = normalizedTopic
  const description = `A weekly roundup of ${aboutText}`

  // Enhanced description with more keywords
  const enhancedDescription = `Weekly curated ${normalizedTopic} newsletter featuring latest trends, research, tools, and articles. Subscribe for free to stay updated on ${aboutText}`;
  
  // Image URL for OG and Twitter cards
  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}/api/og?topic=${encodeURIComponent(params.topic)}&date=${encodeURIComponent(formattedDate || '')}`;
  
  // Canonical URL
  const canonicalUrl = getCanonicalUrl(`/${params.topic}`);
  
  return {
    title: title,
    description: enhancedDescription,
    keywords: `${normalizedTopic.toLowerCase()}, newsletter, tech newsletter, weekly newsletter, ${aboutText.toLowerCase()}, curated content, tech news`,
    openGraph: {
      title: title,
      description: enhancedDescription,
      type: 'article',
      siteName: 'blaze.email',
      url: canonicalUrl,
      publishedTime: latestNewsletter?.publishedat,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: enhancedDescription,
      images: [imageUrl],
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

  // Commented out database fetch
  const latestNewsletter = await getLatestNewsletter(params.topic)

  // Debug log to see what we're getting from the database
  console.log("Latest newsletter:", latestNewsletter)

  // Format dates
  let formattedDate = null
  let formattedTextDate = null
  if (latestNewsletter?.publishedat) {
    try {
      const date = new Date(latestNewsletter.publishedat)

      // Format the date as "dd-MM-yyyy" (e.g., "25-02-2025") for metadata
      formattedDate = format(date, "dd-MM-yyyy")
      
      // Format the date in text format (e.g., "19th May 2025") for display
      formattedTextDate = format(date, "do MMMM yyyy")
    } catch (error) {
      console.error("Error formatting date:", error)
      // Fallback to a simpler format in case of error
      formattedDate = latestNewsletter.publishedat.toString().split('T')[0]
    }
  }

  // Get normalized topic and detailed info
  const normalizedTopic = params.topic.replace(/-/g, ' ')
  const topicDetails = newsletters[normalizedTopic]
  const aboutText = topicDetails?.about || normalizedTopic
  
  // Generate schema data for the newsletter
  const schemaData = {
    title: normalizedTopic,
    description: `Weekly curated ${normalizedTopic} newsletter featuring latest trends, research, tools, and articles about ${aboutText}`,
    topic: normalizedTopic,
    url: getCanonicalUrl(`/${params.topic}`),
    publishedAt: latestNewsletter?.publishedat,
    imageUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}/api/og?topic=${encodeURIComponent(params.topic)}&date=${encodeURIComponent(formattedDate || '')}`
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
            { label: normalizedTopic, path: `/${params.topic}`, isCurrent: true }
          ]} 
        />
        
        <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3 text-center text-indigo-800 dark:text-indigo-200">
          {normalizedTopic}
        </h1>
        <h2 className="text-base md:text-lg font-normal mb-1 md:mb-2 text-center text-indigo-700 dark:text-indigo-300">
          Latest news in {aboutText}
        </h2>
        {formattedTextDate && (
          <p className="text-sm md:text-base text-center text-gray-500 dark:text-gray-400 mb-3 md:mb-4">
            {formattedTextDate}
          </p>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-6 md:p-8 mb-3 md:mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4 text-indigo-600 dark:text-indigo-300">
            Subscribe to this newsletter!
          </h2>
          <SignupForm topic={normalizedTopic} />
        </div>
        
        <LatestNewsletter newsletter={latestNewsletter} />
        
        {/* Related Newsletters Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-indigo-700 dark:text-indigo-300">
            You may also like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedNewsletters.map(([topic, details]) => (
              <Link
                key={topic}
                href={`/${topic.replace(/\s+/g, '-')}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300 relative cursor-pointer"
              >
                <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-300 mb-2">
                  <span role="img" aria-label={`${topic} icon`}>{details.emoji}</span> {topic}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{details.about}</p>
                
                {/* Vertically centered arrow on right */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
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
            About {normalizedTopic}
          </h2>
          <div className="max-w-none">
            <p className="mb-4 text-gray-800 dark:text-gray-200">
              Our {normalizedTopic} newsletter covers the latest developments, trends, tools, and insights in {aboutText.toLowerCase()}.
              Each week, we curate the most important content so you don't have to spend hours searching.
            </p>
            <p className="mb-4 text-gray-800 dark:text-gray-200">
              Whether you're a beginner or expert in {normalizedTopic.toLowerCase()}, our newsletter provides valuable information
              to keep you informed and ahead of the curve in this rapidly evolving field.
            </p>
            <p className="text-gray-800 dark:text-gray-200">
              Subscribe now to join thousands of professionals who receive our weekly updates!
            </p>
          </div>
        </section>
      </div>
      
      {/* Popup subscription form that appears when user scrolls near the bottom */}
      <SubscriptionPopup topic={normalizedTopic} />
    </div>
  )
}