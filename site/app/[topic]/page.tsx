import { SubscriptionPopup } from "@/components/SubscriptionPopup"
import { SignupForm } from "@/components/SignupForm"
import { LatestNewsletter } from "@/components/LatestNewsletter"
import { RelatedNewsletters } from "@/components/RelatedNewsletters"
import { TopicAbout } from "@/components/TopicAbout"
import { NewsletterNavigation } from "@/components/NewsletterNavigation"
import Breadcrumb from "@/components/Breadcrumb"
import SchemaJsonLd from "@/components/SchemaJsonLd"
import { getLatestNewsletter, getNewsletterArchive } from '@/lib/db'
import { format } from 'date-fns'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { generateNewsletterSchema, getCanonicalUrl } from '@/lib/schema'
import { newsletters, siteMetadata, formatTopicPath, normalizeTopicPath } from '../siteConfig'
import { findAdjacentNewsletters } from '@/lib/newsletter-utils'

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
  
  // Build URLs and descriptions
  const imageUrl = `${siteMetadata.baseUrl}/logo.png`;
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
      canonical: canonicalUrl,
      types: {
        'application/rss+xml': [
          {
            url: `/${params.topic}/feed.xml`,
            title: `${topicDetails?.title || normalizedTopic} RSS Feed`
          }
        ]
      }
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
    imageUrl: `${siteMetadata.baseUrl}/logo.png`,
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

        <div className="mt-3 flex items-center justify-center mb-6 md:mb-8">
          <span className="mr-2 text-3xl md:text-4xl" role="img" aria-label={`${topicDetails?.title || normalizedTopic} icon`}>{topicDetails?.emoji}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 dark:text-indigo-200">
            {topicDetails?.title || normalizedTopic}
          </h1>
        </div>

        <div className="mb-5 md:mb-6">
          <SignupForm topic={normalizedTopic} />
        </div>

        {/* RSS Feed Link */}
        <div className="flex justify-center mb-4">
          <a
            href={`/${params.topic}/feed.xml`}
            className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
              <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1zM3 15a2 2 0 114 0 2 2 0 01-4 0z" />
            </svg>
            Subscribe via RSS
          </a>
        </div>
        
        {/* Date and Navigation row */}
        <div className="flex justify-between items-center mb-2 md:mb-3">
          {/* Date on the left */}
          {formattedTextDate && (
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              Published {formattedTextDate}
            </p>
          )}
          
          {/* Navigation buttons on the right */}
          <div className="flex justify-end">
            {archiveNewsletters && archiveNewsletters.length > 0 && latestNewsletter?.publishedat && (
              (() => {
                const latestDate = new Date(latestNewsletter.publishedat);
                // Find adjacent newsletters (previous and next)
                const { prevNewsletter, nextNewsletter } = findAdjacentNewsletters(archiveNewsletters, latestDate);
                
                return (
                  <NewsletterNavigation 
                    topic={params.topic} 
                    prevNewsletter={prevNewsletter}
                    nextNewsletter={nextNewsletter} 
                  />
                );
              })()
            )}
          </div>
        </div>

        <LatestNewsletter newsletter={latestNewsletter} />

        {/* Related Newsletters Section */}
        <RelatedNewsletters currentTopic={normalizedTopic} />

        {/* Topic Overview Section */}
        <TopicAbout 
          topicDetails={topicDetails} 
          normalizedTopic={normalizedTopic} 
          aboutText={aboutText} 
        />
      </div>

      {/* Popup subscription form that appears when user scrolls near the bottom */}
      <SubscriptionPopup topic={normalizedTopic} />
    </div>
  )
}