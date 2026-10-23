import Link from 'next/link';
import { comparisons } from '@/lib/mockData';

export default function ComparisonsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Winning Product Comparisons</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Head-to-head battles to find the absolute best.</p>
      </div>

      <div className="space-y-8">
        {comparisons.map((comp) => (
          <div key={comp.id} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm dark:bg-gray-900 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex-grow">
              <span className="text-sm font-bold text-primary uppercase tracking-widest mb-2 block">Versus Battle</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{comp.title}</h2>
              <div className="flex flex-wrap gap-2">
                 {comp.criteria.map((c: string, i: number) => (
                   <span key={i} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full dark:bg-gray-800 dark:text-gray-400">
                     {c}
                   </span>
                 ))}
              </div>
            </div>
            <div className="flex-shrink-0">
               <Link
                href={`/comparisons/${comp.slug}`}
                className="inline-block bg-primary text-white font-bold py-3 px-10 rounded-xl hover:bg-blue-700 transition-colors"
               >
                 View Battle
               </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
