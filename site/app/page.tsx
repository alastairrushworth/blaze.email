import Link from "next/link"
import Image from "next/image"
import logo from "@/public/logo.png"
import { Metadata } from 'next'
import SchemaJsonLd from "@/components/SchemaJsonLd"
import { generateFAQSchema, getCanonicalUrl } from "@/lib/schema"
import { newsletters, siteMetadata, faqData, formatTopicPath } from "./siteConfig"

export const metadata: Metadata = {
  title: `${siteMetadata.name} - ${siteMetadata.title}`,
  description: siteMetadata.description,
  keywords: siteMetadata.defaultKeywords,
  openGraph: {
    title: `${siteMetadata.name} - ${siteMetadata.title}`,
    description: siteMetadata.description,
    type: 'website',
    siteName: siteMetadata.name,
    locale: 'en_US',
    url: siteMetadata.baseUrl,
    images: [
      {
        url: `${siteMetadata.baseUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: `${siteMetadata.name} weekly tech newsletters`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteMetadata.name} - ${siteMetadata.title}`,
    description: siteMetadata.description,
    images: [`${siteMetadata.baseUrl}/logo.png`],
    creator: '@blazeemail',
    site: '@blazeemail',
  },
  alternates: {
    canonical: getCanonicalUrl('/')
  }
}

// Use faqData from siteConfig

export default function Home() {
  return (
    <>
      <SchemaJsonLd schema={generateFAQSchema(faqData)} />
      <div className="py-16">
        <div className="flex justify-center items-center mb-4">
          <Image src={logo} alt="blaze.email logo" width={55} height={55} className="mr-2" />
          <div>
            <h1 className="text-5xl font-bold text-indigo-800 dark:text-indigo-200">{siteMetadata.name}</h1>
          </div>
        </div>
        <p className="text-xl text-center text-indigo-600 dark:text-indigo-300 mb-4">Weekly newsletter digests collating the best blogs and tech articles</p>

        <div className="mt-8 mb-12">
          <h2 className="text-2xl font-semibold text-center text-indigo-700 dark:text-indigo-300 mb-6">
            Choose your tech newsletter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(newsletters).map(([topic, details]) => (
              <div key={topic} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 relative">
                <Link
                  href={`/${formatTopicPath(topic)}`}
                  className="cursor-pointer block"
                >
                  <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
                    <span role="img" aria-label={`${topic} icon`}>{details.emoji}</span> {topic}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{details.about}</p>

                  {/* Vertically centered arrow on right */}
                  <svg
                    xmlns="https://www.w3.org/2000/svg"
                    className="h-5 w-5 text-indigo-400 dark:text-indigo-500 absolute top-1/2 -translate-y-1/2 right-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>

                {/* RSS feed link */}
                <a
                  href={`/${formatTopicPath(topic)}/feed.xml`}
                  className="absolute bottom-4 right-4 p-1 text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors z-10"
                  title={`${topic} RSS Feed`}
                  aria-label={`${topic} RSS Feed`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
                    <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1zM3 15a2 2 0 114 0 2 2 0 01-4 0z" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-center text-indigo-700 dark:text-indigo-300 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <dl className="space-y-6">
              {faqData.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                  <dt className="text-lg font-medium text-indigo-600 dark:text-indigo-300 mb-2">{faq.question}</dt>
                  <dd className="text-gray-600 dark:text-gray-300">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </>
  )
}