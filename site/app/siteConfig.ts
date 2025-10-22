// Site-wide configuration and content
// Contains all site-specific text, metadata, and settings

// Site metadata
export const siteMetadata = {
  name: 'Blaze Newsletters',
  title: 'Weekly Digests for Devs & Tech Professionals',
  description: 'Subscribe to our free weekly tech newsletters covering AI, data science, machine learning, crypto, tech startups, and electronics.',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email',
  defaultKeywords: 'tech newsletters, AI newsletter, data science newsletter, machine learning newsletter, crypto newsletter, tech startups newsletter, weekly tech updates, free tech newsletter, electronics newsletter',
  logo: '/logo.png',
  favicon: '/favicon.png',
  owner: 'blaze.email Team',
  socials: {
    mastodon: 'https://mastodon.social/@blazeemail',
    linkedin: 'https://www.linkedin.com/company/96246606',
  }
}

// Newsletter interface for TypeScript type checking
export interface Newsletter {
  emoji: string;           // Emoji icon for the newsletter
  about: string;           // Short description of the newsletter content
}

// Newsletter definitions
export const newsletters: Record<string, Newsletter> = {
  "Generative AI": {
    emoji: '🧠',
    about: 'Dev news and deep dives into LLMs and agentic AI'
  },
  "Data Scientist (with R)": {
    emoji: '📊',
    about: 'Programming and data science for the R community'
  },
  "Tech and startups": {
    emoji: '🚀',
    about: 'Startup news, entrepreneurship and product dev'
  },
  "Machine Learning Engineer": {
    emoji: '🤖',
    about: 'ML models, MLOps and engineering'
  },
  "Electronics": {
    emoji: '🪛',
    about: 'Hardware hacking, DIY projects and retro computing'
  },
  "Quantum Computing": {
    emoji: '⚛️',
    about: 'Quantum computing, algorithms, hardware and research'
  },
  "The Mathematician": {
    emoji: '🧮',
    about: 'Blogs, articles and research papers in mathematics'
  }
}

// FAQ content
export const faqData = [
  {
    question: "How often are the newsletters sent?",
    answer: "All newsletters are sent once per week, typically on Mondays. Each newsletter contains the most important content from the previous week."
  },
  {
    question: "Are these newsletters free to subscribe?",
    answer: "Yes, all newsletters are completely free. Simply enter your email address to subscribe to any of our tech newsletters."
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
]

