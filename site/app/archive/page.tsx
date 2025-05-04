import { Metadata } from 'next'
import { newsletters, siteMetadata, formatTopicPath } from '../siteConfig'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Newsletter Archives - Blaze.Email',
  description: 'Browse our archive of past newsletters covering various topics in tech, AI, and more.',
  openGraph: {
    title: 'Newsletter Archives - Blaze.Email',
    description: 'Browse our archive of past newsletters covering various topics in tech, AI, and more.',
    url: `${siteMetadata.baseUrl}/archive`,
    siteName: siteMetadata.name,
  },
  alternates: {
    canonical: `${siteMetadata.baseUrl}/archive`
  }
}

export default function ArchivePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Archives', path: '/archive', isCurrent: true }
        ]}
      />
      
      <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 dark:text-indigo-200 mb-8 text-center">
        Newsletter Archives
      </h1>
      
      <p className="text-lg text-center max-w-2xl mx-auto mb-10 text-gray-700 dark:text-gray-300">
        Browse our collection of past newsletters. Each newsletter provides insights, 
        updates, and resources on their respective topics.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(newsletters).map(([topic, details]) => (
          <Link
            key={topic}
            href={`/${formatTopicPath(topic)}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 relative"
          >
            <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
              <span className="mr-2 text-2xl" role="img" aria-label={`${topic} icon`}>
                {details.emoji}
              </span> 
              {details.title || topic}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              {details.about}
            </p>
            <div className="text-indigo-600 dark:text-indigo-400 font-medium">
              View latest issue
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}