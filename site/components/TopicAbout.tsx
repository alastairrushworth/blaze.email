"use client"

import { Newsletter } from "@/app/siteConfig"

interface TopicAboutProps {
  topicDetails?: Newsletter;
  normalizedTopic: string;
  aboutText: string;
}

export function TopicAbout({ topicDetails, normalizedTopic, aboutText }: TopicAboutProps) {
  return (
    <section className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300">
        About {topicDetails?.title || normalizedTopic}
      </h2>
      <div className="max-w-none">
        {topicDetails?.overview?.content?.map((paragraph, index) => (
          <p key={index} className={`${index < topicDetails.overview.content.length - 1 ? 'mb-4' : ''} text-gray-800 dark:text-gray-200`}>
            {paragraph}
          </p>
        )) || (
          // Fallback content if overview is not defined
          <>
            <p className="mb-4 text-gray-800 dark:text-gray-200">
              Our {topicDetails?.title || normalizedTopic} newsletter covers the latest developments, trends, tools, and insights in {aboutText.toLowerCase()}.
              Each week, we curate the most important content so you don't have to spend hours searching.
            </p>
            <p className="mb-4 text-gray-800 dark:text-gray-200">
              Whether you're a beginner or expert in {(topicDetails?.title || normalizedTopic).toLowerCase()}, our newsletter provides valuable information
              to keep you informed and ahead of the curve in this rapidly evolving field.
            </p>
            <p className="text-gray-800 dark:text-gray-200">
              Subscribe now to join thousands of professionals who receive our weekly updates!
            </p>
          </>
        )}
      </div>
    </section>
  )
}