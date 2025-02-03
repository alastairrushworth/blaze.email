import ReactMarkdown from "react-markdown"

interface Newsletter {
  id: number
  topic: string
  content: string
  publishedAt: string
}

const placeholderNewsletter: Newsletter = {
  id: 1,
  topic: "placeholder",
  content: `
# This Week in Tech: Latest Breakthroughs and Updates

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.

## Key Highlights

1. **Innovation in AI**: Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.

2. **Advancements in Quantum Computing**: Mauris iaculis porttitor posuere. Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue.

3. **Cybersecurity Trends**: Fusce convallis, mauris imperdiet gravida bibendum, nisl turpis suscipit mauris, sed placerat ipsum urna sed risus. In convallis tellus a mauris.

## What to Watch

Curabitur lacinia pulvinar nibh. Nam a sapien in turpis pulvinar efficitur quis hendrerit sem. Sed molestie, nulla quis elementum dapibus, mauris elit elementum enim, eget rhoncus eros sapien a enim.

Stay tuned for more updates in our next newsletter!
  `,
  publishedAt: new Date().toISOString(),
}

export function LatestNewsletter({ newsletter = placeholderNewsletter }: { newsletter?: Newsletter | null }) {
  if (!newsletter) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <p className="text-gray-600 dark:text-gray-300">
          No newsletter available yet. Subscribe to be the first to receive it!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-semibold mb-4 text-indigo-800 dark:text-indigo-200">Latest Newsletter</h2>
      <p className="text-sm text-indigo-500 dark:text-indigo-400 mb-4">
        Published on {new Date(newsletter.publishedAt).toLocaleDateString()}
      </p>
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown>{newsletter.content}</ReactMarkdown>
      </div>
    </div>
  )
}

