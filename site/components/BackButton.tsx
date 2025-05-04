"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  fixed?: boolean;
}

export default function BackButton({ 
  href = "/", 
  label = "Back to home",
  className,
  fixed = false
}: BackButtonProps) {
  const defaultClassName = fixed 
    ? "fixed top-2 md:top-4 left-2 md:left-4 p-1.5 md:p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700"
    : "p-2 rounded-lg bg-white dark:bg-gray-800 shadow inline-flex items-center transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700";

  return (
    <Link
      href={href}
      className={className || defaultClassName}
      aria-label={label}
    >
      <ChevronLeft className="h-4 w-4 mr-1 text-gray-800 dark:text-gray-200" />
      {!fixed && <span className="text-sm text-gray-800 dark:text-gray-200">{label}</span>}
    </Link>
  )
}

// Legacy function for backward compatibility with existing imports
export { BackButton as FixedBackButton };