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


