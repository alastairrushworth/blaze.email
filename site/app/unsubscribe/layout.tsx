import { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/schema'

export const metadata: Metadata = {
  title: "Unsubscribe - blaze.email",
  description: "Manage your newsletter subscriptions and unsubscribe from blaze.email newsletters",
  openGraph: {
    title: "Unsubscribe - blaze.email",
    description: "Manage your newsletter subscriptions and unsubscribe from blaze.email newsletters",
    type: 'website',
    siteName: 'Blaze Newsletters',
    locale: 'en_US',
    url: getCanonicalUrl('/unsubscribe'),
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}/api/og?topic=Unsubscribe`,
        width: 1200, 
        height: 630,
        alt: 'Unsubscribe - blaze.email',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Unsubscribe - blaze.email",
    description: "Manage your newsletter subscriptions and unsubscribe from blaze.email newsletters",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}/api/og?topic=Unsubscribe`],
    creator: '@blazeemail',
    site: '@blazeemail',
  },
  alternates: {
    canonical: getCanonicalUrl('/unsubscribe')
  }
}

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}