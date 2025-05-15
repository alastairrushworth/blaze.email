// Schema.org utility functions for JSON-LD structured data

interface NewsletterData {
  title: string;
  description: string;
  topic: string;
  url: string;
  publishedAt?: string;
  authorName?: string;
  imageUrl?: string;
  keywords?: string;
}

/**
 * Generate JSON-LD schema for a newsletter article
 */
export function generateNewsletterSchema(data: NewsletterData) {
  const {
    title,
    description,
    topic,
    url,
    publishedAt,
    authorName = 'blaze.email Team',
    imageUrl,
    keywords
  } = data;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: description,
    keywords: keywords,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'blaze.email',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}/logo.png`,
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    about: {
      '@type': 'Thing',
      name: topic,
    },
    isPartOf: {
      '@type': 'Series',
      name: `${topic} Newsletter Series`,
      issn: `blaze-${topic.toLowerCase().replace(/\s+/g, '-')}`
    }
  };
}

/**
 * Generate JSON-LD schema for the website organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'blaze.email',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email',
    logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}/logo.png`,
    sameAs: [
      'https://mastodon.social/@blaze_email',
      'https://linkedin.com/company/blaze-email',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@blaze.email',
      contactType: 'customer service'
    }
  };
}

/**
 * Generate JSON-LD schema for breadcrumbs
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD schema for FAQs
 */
export function generateFAQSchema(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    }))
  };
}

/**
 * Generate a canonical URL - strips any query parameters
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email';
  
  // Remove any query parameters from the path
  const pathWithoutQuery = path.split('?')[0];
  
  // Ensure path starts with a slash
  const cleanPath = pathWithoutQuery.startsWith('/') ? pathWithoutQuery : `/${pathWithoutQuery}`;
  
  return `${baseUrl}${cleanPath}`;
}