import { LatestNewsletter } from "@/components/LatestNewsletter"
import Breadcrumb from "@/components/Breadcrumb"
import SchemaJsonLd from "@/components/SchemaJsonLd"
import { SignupForm } from "@/components/SignupForm"
import { SubscriptionPopup } from "@/components/SubscriptionPopup"
import { RelatedNewsletters } from "@/components/RelatedNewsletters"
import { TopicAbout } from "@/components/TopicAbout"
import { NewsletterNavigation } from "@/components/NewsletterNavigation"
import { getNewsletterByDate, getNewsletterArchive } from '@/lib/db'
import { format, parse } from 'date-fns'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { generateNewsletterSchema, getCanonicalUrl } from '@/lib/schema'
import { findAdjacentNewsletters } from '@/lib/newsletter-utils'
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
  const imageUrl = `${siteMetadata.baseUrl}/logo.png`;
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
  
  // Find adjacent newsletters (previous and next)
  const { prevNewsletter, nextNewsletter } = findAdjacentNewsletters(archiveNewsletters, newsletterDate);
  
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
    imageUrl: `${siteMetadata.baseUrl}/logo.png`,
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

        <div className="mt-3 flex items-center justify-center mb-6 md:mb-8">
          <span className="mr-2 text-3xl md:text-4xl" role="img" aria-label={`${topicDetails?.title || normalizedTopic} icon`}>{topicDetails?.emoji}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 dark:text-indigo-200">
            {topicDetails?.title || normalizedTopic}: {formattedTextDate}
          </h1>
        </div>

        <div className="mb-5 md:mb-6">
          <SignupForm topic={normalizedTopic} />
        </div>
        
        {/* Date and Navigation row */}
        <div className="flex justify-between items-center mb-2 md:mb-3">
          {/* Date on the left */}
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            Published {formattedTextDate}
          </p>
          
          {/* Navigation buttons on the right */}
          <div className="flex justify-end">
            <NewsletterNavigation 
              topic={params.topic} 
              prevNewsletter={prevNewsletter} 
              nextNewsletter={nextNewsletter} 
            />
          </div>
        </div>

        <LatestNewsletter newsletter={newsletter} />
        
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