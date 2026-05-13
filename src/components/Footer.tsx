import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Products</h3>
            <ul className="mt-4 space-y-4">
              <li><Link href="/guides" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Guides</Link></li>
              <li><Link href="/reviews" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Reviews</Link></li>
              <li><Link href="/comparisons" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Comparisons</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">About</a></li>
              <li><Link href="/blog" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Blog</Link></li>
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Privacy</a></li>
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Terms</a></li>
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Affiliate Disclosure</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Follow Us</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Twitter</a></li>
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Facebook</a></li>
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} ReviewGuid. All rights reserved.
          </p>
          <p className="mt-4 text-sm text-gray-400 xl:text-center">
            ReviewGuid is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
          </p>
        </div>
      </div>
    </footer>
  );
}
