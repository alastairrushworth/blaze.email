"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export function BackButton() {
  return (
    <Link
      href="/"
      className="fixed top-2 md:top-4 left-2 md:left-4 p-1.5 md:p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700"
      aria-label="Back to home"
    >
      <ChevronLeft className="h-5 w-5 text-gray-800 dark:text-gray-200" />
    </Link>
  )
}