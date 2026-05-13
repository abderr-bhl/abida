import Link from 'next/link';
import { guides } from '@/lib/mockData';

export default function GuidesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Expert Buying Guides</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Everything you need to know before you buy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {guides.map((guide) => (
          <div key={guide.id} className="flex flex-col md:flex-row border border-gray-200 rounded-xl overflow-hidden shadow-sm dark:border-gray-800">
            <div className="md:w-1/3 bg-primary/10 flex items-center justify-center p-8">
              <span className="text-primary font-bold text-lg uppercase tracking-widest vertical-rl rotate-180">
                {guide.category}
              </span>
            </div>
            <div className="p-8 md:w-2/3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                <Link href={`/guides/${guide.slug}`} className="hover:text-primary">
                  {guide.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{guide.excerpt}</p>
              <Link href={`/guides/${guide.slug}`} className="inline-flex items-center text-primary font-semibold hover:underline">
                View Guide <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
