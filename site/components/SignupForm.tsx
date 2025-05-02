"use client"

import { useState } from "react"

export function SignupForm({ 
  topic, 
  compact = false, 
  onSuccess
}: { 
  topic: string, 
  compact?: boolean,
  onSuccess?: () => void
}) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

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
        setIsSubscribed(true)
        setEmail("")
        // Call onSuccess callback if provided
        if (onSuccess) {
          // Wait a moment for the user to see the success state
          setTimeout(() => {
            onSuccess()
          }, 2000)
        } else {
          // The success state will remain visible (we won't reset it)
          // This way the user always sees the "Subscribed ✓" confirmation
        }
      } else {
        setMessage(data.error || "An error occurred. Please try again.")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "w-full" : ""}>
      <div className={compact ? "flex items-center space-x-2" : "space-y-2"}>
        {!compact && (
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          </label>
        )}
        <div className={`flex ${compact ? "w-full flex-1 gap-3" : "gap-4"}`}>
          <div className="flex-1 flex flex-col">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`${compact ? "h-10" : "h-11"} w-full px-4 text-base rounded-md border-2 border-gray-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 placeholder-gray-500 dark:placeholder-gray-400`}
              placeholder="you@example.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
              Newsletters sent once a week, unsubscribe anytime.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubscribed}
            className={`whitespace-nowrap ${compact ? "h-10 self-start px-5" : "h-11 px-6"} min-w-[100px] border border-transparent rounded-md shadow-md text-base font-medium text-white ${isSubscribed 
              ? "bg-green-600 dark:bg-green-500 cursor-default" 
              : "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition duration-150 ease-in-out transform hover:scale-105"}`}
          >
            {isSubscribed ? "Subscribed ✓" : "Subscribe"}
          </button>
        </div>
        {message && (
          <p className={`${compact ? "ml-2 text-xs" : "mt-2 text-sm"} text-red-600 dark:text-red-400`}>
            {message}
          </p>
        )}
      </div>
    </form>
  )
}

export default SignupForm;