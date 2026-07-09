import Link from 'next/link';
import { guides, newsPosts, comparisons } from '@/lib/mockData';
import { ArrowRight, ChevronRight, Star } from 'lucide-react';
import TopPickBadge from '@/components/TopPickBadge';

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative bg-blue-600 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl">
            Winning Choices <br/>
            <span className="text-blue-100 italic">For Your Home & Life</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-blue-100 sm:text-xl md:mt-8">
            Expert, independent reviews and buyer&apos;s guides to help you find the best products on the US market. No fluff, just the facts.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              href="/guides"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full text-lg font-black transition-all shadow-xl hover:shadow-2xl flex items-center gap-2"
            >
              Browse All Guides <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 italic">The Best Guides</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400">Rigorously tested recommendations.</p>
          </div>
          <Link href="/guides" className="group flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors">
            See everything <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {guides.map((guide, idx) => (
            <div key={guide.id} className="card-guide group">
              <div className="h-48 bg-gray-100 dark:bg-gray-800 relative">
                 {/* Mock image placeholder with category */}
                 <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-700 font-black text-4xl uppercase tracking-tighter opacity-50">
                   {guide.category}
                 </div>
                 {idx === 0 && (
                   <div className="absolute top-4 left-4">
                     <TopPickBadge />
                   </div>
                 )}
              </div>
              <div className="p-8">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest block mb-3">{guide.category}</span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                  <Link href={`/guides/${guide.slug}`}>
                    {guide.title}
                  </Link>
                </h3>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 leading-relaxed italic">
                  &ldquo;{guide.excerpt}&rdquo;
                </p>
                <Link href={`/guides/${guide.slug}`} className="text-sm font-black text-gray-900 dark:text-white border-b-2 border-blue-600 pb-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                  Read Full Guide
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparisons Grid */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-24 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 italic uppercase tracking-tighter">Versus Battles</h2>
             <p className="text-xl text-gray-500 max-w-2xl mx-auto">Head-to-head comparisons to declare the ultimate winner in every category.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {comparisons.map((comp) => (
              <Link key={comp.id} href={`/comparisons/${comp.slug}`} className="bg-white dark:bg-gray-900 p-1 rounded-2xl shadow-sm hover:shadow-xl transition-all group overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row h-full">
                  <div className="sm:w-1/3 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center p-8">
                    <div className="text-4xl font-black text-blue-600 italic">VS</div>
                  </div>
                  <div className="p-8 flex-1">
                    <div className="flex items-center gap-1 text-orange-500 mb-2">
                       {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                      {comp.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {comp.criteria.slice(0, 3).map(c => (
                        <span key={c} className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-900 rounded-3xl p-12 lg:p-20 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
             <div className="w-96 h-96 border-[40px] border-white rounded-full"></div>
          </div>
          <div className="max-w-2xl relative z-10">
            <h2 className="text-3xl font-black text-white mb-6">Stay Ahead of the Curve</h2>
            <p className="text-blue-100 text-lg mb-10 italic">
              Subscribe to our newsletter to get latest product reviews, deals, and buying advice delivered straight to your inbox. No spam, ever.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/50 font-medium"
                required
              />
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-black transition-all shadow-lg hover:shadow-orange-500/30">
                Join Now
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
