import { SignupForm } from "@/components/SignupForm"
import { LatestNewsletter } from "@/components/LatestNewsletter"
import { getLatestNewsletter } from '@/lib/db'
import { format, parseISO } from 'date-fns'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { newsletters } from '../newsletters'

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

  const title = `${normalizedTopic} Newsletter - ${formattedDate || 'Weekly Edition'}`
  const description = `A weekly roundup of ${aboutText}`

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      siteName: 'blaze.email',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}/api/og?topic=${encodeURIComponent(params.topic)}&date=${encodeURIComponent(formattedDate || '')}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [
        `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}/api/og?topic=${encodeURIComponent(params.topic)}&date=${encodeURIComponent(formattedDate || '')}`,
      ],
    },
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

  // Format date as "dd-MM-yyyy" format
  let formattedDate = null
  if (latestNewsletter?.publishedat) {
    try {
      const date = new Date(latestNewsletter.publishedat)

      // Format the date as "dd-MM-yyyy" (e.g., "25-02-2025")
      formattedDate = format(date, "dd-MM-yyyy")
    } catch (error) {
      console.error("Error formatting date:", error)
      // Fallback to a simpler format in case of error
      formattedDate = latestNewsletter.publishedat.toString().split('T')[0]
    }
  }

  return (
    <div className="py-16">
      <h1 className="text-4xl font-bold mb-3 text-center text-indigo-800 dark:text-indigo-200">
        {params.topic.replace(/-/g, ' ')} Newsletter - {formattedDate ? formattedDate : "Weekly Edition"}
      </h1>
      <h2 className="text-2xl font-normal mb-4 text-center text-indigo-700 dark:text-indigo-300">
        Latest news in {newsletters[params.topic.replace(/-/g, ' ')]?.about || `${params.topic.replace(/-/g, ' ')}`}
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600 dark:text-indigo-300">
          Subscribe to this newsletter!
        </h2>
        <SignupForm topic={params.topic.replace(/-/g, ' ')} />
      </div>
      <LatestNewsletter newsletter={latestNewsletter} />

      {/* Bottom subscription box */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600 dark:text-indigo-300">
          Don't miss next week's newsletter!
        </h2>
        <SignupForm topic={params.topic.replace(/-/g, ' ')} />
      </div>
    </div>
  )
}

