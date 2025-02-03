"use client"

import { useState } from "react"

export function SignupForm({ topic }: { topic: string }) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, topic }),
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
      >
        Subscribe to weekly {topic} newsletter
      </button>
      {message && (
        <p
          className={`mt-2 text-sm ${message.includes("error") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
        >
          {message}
        </p>
      )}
    </form>
  )
}

