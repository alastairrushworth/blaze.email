export function Footer() {
  return (
    <footer className="border-t border-gray-300 mt-20 py-8">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-gray-600">
          <div className="mb-4 md:mb-0">
            <p>© {new Date().getFullYear()} blaze.email</p>
            <p className="text-xs text-gray-500 mt-1">Weekly technology news digests</p>
          </div>
          <div className="flex space-x-6">
            <a
              href="https://mastodon.social/@blazeemail"
              className="hover:text-gray-900 transition-colors"
              aria-label="Mastodon"
            >
              Mastodon
            </a>
            <a
              href="https://www.linkedin.com/company/96246606"
              className="hover:text-gray-900 transition-colors"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}