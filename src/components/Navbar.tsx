import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-primary">
                Review<span className="text-gray-900 dark:text-white">Guid</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded">
                USA Lab
              </span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
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
          <div className="flex items-center gap-4">
            <Link
              href="/admin/tasks"
              className="text-xs font-semibold text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              Admin
            </Link>
            <button className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
