import Link from 'next/link';
import { newsPosts } from '@/lib/mockData';

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Latest News</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsPosts.map((post) => (
          <article key={post.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm dark:border-gray-800">
            <div className="aspect-video relative bg-gray-200">
               <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${post.imageUrl})` }}
              ></div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">{post.date} • {post.author}</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="text-primary font-medium hover:underline">
                Read full article
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
