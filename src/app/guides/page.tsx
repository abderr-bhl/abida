import Link from 'next/link';
import { guides } from '@/lib/mockData';
import TopPickBadge from '@/components/TopPickBadge';

export default function GuidesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-16">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Expert Buyer&apos;s Guides</h1>
        <p className="text-xl text-gray-600 max-w-2xl border-l-4 border-accent pl-6">
          Rigorous testing and expert analysis to help you find the best products in the US market.
        </p>
      </div>

      <div className="space-y-12">
        {guides.map((guide) => (
          <div key={guide.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-gray-100 pb-12 last:border-0 group">
            <div className="md:col-span-4 aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative">
               {/* Mock image */}
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                  {guide.category}
               </div>
               <div className="absolute top-4 left-4">
                  <TopPickBadge />
               </div>
            </div>
            <div className="md:col-span-8">
              <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3 block">
                {guide.category}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors leading-tight">
                <Link href={`/guides/${guide.slug}`}>
                  {guide.title}
                </Link>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {guide.excerpt}
              </p>
              <div className="flex items-center gap-6 text-sm">
                <Link href={`/guides/${guide.slug}`} className="font-bold text-gray-900 border-b-2 border-primary pb-1 hover:text-primary transition-colors">
                  READ THE FULL GUIDE
                </Link>
                <span className="text-gray-400">Updated {guide.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
