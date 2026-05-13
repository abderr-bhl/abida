import Link from 'next/link';
import { reviews, products } from '@/lib/mockData';

export default function ReviewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">In-Depth Product Reviews</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review) => {
          const product = products.find(p => p.id === review.productId);
          return (
            <div key={review.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded uppercase">
                    Score: {review.score}/100
                  </span>
                  <span className="text-gray-400 text-xs">{review.date}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                  <Link href={`/reviews/${review.slug}`} className="hover:text-primary transition-colors">
                    {review.title}
                  </Link>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {review.summary}
                </p>
                {product && (
                   <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between dark:border-gray-800">
                     <span className="text-sm font-semibold text-gray-900 dark:text-white">${product.price}</span>
                     <Link href={`/reviews/${review.slug}`} className="text-sm font-bold text-primary hover:underline">
                        Full Review
                     </Link>
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
