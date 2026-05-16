import Link from 'next/link';
import { guides, newsPosts, comparisons } from '@/lib/mockData';
import TrustBar from '@/components/TrustBar';

export default function Home() {
  const categories = [
    { name: 'Phones', slug: 'phones', icon: '📱' },
    { name: 'Laptops', slug: 'laptops', icon: '💻' },
    { name: 'TVs', slug: 'tvs', icon: '📺' },
    { name: 'Home', slug: 'home', icon: '🏠' },
    { name: 'Audio', slug: 'audio', icon: '🎧' },
    { name: 'Deals', slug: 'deals', icon: '🏷️' },
  ];

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-7xl dark:text-white leading-tight">
            Upgrade your life with <br />
            <span className="text-primary dark:text-blue-500">Expert, Data-Driven Reviews</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 sm:text-xl dark:text-gray-400">
            We purchase and lab-test every product we review. No manufacturer influence, just the facts to help you buy the best.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/guides"
              className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
            >
              See Best Picks
            </Link>
            <Link
              href="/deals"
              className="px-8 py-4 bg-accent text-accent-foreground text-lg font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Today&apos;s Top Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <TrustBar />

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Best Picks by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/guides/category/${cat.slug}`}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 group"
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="font-bold text-gray-900 dark:text-white">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Buyer's Guides */}
      <section className="bg-gray-50 dark:bg-gray-800/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Expert Buying Guides</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">In-depth research to save you time and money.</p>
            </div>
            <Link href="/guides" className="text-primary font-bold hover:underline">View all guides →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <div key={guide.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all dark:bg-gray-900">
                <div className="h-48 bg-gray-200 animate-pulse relative">
                   <div className="absolute top-4 left-4">
                     <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{guide.category}</span>
                   </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    <Link href={`/guides/${guide.slug}`} className="hover:text-primary transition-colors">
                      {guide.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 line-clamp-3">{guide.excerpt}</p>
                  <Link href={`/guides/${guide.slug}`} className="mt-6 inline-flex items-center text-primary font-bold hover:gap-2 transition-all">
                    Read the guide <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Automated Task Insights (Placeholder) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100 dark:border-gray-800">
        <div className="bg-primary text-white rounded-3xl p-8 md:p-12 overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Fully Automated Market Benchmark</h2>
            <p className="text-blue-100 text-lg max-w-2xl mb-8">
              Our backend task monitors US competitors daily. Stay updated with what&apos;s trending in the market across Wirecutter, RTINGS, and Tom&apos;s Guide.
            </p>
            <Link
              href="/admin/benchmark"
              className="inline-block bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Explore Daily Insights
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        </div>
      </section>

      {/* Latest Comparisons & News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Winning Product Comparisons */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 border-l-4 border-accent pl-4">Head-to-Head Comparisons</h2>
            <div className="space-y-6">
              {comparisons.map((comp) => (
                <div key={comp.id} className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary transition-colors dark:bg-gray-900 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary">
                    <Link href={`/comparisons/${comp.slug}`}>
                      {comp.title}
                    </Link>
                  </h3>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Winner:</span>
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Product #1</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest News */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 border-l-4 border-primary pl-4">Industry Insights</h2>
            <div className="space-y-8">
              {newsPosts.map((post) => (
                <div key={post.id} className="flex gap-6 items-start group">
                  <div className="flex-shrink-0 w-32 h-32 relative rounded-2xl overflow-hidden bg-gray-200 shadow-sm">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url(${post.imageUrl})` }}
                    ></div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{post.date}</span>
                    <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">{post.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
