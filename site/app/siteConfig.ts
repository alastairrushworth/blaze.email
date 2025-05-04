// Site-wide configuration and content
// Contains all site-specific text, metadata, and settings

// Site metadata
export const siteMetadata = {
  name: 'blaze.email',
  title: 'Weekly Tech Newsletters for AI, Data Science & Tech',
  description: 'Subscribe to our free weekly tech newsletters covering AI, data science, machine learning, crypto, tech startups, and electronics. Stay informed with curated content from industry experts.',
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

// Newsletter definitions
export const newsletters = {
  "Generative AI": {
    'emoji': '🧠',
    'about': 'AI research, LLMs and agentic applications.',
    'keywords': 'AI news, LLMs, large language models, generative AI, agentic AI, finetuning, AI engineering',
  },
  "Data Scientist (with R)": {
    'emoji': '📊',
    'about': 'R programming, data science and community updates.',
    'keywords': 'R programming, data science, R community, data analysis, data visualization, R packages',
  },
  "Tech and startups": {
    'emoji': '🚀',
    'about': 'Building companies, tech teams and products.',
    'keywords': 'startups, entrepreneurship, tech news, product development, company building, tech teams',
  },
  "Machine Learning Engineer": {
    'emoji': '🤖',
    'about': 'ML research, models and engineering.',
    'keywords': 'machine learning, ML research, ML engineering, model development, AI models, data science',
  },
  "Crypto": {
    'emoji': 'Ⲷ',
    'about': 'Web3, DeFi and blockchain news.',
    'keywords': 'cryptocurrency, blockchain, DeFi, Web3, crypto news, digital assets, decentralized finance',
  },
  "Electronics": {
    'emoji': '🪛',
    'about': 'Hardware hacking, DIY projects and retro computing.',
    'keywords': 'electronics, hardware hacking, DIY projects, retro computing, maker culture, electronics projects',
  },
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

// About page content
export const aboutPageContent = {
  title: "About blaze.email",
  mission: {
    title: "Our Mission",
    content: "Blaze is an email newsletter service that automatically curates the best independent technical writing from the past week into newsletter digests. We place a strong focus on discovery, and try to strike a balance between quality, relevance and diversity. The project was borne out of frustration with the traditional means of discovering and reading technical content."
  },
  contact: {
    title: "Get in Touch",
    content: "I'd really appreciate any feedback you have on blaze or ways it might be improved - you can either drop me a line directly or add some feedback using this anonymous typeform.",
    typeformUrl: 'https://95nowtw3un3.typeform.com/to/prerGYiP',
    blogPostUrl: 'https://alastairrushworth.com/posts/why-finding-good-tech-blogs-is-hard/'
  }
}

// Format utility functions
export const formatTopicPath = (topic: string): string => topic.replace(/\s+/g, '-')
export const normalizeTopicPath = (path: string): string => path.replace(/-/g, ' ')