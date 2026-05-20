import Link from 'next/link';
import { guides, newsPosts, comparisons } from '@/lib/mockData';
import TopPickBadge from '@/components/TopPickBadge';

export default function Home() {
  return (
    <div className="space-y-24 py-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl dark:text-white leading-tight">
          <span className="block">Better products for</span>
          <span className="block text-primary italic">everyday life.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 sm:text-xl md:text-2xl dark:text-gray-400 font-light">
          We spend hundreds of hours testing products so you don&apos;t have to. Honest reviews, rigorous testing, and the best deals.
        </p>
        <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
          <Link
            href="/guides"
            className="w-full flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-gray-900 hover:bg-gray-800 transition-all dark:bg-primary dark:hover:bg-blue-600"
          >
            Explore Our Guides
          </Link>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-100 pb-6 dark:border-gray-800">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">The Best of Everything</h2>
            <p className="mt-2 text-xl text-gray-500 dark:text-gray-400 font-light">Our latest recommendations, updated daily.</p>
          </div>
          <Link href="/guides" className="mt-4 md:mt-0 text-primary font-bold hover:underline text-lg">View all guides →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {guides.map((guide) => (
            <div key={guide.id} className="group flex flex-col space-y-4">
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10">
                  <TopPickBadge />
                </div>
                {/* Image placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-105 transition-transform duration-500"></div>
              </div>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{guide.category}</span>
                <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white leading-snug group-hover:text-primary transition-colors">
                  <Link href={`/guides/${guide.slug}`}>
                    {guide.title}
                  </Link>
                </h3>
                <p className="mt-3 text-gray-600 dark:text-gray-400 line-clamp-2 font-light leading-relaxed">{guide.excerpt}</p>
                <Link href={`/guides/${guide.slug}`} className="mt-4 inline-block text-sm font-bold border-b-2 border-primary pb-1">
                  Read our top picks
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Comparisons & News */}
      <section className="bg-gray-50 dark:bg-gray-800/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Winning Product Comparisons */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 tracking-tight">Head-to-Head</h2>
              <div className="space-y-8">
                {comparisons.map((comp) => (
                  <div key={comp.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                      <Link href={`/comparisons/${comp.slug}`} className="hover:text-primary transition-colors">
                        {comp.title}
                      </Link>
                    </h3>
                    <div className="flex items-center mt-4 space-x-2">
                       <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Winner:</span>
                       <span className="text-sm font-bold text-primary">{comp.winnerId === 'p1' ? 'EcoClean Robot' : 'Competitor'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest News */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 tracking-tight">What&apos;s New</h2>
              <div className="space-y-10">
                {newsPosts.map((post) => (
                  <div key={post.id} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-32 h-32 relative rounded-xl overflow-hidden bg-gray-200">
                      <div
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url(${post.imageUrl})` }}
                      ></div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide uppercase">{post.date}</p>
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
