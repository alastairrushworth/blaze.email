"use client"

import { useState, useEffect } from "react"
import { SignupForm } from "./SignupForm"
import { X } from "lucide-react"

interface SubscriptionPopupProps {
  topic: string
}

export function SubscriptionPopup({ topic }: SubscriptionPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  
  useEffect(() => {
    // Check if user has previously dismissed the popup
    const hasUserDismissed = localStorage.getItem(`popup_dismissed_${topic}`)
    if (hasUserDismissed) {
      setIsDismissed(true)
      return
    }

    // Function to check scroll position
    const handleScroll = () => {
      // Show popup when user scrolls 70% down the page
      const scrollPosition = window.scrollY + window.innerHeight
      const pageHeight = document.documentElement.scrollHeight
      const scrollThreshold = pageHeight * 0.7
      
      if (scrollPosition > scrollThreshold && !isVisible && !isDismissed) {
        setIsVisible(true)
      }
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll)
    
    // Check immediately in case user has already scrolled
    handleScroll()

    // Clean up
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isVisible, isDismissed, topic])

  const closePopup = () => {
    setIsVisible(false)
    // Remember user dismissed the popup for this session
    localStorage.setItem(`popup_dismissed_${topic}`, "true")
    setIsDismissed(true)
  }

  // Don't render anything if not visible
  if (!isVisible) return null

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn" 
        onClick={closePopup}
        aria-hidden="true"
      />
      
      {/* Centered popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 sm:px-0 animate-slideUp">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="relative p-6 sm:p-8">
            <button 
              onClick={closePopup}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close popup"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
            
            <div className="flex flex-col items-center pt-2">
              <h3 className="text-xl sm:text-2xl font-medium text-indigo-600 dark:text-indigo-300 mb-3 text-center">
                Subscribe to {topic} Newsletter
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 text-center">
                Get the latest {topic} insights delivered to your inbox every week
              </p>
              <div className="w-full">
                <SignupForm 
                  topic={topic} 
                  compact={false} 
                  onSuccess={closePopup}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SubscriptionPopup