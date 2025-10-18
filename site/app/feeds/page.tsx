import Link from "next/link"
import BackButton from "@/components/BackButton"
import { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/schema'
import { newsletters, siteMetadata, formatTopicPath } from '../siteConfig'

export const metadata: Metadata = {
  title: `RSS Feeds - ${siteMetadata.name}`,
  description: "Subscribe to our RSS feeds to get the latest tech newsletter updates delivered directly to your feed reader",
  openGraph: {
    title: `RSS Feeds - ${siteMetadata.name}`,
    description: "Subscribe to our RSS feeds to get the latest tech newsletter updates delivered directly to your feed reader",
    type: 'website',
    siteName: siteMetadata.name,
    locale: 'en_US',
    url: getCanonicalUrl('/feeds'),
  },
  alternates: {
    canonical: getCanonicalUrl('/feeds')
  }
}

export default function FeedsPage() {
  return (
    <div className="py-16">
      <h1 className="text-5xl font-bold mb-8 text-center text-indigo-800 dark:text-indigo-200">RSS Feeds</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
          Subscribe to our RSS feeds to get the latest newsletter updates delivered directly to your feed reader.
          Each feed contains the last 10 issues with full text content.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {Object.entries(newsletters).map(([topic, details]) => (
            <div
              key={topic}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-1">
                    <span role="img" aria-label={`${topic} icon`}>{details.emoji}</span> {topic}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{details.about}</p>
                  <a
                    href={`/${formatTopicPath(topic)}/feed.xml`}
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
                      <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1zM3 15a2 2 0 114 0 2 2 0 01-4 0z" />
                    </svg>
                    Subscribe to RSS
                  </a>
                </div>
                <Link
                  href={`/${formatTopicPath(topic)}`}
                  className="ml-4 text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300"
                  aria-label={`View ${topic} newsletter`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-indigo-50 dark:bg-gray-900 rounded-lg">
          <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-2">How to use RSS feeds</h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
            <li>Copy the RSS feed URL from above</li>
            <li>Open your favorite RSS reader (Feedly, Inoreader, NetNewsWire, etc.)</li>
            <li>Add the feed URL to your reader</li>
            <li>Enjoy automatic updates whenever a new newsletter is published</li>
          </ul>
        </div>
      </div>

      <BackButton fixed={true} />
    </div>
  )
}
