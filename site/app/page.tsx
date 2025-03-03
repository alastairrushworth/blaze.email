import Link from "next/link"
import { newsletters } from "./newsletters"
import Image from "next/image"
import logo from "@/public/logo.png" // Adjust the path to your logo image

export default function Home() {
  return (
    <>
      <div className="py-16">
        <div className="flex justify-center items-center mb-4">
          <Image src={logo} alt="Logo" width={55} height={55} className="mr-2" />
          <h1 className="text-5xl font-bold text-indigo-800 dark:text-indigo-200">blaze.email</h1>
        </div>
        <p className="text-xl text-center text-indigo-600 dark:text-indigo-300 mb-4">Weekly digests collating the best blogs and tech insights</p>
        <br></br><br></br>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(newsletters).map(([topic, details]) => (
            <Link
              key={topic}
              href={`/${topic.replace(/\s+/g, '-')}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
                {details.emoji} {topic}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{details.about}</p>
              <div className="text-indigo-500 dark:text-indigo-400 font-medium flex items-center">
                Go to newsletter
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
    </>
  )
}