"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="absolute top-4 right-2 md:right-4 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 transition-all dark:opacity-0 dark:scale-0 text-gray-800" />
      <Moon className="h-5 w-5 transition-all dark:opacity-100 dark:scale-100 opacity-0 scale-0 absolute" />
    </button>
  )
}

