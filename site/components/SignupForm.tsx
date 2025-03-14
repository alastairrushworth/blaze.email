"use client"

import { useState } from "react"

export function SignupForm({ topic }: { topic: string }) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formattedTopic = topic
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, topic: formattedTopic }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage(`Thank you! Your first ${topic} newsletter will arrive next week.`)
        setEmail("")
      } else {
        setMessage(data.error || "An error occurred. Please try again.")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </label>
        <div className="flex gap-4">
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-2 rounded-md border-2 border-gray-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 placeholder-gray-500 dark:placeholder-gray-400" // Further adjusted border color and width for better visibility
            placeholder="you@example.com"
          />
          <button
            type="submit"
            className="whitespace-nowrap px-5 py-2 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition duration-150 ease-in-out transform hover:scale-105"
          >
            Subscribe
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Newsletters sent once a week, unsubscribe anytime.
        </p>
        {message && (
          <p
            className={`mt-2 text-sm ${message.includes("error") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  )
}

export default SignupForm;