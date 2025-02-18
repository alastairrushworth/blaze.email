import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-indigo-800 dark:bg-gray-900 text-white py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">blaze.email</h3>
            <p className="text-indigo-200 dark:text-indigo-300">Weekly tech insights in your inbox</p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-indigo-200 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-indigo-200 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/unsubscribe" className="hover:text-indigo-200 transition-colors">
                  Unsubscribe
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-indigo-200 transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="hover:text-indigo-200 transition-colors">
                <Twitter size={24} />
              </a>
              <a href="#" className="hover:text-indigo-200 transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="hover:text-indigo-200 transition-colors">
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-indigo-200 dark:text-indigo-300">
          <p>&copy; 2023 blaze.email. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

