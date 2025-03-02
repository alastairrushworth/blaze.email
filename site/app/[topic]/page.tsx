import { SignupForm } from "@/components/SignupForm"
import { LatestNewsletter } from "@/components/LatestNewsletter"
import { getLatestNewsletter } from '@/lib/db'
import { format, parseISO } from 'date-fns'

export default async function TopicPage({ params }: { params: { topic: string } }) {
  // Commented out database fetch
  const latestNewsletter = await getLatestNewsletter(params.topic)
  
  // Debug log to see what we're getting from the database
  console.log("Latest newsletter:", latestNewsletter)
  
  // Format date as "Day of Week + Day with ordinal suffix + Month name, Year"
  let formattedDate = null
  if (latestNewsletter?.publishedat) {
    try {
      const date = new Date(latestNewsletter.publishedat)
      
      // Format the date as "EEEE do MMMM, yyyy" (e.g., "Tuesday 25th February, 2025")
      formattedDate = format(date, "EEEE do MMMM, yyyy")
    } catch (error) {
      console.error("Error formatting date:", error)
      // Fallback to a simpler format in case of error
      formattedDate = latestNewsletter.publishedat.toString().split('T')[0]
    }
  }
    
  return (
    <div className="py-16">
      <h1 className="text-4xl font-bold mb-3 text-center text-indigo-800 dark:text-indigo-200">
        {params.topic.replace(/-/g, ' ')}
      </h1>
      <p className="text-xl text-center text-indigo-600 dark:text-indigo-300 mb-4">
        {formattedDate ? formattedDate : `Weekly insights on ${params.topic.replace(/-/g, ' ')}`}
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-3xl font-semibold mb-4 text-indigo-600 dark:text-indigo-300">
          Subscribe to this newsletter!
        </h2>
        <SignupForm topic={params.topic.replace(/-/g, ' ')} />
      </div>
      <LatestNewsletter newsletter={latestNewsletter} />
    </div>
  )
}

