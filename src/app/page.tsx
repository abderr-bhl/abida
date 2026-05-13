import Link from 'next/link';
import { guides, newsPosts, comparisons } from '@/lib/mockData';

export default function Home() {
  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white">
          <span className="block">Your Trusted Guide for</span>
          <span className="block text-primary">Smart Purchases in USA</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl dark:text-gray-400">
          We review, compare, and guide you through the best products on Amazon and beyond. Make winning choices for your needs.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <Link
              href="/guides"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Read Our Guides
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Buyer&apos;s Guides</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Expert advice on choosing the right products.</p>
          </div>
          <Link href="/guides" className="text-primary font-semibold hover:underline">View all guides →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <div key={guide.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:border-gray-800">
              <div className="p-6">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{guide.category}</span>
                <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                  <Link href={`/guides/${guide.slug}`} className="hover:text-primary transition-colors">
                    {guide.title}
                  </Link>
                </h3>
                <p className="mt-3 text-gray-600 dark:text-gray-400">{guide.excerpt}</p>
                <Link href={`/guides/${guide.slug}`} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                  Read more
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Comparisons & News */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Winning Product Comparisons */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Winning Comparisons</h2>
              <div className="space-y-6">
                {comparisons.map((comp) => (
                  <div key={comp.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      <Link href={`/comparisons/${comp.slug}`} className="hover:text-primary">
                        {comp.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Comparing {comp.criteria.slice(0, 3).join(', ')}...</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest News */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Latest News</h2>
              <div className="space-y-6">
                {newsPosts.map((post) => (
                  <div key={post.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-24 h-24 relative rounded-md overflow-hidden bg-gray-200">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${post.imageUrl})` }}
                      ></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{post.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
