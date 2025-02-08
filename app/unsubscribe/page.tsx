"use client"

import { useState } from "react"
import Link from "next/link"
import { topics } from "../page"

export default function UnsubscribePage() {
  const [email, setEmail] = useState("")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [message, setMessage] = useState("")

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]))
  }

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setMessage("Please enter your email address.")
      return
    }
    if (selectedTopics.length === 0) {
      setMessage("Please select at least one newsletter to unsubscribe from.")
      return
    }
    try {
      // This is a placeholder for the actual API call
      // const response = await fetch('/api/unsubscribe', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email, topics: selectedTopics }),
      // })
      // const data = await response.json()
      // if (response.ok) {
      //   setMessage('You have been unsubscribed from the selected newsletters.')
      //   setEmail('')
      //   setSelectedTopics([])
      // } else {
      //   setMessage(data.error || 'An error occurred. Please try again.')
      // }

      // Placeholder success message
      setMessage(`You have been unsubscribed from the selected newsletters: ${selectedTopics.join(", ")}`)
      setEmail("")
      setSelectedTopics([])
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    }
  }

  return (
    <div className="py-16">
      <h1 className="text-5xl font-bold mb-8 text-center text-indigo-800 dark:text-indigo-200">Unsubscribe</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <form onSubmit={handleUnsubscribe} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select the newsletters you want to unsubscribe from:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topics.map((topic) => (
                <label key={topic} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={() => handleTopicToggle(topic)}
                    className="form-checkbox h-5 w-5 text-indigo-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{topic}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedTopics.length === topics.length}
              onChange={() => setSelectedTopics(selectedTopics.length === topics.length ? [] : [...topics])}
              className="form-checkbox h-5 w-5 text-indigo-600 mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">Unsubscribe from all newsletters</span>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Unsubscribe
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-sm text-center ${message.includes("error") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
          >
            {message}
          </p>
        )}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

