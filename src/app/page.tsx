import Link from 'next/link';
import { guides, newsPosts, comparisons } from '@/lib/mockData';

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section - Wirecutter Style */}
      <section className="bg-gray-50 border-b border-gray-200 py-16 px-4 sm:px-6 lg:px-8 dark:bg-gray-900/50 dark:border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white leading-[1.1]">
            Expert reviews for the <span className="text-primary">things you use every day.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-400">
            We spent hundreds of hours testing and comparing the best products so you don&apos;t have to. Our recommendations are always independent.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/guides"
              className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-md hover:bg-blue-700 transition-colors shadow-lg"
            >
              See Our Top Picks
            </Link>
            <Link
              href="/blog"
              className="px-8 py-4 bg-white text-gray-900 border border-gray-300 text-lg font-bold rounded-md hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              Latest Research
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Featured Content (Left) */}
        <div className="lg:col-span-8 space-y-16">
          <section>
            <div className="flex justify-between items-baseline mb-8 border-b-2 border-gray-900 pb-2 dark:border-white">
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Featured Guides</h2>
              <Link href="/guides" className="text-sm font-bold text-primary hover:underline">See All →</Link>
            </div>
            <div className="space-y-12">
              {guides.map((guide) => (
                <div key={guide.id} className="group grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden dark:bg-gray-800">
                    <img
                       src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&auto=format&fit=crop&q=60"
                       alt={guide.title}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{guide.category}</span>
                    <h3 className="mt-2 text-2xl font-bold leading-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      <Link href={`/guides/${guide.slug}`}>
                        {guide.title}
                      </Link>
                    </h3>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 line-clamp-3">
                      {guide.excerpt}
                    </p>
                    <Link href={`/guides/${guide.slug}`} className="mt-4 inline-flex items-center text-sm font-black text-primary group-hover:translate-x-1 transition-transform">
                      Read The Full Guide <span className="ml-1">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
             <div className="flex justify-between items-baseline mb-8 border-b-2 border-gray-900 pb-2 dark:border-white">
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Winning Comparisons</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {comparisons.map((comp) => (
                  <div key={comp.id} className="bg-white p-6 border border-gray-200 rounded-lg hover:border-primary transition-colors dark:bg-gray-950 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      <Link href={`/comparisons/${comp.slug}`} className="hover:text-primary">
                        {comp.title}
                      </Link>
                    </h3>
                    <div className="mt-4 flex items-center justify-between">
                       <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">Winner Picked</span>
                       <span className="text-xs font-bold text-green-600">✓ In-Depth Test</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>

        {/* Sidebar News (Right) */}
        <aside className="lg:col-span-4 space-y-10">
          <div className="sticky top-24">
            <div className="bg-gray-900 text-white p-8 rounded-xl dark:bg-primary">
               <h3 className="text-2xl font-black leading-tight">Join 50,000+ smart shoppers.</h3>
               <p className="mt-4 text-gray-300 dark:text-blue-100">Get our best deals and buying advice delivered weekly.</p>
               <input
                 type="email"
                 placeholder="your@email.com"
                 className="mt-6 w-full px-4 py-3 bg-white text-gray-900 rounded-md font-medium"
               />
               <button className="mt-4 w-full py-3 bg-accent text-accent-foreground font-black rounded-md hover:opacity-90 transition-opacity">
                 SUBSCRIBE
               </button>
            </div>

            <div className="mt-12">
               <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-6 border-b-2 border-gray-900 pb-2 dark:text-white dark:border-white">
                 Latest News
               </h2>
               <div className="space-y-8">
                  {newsPosts.map((post) => (
                    <div key={post.id} className="group">
                      <h3 className="text-md font-bold text-gray-900 leading-tight dark:text-white group-hover:text-primary transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 font-medium">{post.date}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
