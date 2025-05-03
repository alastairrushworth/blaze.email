import { BackButton } from "@/components/BackButton"
import { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/schema'

export const metadata: Metadata = {
  title: "About blaze.email",
  description: "Learn about blaze.email - an email newsletter service that automatically curates the best independent technical writing",
  alternates: {
    canonical: getCanonicalUrl('/about')
  }
}

export default function AboutPage() {
  return (
    <div className="py-16">
      <h1 className="text-5xl font-bold mb-8 text-center text-indigo-800 dark:text-indigo-200">About blaze.email</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300">Our Mission</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Blaze is an email newsletter service that automatically curates the best independent technical writing from
          the past week into newsletter digests. We place a strong focus on discovery, and try to strike a balance between
          quality, relevance and diversity.

          The project was borne out of frustration with the traditional means of discovering and reading technical content <a href='https://alastairrushworth.com/posts/why-finding-good-tech-blogs-is-hard/' className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors">'Why finding good tech blogs is hard'</a>.

        </p>
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300">Get in Touch</h2>
        <p className="text-gray-700 dark:text-gray-300">
          I'd really appreciate any feedback you have on blaze or ways it might be improved - you can either drop me a line directly or add some <a href='https://95nowtw3un3.typeform.com/to/prerGYiP' className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors">feedback using this anonymous typeform.</a>
        </p>
      </div>
      <BackButton />
    </div>
  )
}

