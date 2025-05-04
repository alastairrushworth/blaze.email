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
    <form onSubmit={handleSubmit} className={compact ? "w-full" : "max-w-xl mx-auto"}>
      <div className="flex flex-col">
        <div className="flex w-full overflow-hidden rounded-md border border-gray-300 dark:border-gray-600 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 h-12 px-4 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-0 focus:outline-none focus:ring-0 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="you@example.com"
          />
          <button
            type="submit"
            disabled={isSubscribed}
            className={`h-12 px-6 whitespace-nowrap border-0 text-base font-medium text-white ${isSubscribed 
              ? "bg-green-600 dark:bg-green-500 cursor-default" 
              : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"}`}
          >
            {isSubscribed ? "Subscribed ✓" : "Subscribe"}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Newsletters sent once a week, unsubscribe anytime.
        </p>
        
        {message && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
            {message}
          </p>
        )}
      </div>
    </form>
  )
}

export default SignupForm;