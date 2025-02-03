import Link from "next/link"

interface Article {
  id: number
  title: string
  summary: string
  date: string
}

const generatePlaceholderArticles = (topic: string): Article[] => {
  const currentDate = new Date()
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - i * 7) // Weekly articles
    return {
      id: i + 1,
      title: `This Week in ${topic}: ${getWeeklyTitle(i)}`,
      summary: `Your weekly digest of ${topic} developments, featuring the most important updates, trends, and insights from the past week.`,
      date: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    }
  })
}

const getWeeklyTitle = (index: number): string => {
  const titles = [
    "Latest Breakthroughs and Updates",
    "Industry Trends and Analysis",
    "Innovation Spotlight",
    "Expert Insights and Predictions",
    "Community Highlights and Resources",
  ]
  return titles[index]
}

export function ArticleList({ topic }: { topic: string }) {
  const articles = generatePlaceholderArticles(topic)

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6 text-indigo-800 dark:text-indigo-200">Previous Weekly Newsletters</h2>
      <div className="space-y-8">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg"
          >
            <div className="text-sm text-indigo-500 dark:text-indigo-400 mb-2">{article.date}</div>
            <h3 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-300">
              <Link href={`/${topic}/article/${article.id}`} className="hover:underline">
                {article.title}
              </Link>
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{article.summary}</p>
            <Link
              href={`/${topic}/article/${article.id}`}
              className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium transition duration-150 ease-in-out inline-flex items-center"
            >
              Read full newsletter
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

