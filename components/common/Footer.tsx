import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/docs" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200">
              Docs
            </Link>
            <Link href="/status" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200">
              Status
            </Link>
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200">
              Terms & Conditions
            </Link>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 Auctra. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}