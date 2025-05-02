import "./globals.css"
import { Nunito } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Footer } from "@/components/Footer"
import { ThemeToggle } from "@/components/ThemeToggle"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import SchemaJsonLd from "@/components/SchemaJsonLd"
import { generateOrganizationSchema } from "@/lib/schema"
import { Suspense } from "react"
import type React from "react"

const nunitoSans = Nunito({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"], // Add required font weights
  variable: "--font-nunito-sans",
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
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={nunitoSans.variable}>
      <Suspense fallback={null}>
        <GoogleAnalytics />
      </Suspense>
      <body
        className={`font-sans bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300`}
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <SchemaJsonLd schema={generateOrganizationSchema()} />
            <header className="relative pb-2">
              <div className="max-w-5xl mx-auto px-1 sm:px-4 md:px-6 lg:px-8 relative">
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-grow">
              <div className="max-w-5xl mx-auto px-1 sm:px-4 md:px-6 lg:px-8">{children}</div>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

