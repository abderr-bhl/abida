import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-black text-white tracking-tight">
              REVIEWGUID
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Expert, independent reviews and buying advice for the US market. We test products so you don&apos;t have to.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase">Content</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/guides" className="hover:text-primary transition-colors">Buyer&apos;s Guides</Link></li>
              <li><Link href="/reviews" className="hover:text-primary transition-colors">Product Reviews</Link></li>
              <li><Link href="/comparisons" className="hover:text-primary transition-colors">Product Comparisons</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Latest News</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase">Newsletter</h3>
            <p className="mt-4 text-xs text-gray-400">The best deals and reviews, delivered weekly.</p>
            <form className="mt-4 flex">
              <input
                type="email"
                placeholder="Email address"
                className="bg-gray-800 border-none rounded-l-md px-3 py-2 text-xs focus:ring-1 focus:ring-primary w-full"
              />
              <button className="bg-primary text-white px-3 py-2 rounded-r-md text-xs font-bold hover:brightness-110">
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} REVIEWGUID USA. All rights reserved.
          </p>
          <p className="mt-4 text-[10px] text-gray-600 text-center max-w-3xl mx-auto leading-normal">
            ReviewGuid is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. Amazon, the Amazon logo, Endless, and MyHabit are trademarks of Amazon.com, Inc. or its affiliates.
          </p>
        </div>
      </div>
    </footer>
  );
}
