import Link from 'next/link';

export default function Navbar() {
  const links = [
    { name: 'Best Picks', href: '/guides' },
    { name: 'Deals', href: '/deals' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'News', href: '/blog' },
    { name: 'Benchmark', href: '/admin/benchmark' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-black text-primary flex items-center gap-2">
              <span className="bg-primary text-white p-1 rounded">RG</span>
              <span className="hidden sm:inline">ReviewGuid</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white px-1 pt-1 text-sm font-bold transition-colors uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest">
              Search
            </button>
            <button className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-gray-800 transition-all shadow-md active:scale-95 uppercase tracking-widest">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
