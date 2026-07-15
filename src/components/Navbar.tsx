import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-black text-primary tracking-tight">
                REVIEWGUID
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/guides"
                className="border-transparent text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors"
              >
                Guides
              </Link>
              <Link
                href="/blog"
                className="border-transparent text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors"
              >
                News
              </Link>
              <Link
                href="/comparisons"
                className="border-transparent text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors"
              >
                Comparisons
              </Link>
              <Link
                href="/reviews"
                className="border-transparent text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors"
              >
                Reviews
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <Link
              href="/admin/tasks"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
            >
              Admin
            </Link>
            <button className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold hover:brightness-110 transition-all shadow-sm">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
