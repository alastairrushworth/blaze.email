// Site-wide configuration and content
// Contains all site-specific text, metadata, and settings

// Site metadata
export const siteMetadata = {
  name: 'Blaze Newsletters',
  title: 'Smart Weekly Digests for Devs and Tech Professionals',
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
  title: string;           // Main title display on the newsletter page
  emoji: string;           // Emoji icon for the newsletter
  about: string;           // Short description of the newsletter content
  keywords: string;        // SEO keywords for the newsletter
  description: string;     // Longer description for metadata and SEO
  overview: {              // Content for the About section
    content: string[];     // Paragraphs of text
  };
}

// Newsletter definitions
export const newsletters: Record<string, Newsletter> = {
  "Generative AI": {
    title: "Generative AI",
    emoji: '🧠',
    about: 'Dev news and deep dives into LLMs and agentic AI',
    keywords: 'AI news, LLMs, large language models, generative AI, agentic AI, finetuning, AI engineering',
    description: 'Dev-focused digest featuring news and independent blogs - covering frontier LLMs, open source tools and AI product development',
    overview: {
      content: [
        "Our Generative AI newsletter covers the latest developments, trends, tools, and insights in AI research, LLMs and agentic applications. Each week, we curate the most important content so you don't have to spend hours searching.",
        "Whether you're a beginner or expert in generative AI, our newsletter provides valuable information to keep you informed and ahead of the curve in this rapidly evolving field.",
        "Subscribe now to join thousands of professionals who receive our weekly updates!"
      ]
    }
  },
  "Data Scientist (with R)": {
    title: "Data Scientist (with R)",
    emoji: '📊',
    about: 'Programming and data science for the R community',
    keywords: 'R programming, data science, rstats, data analysis, data visualization, R packages, tidyverse, ggplot, cran, shiny, dplyr',
    description: 'Weekly rstats newsletter for R users and data scientists - covering new CRAN packages, tutorials and community updates',
    overview: {
      content: [
        "Our Data Scientist newsletter covers the latest developments, packages, techniques, and insights in R programming and data science. Each week, we curate the most important content so you don't have to spend hours searching.",
        "Whether you're a beginner or expert in data science with R, our newsletter provides valuable information to keep you informed and ahead of the curve in this dynamic field.",
        "Subscribe now to join thousands of professionals who receive our weekly updates!"
      ]
    }
  },
  "Tech and startups": {
    title: "Tech and startups",
    emoji: '🚀',
    about: 'Startup news, entrepreneurship and product dev',
    keywords: 'startups, entrepreneurship, tech news, product development, company building, tech teams',
    description: 'Weekly curated Tech and startups newsletter featuring latest trends, funding news, product launches, and insights for entrepreneurs and tech professionals.',
    overview: {
      content: [
        "Our Tech and startups newsletter covers the latest developments, funding rounds, product launches, and insights in building companies and tech products. Each week, we curate the most important content so you don't have to spend hours searching.",
        "Whether you're a founder, investor, or tech professional, our newsletter provides valuable information to keep you informed and ahead of the curve in the fast-moving startup ecosystem.",
        "Subscribe now to join thousands of professionals who receive our weekly updates!"
      ]
    }
  },
  "Machine Learning Engineer": {
    title: "Machine Learning Engineer",
    emoji: '🤖',
    about: 'ML models, MLOps and engineering',
    keywords: 'machine learning, ML research, ML engineering, model development, AI models, data science',
    description: 'Weekly curated Machine Learning Engineering newsletter featuring latest research papers, models, tools, and best practices for implementing ML systems.',
    overview: {
      content: [
        "Our Machine Learning Engineer newsletter covers the latest developments, research papers, tools, and techniques in ML engineering and deployment. Each week, we curate the most important content so you don't have to spend hours searching.",
        "Whether you're a beginner or expert in machine learning engineering, our newsletter provides valuable information to keep you informed and ahead of the curve in this technically challenging field.",
        "Subscribe now to join thousands of professionals who receive our weekly updates!"
      ]
    }
  },
  "Crypto": {
    title: "Crypto",
    emoji: 'Ⲷ',
    about: 'Web3, DeFi and blockchain news.',
    keywords: 'cryptocurrency, blockchain, DeFi, Web3, crypto news, digital assets, decentralized finance',
    description: 'Weekly curated Crypto newsletter featuring latest blockchain developments, DeFi projects, Web3 innovations, and market analysis.',
    overview: {
      content: [
        "Our Crypto newsletter covers the latest developments, projects, and insights in Web3, DeFi, and blockchain technologies. Each week, we curate the most important content so you don't have to spend hours searching.",
        "Whether you're a blockchain developer, investor, or crypto enthusiast, our newsletter provides valuable information to keep you informed and ahead of the curve in this rapidly evolving space.",
        "Subscribe now to join thousands of professionals who receive our weekly updates!"
      ]
    }
  },
  "Electronics": {
    title: "Electronics",
    emoji: '🪛',
    about: 'Hardware hacking, DIY projects and retro computing',
    keywords: 'electronics, hardware hacking, DIY projects, retro computing, maker culture, electronics projects',
    description: 'Weekly curated Electronics newsletter featuring latest hardware projects, DIY tutorials, retro computing news, and maker community updates.',
    overview: {
      content: [
        "Our Electronics newsletter covers the latest developments, projects, and insights in hardware hacking, DIY electronics, and retro computing. Each week, we curate the most important content so you don't have to spend hours searching.",
        "Whether you're a hardware engineer, maker, or electronics hobbyist, our newsletter provides valuable information to keep you informed and inspired for your next project.",
        "Subscribe now to join thousands of professionals who receive our weekly updates!"
      ]
    }
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
  title: "About Blaze",
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