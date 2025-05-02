import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { format, parseISO } from 'date-fns';

interface Newsletter {
  content: string;
  publishedat: string;
}

interface Section {
  title: string;
  content: string;
}

export function LatestNewsletter({ newsletter }: { newsletter?: Newsletter | null }) {
  if (!newsletter) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-6 md:p-8">
        <p className="text-gray-600 dark:text-gray-300">
          No newsletter available yet. Subscribe to be the first to receive it!
        </p>
      </div>
    );
  }
  
  // For debugging
  console.log("Newsletter data:", newsletter);

  // Split content into sections based on ## headers
  const splitSections = (content: string): Section[] => {
    const sections = content.split(/(?=## )/);
    return sections.map(section => {
      const lines = section.trim().split('\n');
      const title = lines[0].startsWith('## ')
        ? lines[0].replace('## ', '').trim()
        : 'Introduction';
      const content = lines[0].startsWith('## ')
        ? lines.slice(1).join('\n')
        : lines.join('\n');
      return { title, content: content.trim() };
    });
  };

  const sections = splitSections(newsletter.content);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-6 md:p-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-indigo-700 dark:text-indigo-300">
            {section.title}
          </h2>
          <div className="prose dark:prose-invert max-w-none prose-base sm:prose-lg prose-indigo">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                // Remove h2 from markdown rendering since we're handling it separately
                h2: () => null,
                // Enhance link styling
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                // Enhance paragraph styling
                p: ({ node, ...props }) => (
                  <p {...props} className="mb-4 text-gray-900 dark:text-gray-300" />
                ),
                // Enhance list item styling
                li: ({ node, ...props }) => (
                  <li {...props} className="text-gray-900 dark:text-gray-300 list-disc ml-5" /> // Ensure bullet points are visible
                )
              }}
            >
              {section.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LatestNewsletter;