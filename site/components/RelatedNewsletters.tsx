"use client"

import Link from "next/link"
import { newsletters, formatTopicPath } from "@/app/siteConfig"

interface RelatedNewslettersProps {
  currentTopic: string;
  limit?: number;
}

export function RelatedNewsletters({ currentTopic, limit = 3 }: RelatedNewslettersProps) {
  // Get related newsletters from siteConfig or fallback to random selection
  let relatedNewsletters: [string, any][] = [];
  
  const currentTopicDetails = newsletters[currentTopic];
  
  if (currentTopicDetails?.related && currentTopicDetails.related.length > 0) {
    // Use the predefined related newsletters
    relatedNewsletters = currentTopicDetails.related
      .map(topic => [topic, newsletters[topic]])
      .filter(([_, details]) => details) // Filter out any invalid topics
      .slice(0, limit);
  } else {
    // Fallback to random selection if no related newsletters are defined
    relatedNewsletters = Object.entries(newsletters)
      .filter(([topic]) => topic !== currentTopic)
      .slice(0, limit);
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-6 text-indigo-700 dark:text-indigo-300">
        You may also like
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedNewsletters.map(([topic, details]) => (
          <Link
            key={topic}
            href={`/${formatTopicPath(topic)}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300 relative cursor-pointer"
          >
            <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-300 mb-2">
              <span role="img" aria-label={`${topic} icon`}>{details.emoji}</span> {topic}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{details.about}</p>

            {/* Vertically centered arrow on right */}
            <svg
              xmlns="https://www.w3.org/2000/svg"
              className="h-4 w-4 text-indigo-400 dark:text-indigo-500 absolute top-1/2 -translate-y-1/2 right-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  )
}