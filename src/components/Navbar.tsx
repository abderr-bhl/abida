import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-black text-blue-600 italic tracking-tighter">
                ReviewGuid<span className="text-orange-500">.</span>
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/guides"
                className="border-transparent text-gray-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-colors"
              >
                Guides
              </Link>
              <Link
                href="/blog"
                className="border-transparent text-gray-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-colors"
              >
                News
              </Link>
              <Link
                href="/comparisons"
                className="border-transparent text-gray-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-colors"
              >
                Comparisons
              </Link>
              <Link
                href="/reviews"
                className="border-transparent text-gray-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-colors"
              >
                Reviews
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/tasks"
              className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              Admin
            </Link>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-black hover:bg-blue-700 transition-all shadow-md">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
