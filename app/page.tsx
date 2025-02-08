import Link from "next/link"
import { newsletters } from "./newsletters"


export default function Home() {
  return (
    <div className="py-16">
      <h1 className="text-5xl font-bold mb-4 text-center text-indigo-800 dark:text-indigo-200">blaze.email</h1>
      <p className="text-xl text-center text-indigo-600 dark:text-indigo-300 mb-4">Your weekly dose of tech insights</p>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
        Curated newsletters delivered every week, helping you stay ahead in tech
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsletters.map((topic) => (
          <Link
            key={topic}
            href={`/${topic.replace(/\s+/g, '-')}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            <h2 className="text-2xl font-semibold capitalize text-indigo-600 dark:text-indigo-300 mb-2">{topic.replace(/-/g, ' ')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Weekly updates on {topic.replace(/-/g, ' ')}</p>
            <div className="text-indigo-500 dark:text-indigo-400 font-medium flex items-center">
              Subscribe now
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
