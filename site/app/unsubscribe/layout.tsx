import { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/schema'

export const metadata: Metadata = {
  title: "Unsubscribe - blaze.email",
  description: "Manage your newsletter subscriptions and unsubscribe from blaze.email newsletters",
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