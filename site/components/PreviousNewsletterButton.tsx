"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface PreviousNewsletterButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export default function PreviousNewsletterButton({ 
  href, 
  label = "Previous newsletter",
  className,
}: PreviousNewsletterButtonProps) {
  const defaultClassName = "inline-flex items-center justify-center py-2 px-4 rounded-lg bg-white dark:bg-gray-800 shadow transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200";

  return (
    <Link
      href={href}
      className={className || defaultClassName}
      aria-label={label}
    >
      <ChevronLeft className="h-4 w-4 mr-1.5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}