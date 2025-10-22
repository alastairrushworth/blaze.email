import "./globals.css"
import { Bangers } from "next/font/google"
import { Footer } from "@/components/Footer"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import SchemaJsonLd from "@/components/SchemaJsonLd"
import { generateOrganizationSchema } from "@/lib/schema"
import { Suspense } from "react"
import type React from "react"

const bangers = Bangers({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-bangers",
})

export const metadata = {
  title: "blaze.email - Weekly Tech Newsletters",
  description: "Stay updated with weekly curated tech newsletters on AI, data science, tech startups, machine learning, crypto, and electronics",
  keywords: "tech newsletters, AI newsletter, data science newsletter, machine learning newsletter, crypto newsletter, tech startups, weekly newsletter",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "blaze.email - Weekly Tech Newsletters",
    description: "Stay updated with weekly curated tech newsletters on AI, data science, tech startups, machine learning, crypto, and electronics",
    url: 'https://blaze.email',
    siteName: 'blaze.email',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'blaze.email logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "blaze.email - Weekly Tech Newsletters",
    description: "Stay updated with weekly curated tech newsletters on AI, data science, tech startups, machine learning, crypto, and electronics",
    images: ['/logo.png'],
    creator: '@blazeemail',
    site: '@blazeemail',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={bangers.variable}>
      <Suspense fallback={null}>
        <GoogleAnalytics />
      </Suspense>
      <body className="bg-white text-gray-900 font-sans">
        <div className="flex flex-col min-h-screen">
          <SchemaJsonLd schema={generateOrganizationSchema()} />
          <main className="flex-grow">
            <div className="max-w-3xl mx-auto px-6 sm:px-8 md:px-12">{children}</div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}

