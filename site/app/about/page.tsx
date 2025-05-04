import { BackButton } from "@/components/BackButton"
import { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/schema'
import { siteMetadata, aboutPageContent } from '../siteConfig'

export const metadata: Metadata = {
  title: `About ${siteMetadata.name}`,
  description: "Learn about blaze.email - an email newsletter service that automatically curates the best independent technical writing",
  alternates: {
    canonical: getCanonicalUrl('/about')
  }
}

export default function AboutPage() {
  return (
    <div className="py-16">
      <h1 className="text-5xl font-bold mb-8 text-center text-indigo-800 dark:text-indigo-200">
        {aboutPageContent.title}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300">
          {aboutPageContent.mission.title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {aboutPageContent.mission.content.split('with the traditional means of')[0]}
          with the traditional means of discovering and reading technical content <a href={aboutPageContent.contact.blogPostUrl} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors">'Why finding good tech blogs is hard'</a>.
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300">
          {aboutPageContent.contact.title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          {aboutPageContent.contact.content.split('using this anonymous typeform')[0]}
          using this <a href={aboutPageContent.contact.typeformUrl} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors">anonymous typeform.</a>
        </p>
      </div>
      <BackButton />
    </div>
  )
}