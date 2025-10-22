import Image from "next/image"
import logo from "@/public/logo.png"
import { Metadata } from 'next'
import { getCanonicalUrl } from "@/lib/schema"
import { newsletters, siteMetadata } from "./siteConfig"

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
      <div className="py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <Image src={logo} alt="blaze.email logo" width={48} height={48} className="mr-3" />
            <h1 className="text-5xl font-semibold text-gray-900">{siteMetadata.name}</h1>
          </div>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Weekly newsletter digests collating the best blogs and tech articles
          </p>
        </div>

        {/* Newsletters List */}
        <div className="max-w-xl mx-auto">
          <ul className="space-y-1">
            {Object.entries(newsletters).map(([topic, details]) => {
              // Map topics to subdomains
              const subdomainMap: Record<string, string> = {
                "Generative AI": "ai.blaze.email",
                "Data Scientist (with R)": "rstats.blaze.email",
                "Machine Learning Engineer": "ml.blaze.email",
                "Tech and startups": "tech.blaze.email",
                "Quantum Computing": "quantum.blaze.email",
                "Electronics": "electronics.blaze.email",
                "The Mathematician": "math.blaze.email"
              };

              const subdomain = subdomainMap[topic];

              // Only show newsletters that have a subdomain mapping (excludes Crypto)
              if (!subdomain) return null;

              return (
                <li key={topic} className="border-b border-gray-200 last:border-b-0">
                  <a
                    href={`https://${subdomain}`}
                    className="block py-4 hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 mb-1">
                          <span role="img" aria-label={`${topic} icon`} className="mr-2">{details.emoji}</span>
                          {topic}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{details.about}</p>
                      </div>
                      <span className="text-gray-400 group-hover:text-gray-600 ml-4 mt-1">→</span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  )
}