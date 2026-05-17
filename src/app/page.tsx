import Link from 'next/link';
import { guides, newsPosts, comparisons } from '@/lib/mockData';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Editorial Hero */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">
            Winning Choices for Your <span className="text-accent">USA Lifestyle</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            In-depth testing and unbiased reviews for the gear and gadgets that matter to you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/guides"
              className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-md font-bold transition-all"
            >
              Expert Buyer&apos;s Guides
            </Link>
            <Link
              href="/reviews"
              className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-md font-bold transition-all"
            >
              Latest Reviews
            </Link>
          </div>
        </div>
      </section>

      {/* Top Picks Section - Inspired by Wirecutter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 pb-4 mb-8 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured Picks</h2>
          <Link href="/guides" className="text-sm font-semibold text-primary hover:underline uppercase tracking-wider">
            View All Guides
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {guides.slice(0, 2).map((guide) => (
            <div key={guide.id} className="flex flex-col md:flex-row gap-6 group">
              <div className="w-full md:w-1/2 aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                {/* Mock image placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-lg">
                  {guide.category}
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">{guide.category}</span>
                <h3 className="mt-2 text-2xl font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">
                  <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                </h3>
                <p className="mt-4 text-gray-600 leading-relaxed">{guide.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparisons & News - RTINGS style grid */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-4 mb-8 uppercase tracking-widest">
                Winning Comparisons
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {comparisons.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/comparisons/${comp.slug}`}
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{comp.title}</h3>
                    <p className="text-sm text-gray-500">Criteria: {comp.criteria.slice(0, 2).join(' & ')}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-widest text-center">
                Latest Tech News
              </h2>
              <div className="space-y-8">
                {newsPosts.map((post) => (
                  <div key={post.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <h3 className="text-md font-bold text-gray-900 leading-snug hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">{post.date}</p>
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
