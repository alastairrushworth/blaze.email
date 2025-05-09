"use client"

import { format } from 'date-fns'
import Link from "next/link"

import { NewsletterData } from '@/lib/newsletter-utils';

interface NewsletterNavigationProps {
  topic: string;
  prevNewsletter?: NewsletterData | null;
  nextNewsletter?: NewsletterData | null;
}

export function NewsletterNavigation({ topic, prevNewsletter, nextNewsletter }: NewsletterNavigationProps) {
  return (
    <div className="flex justify-end space-x-4">
      {/* Newer button (points left toward more recent newsletters) */}
      {nextNewsletter && (
        <Link 
          href={`/${topic}/archive/${format(new Date(nextNewsletter.publishedat), "yyyy-MM-dd")}`}
          className="inline-flex items-center justify-center py-2 px-4 rounded-lg bg-white dark:bg-gray-800 shadow transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          <svg 
            xmlns="https://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Newer</span>
        </Link>
      )}
      
      {/* Older button (points right toward older newsletters) */}
      {prevNewsletter && (
        <Link 
          href={`/${topic}/archive/${format(new Date(prevNewsletter.publishedat), "yyyy-MM-dd")}`}
          className="inline-flex items-center justify-center py-2 px-4 rounded-lg bg-white dark:bg-gray-800 shadow transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          <span className="text-sm font-medium">Older</span>
          <svg 
            xmlns="https://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-1.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  )
}