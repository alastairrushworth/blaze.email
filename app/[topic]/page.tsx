import { SignupForm } from "@/components/SignupForm"
import { LatestNewsletter } from "@/components/LatestNewsletter"
// import { getLatestNewsletter } from '@/lib/db'

export default async function TopicPage({ params }: { params: { topic: string } }) {
  // Commented out database fetch
  // const latestNewsletter = await getLatestNewsletter(params.topic)

  return (
    <div className="py-16">
      <h1 className="text-5xl font-bold mb-4 text-center text-indigo-800 dark:text-indigo-200 capitalize">
        {params.topic}
      </h1>
      <p className="text-xl text-center text-indigo-600 dark:text-indigo-300 mb-4">Weekly insights on {params.topic}</p>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
        Join thousands of readers who get curated {params.topic} updates every Wednesday
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-indigo-600 dark:text-indigo-300">
          Get Weekly {params.topic} Updates
        </h2>
        <SignupForm topic={params.topic} />
      </div>
      <LatestNewsletter />
    </div>
  )
}

