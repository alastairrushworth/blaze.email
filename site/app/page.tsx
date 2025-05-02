import Link from "next/link"
import { newsletters } from "./newsletters"
import Image from "next/image"
import logo from "@/public/logo.png"
import { Metadata } from 'next'
import SchemaJsonLd from "@/components/SchemaJsonLd"
import { generateFAQSchema, getCanonicalUrl } from "@/lib/schema"

export const metadata: Metadata = {
  title: "blaze.email - Weekly Tech Newsletters for AI, Data Science & Tech",
  description: "Subscribe to our free weekly tech newsletters covering AI, data science, machine learning, crypto, tech startups, and electronics. Stay informed with curated content from industry experts.",
  keywords: "tech newsletters, AI newsletter, data science newsletter, machine learning newsletter, crypto newsletter, blockchain newsletter, tech startups newsletter, weekly tech updates, free tech newsletter, electronics newsletter",
  openGraph: {
    title: "blaze.email - Weekly Tech Newsletters for AI, Data Science & Tech",
    description: "Subscribe to our free weekly tech newsletters covering AI, data science, machine learning, crypto, tech startups, and electronics. Stay informed with curated content from industry experts.",
    type: 'website',
    siteName: 'blaze.email',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}/api/og?topic=Newsletters`,
        width: 1200,
        height: 630,
        alt: 'blaze.email weekly tech newsletters',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "blaze.email - Weekly Tech Newsletters for AI, Data Science & Tech",
    description: "Subscribe to our free weekly tech newsletters covering AI, data science, machine learning, crypto, tech startups, and electronics. Stay informed with curated content.",
    images: [
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}/api/og?topic=Newsletters`,
    ],
  },
  alternates: {
    canonical: getCanonicalUrl('/')
  }
}

// FAQ data for schema and display
const faqData = [
  {
    question: "How often are the newsletters sent?",
    answer: "All newsletters are sent once per week on Tuesdays."
  },
  {
    question: "Are these newsletters free to subscribe?",
    answer: "Yes, all newsletters are completely free."
  },
  {
    question: "How do I unsubscribe from a newsletter?",
    answer: "You can easily unsubscribe by clicking the unsubscribe link at the bottom of any newsletter email, or by visiting the unsubscribe page on our website."
  },
  {
    question: "What kind of content is included in the newsletters?",
    answer: "Each newsletter contains a curated selection of the best articles, blog posts, tools, and resources related to its specific tech topic, all summarized for easy consumption."
  },
  {
    question: "Can I subscribe to multiple newsletters?",
    answer: "Absolutely! You can subscribe to as many of our topic-specific newsletters as you'd like. Each one is curated separately to focus on its particular technology area."
  }
];

export default function Home() {
  return (
    <>
      <SchemaJsonLd schema={generateFAQSchema(faqData)} />
      <div className="py-16">
        <div className="flex justify-center items-center mb-4">
          <Image src={logo} alt="blaze.email logo" width={55} height={55} className="mr-2" priority />
          <h1 className="text-5xl font-bold text-indigo-800 dark:text-indigo-200">blaze.email</h1>
        </div>
        <p className="text-xl text-center text-indigo-600 dark:text-indigo-300 mb-4">Weekly newsletter digests collating the best blogs and tech articles</p>

        <div className="mt-8 mb-12">
          <h2 className="text-2xl font-semibold text-center text-indigo-700 dark:text-indigo-300 mb-6">
            Choose your tech newsletter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(newsletters).map(([topic, details]) => (
              <Link
                key={topic}
                href={`/${topic.replace(/\s+/g, '-')}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 relative cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
                  <span role="img" aria-label={`${topic} icon`}>{details.emoji}</span> {topic}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{details.about}</p>

                {/* Vertically centered arrow on right */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
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