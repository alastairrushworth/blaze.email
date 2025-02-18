import { SignupForm } from "@/components/SignupForm"
import { LatestNewsletter } from "@/components/LatestNewsletter"
import { getLatestNewsletter } from '@/lib/db'

export default async function TopicPage({ params }: { params: { topic: string } }) {
  // Commented out database fetch
  const latestNewsletter = await getLatestNewsletter(params.topic)
  return (
    <div className="py-16">
      <h1 className="text-5xl font-bold mb-4 text-center text-indigo-800 dark:text-indigo-200">
        {params.topic.replace(/-/g, ' ')}
      </h1>
      <p className="text-xl text-center text-indigo-600 dark:text-indigo-300 mb-4">Weekly insights on {params.topic.replace(/-/g, ' ')}</p>
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

