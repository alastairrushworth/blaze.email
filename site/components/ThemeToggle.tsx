"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Only render the toggle after component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Function to toggle theme
  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
    console.log("Theme toggled:", theme === 'dark' ? 'light' : 'dark')
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null
  
  return (
    <button
      onClick={toggleTheme}
      className="absolute top-4 right-2 md:right-4 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 z-10"
      aria-label={`Toggle theme, current theme is ${theme}`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-800" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-200" />
    </button>
  )
}

