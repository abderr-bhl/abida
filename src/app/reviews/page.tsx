import Link from 'next/link';
import { reviews, products } from '@/lib/mockData';

export default function ReviewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Product Reviews</h1>
          <p className="text-gray-500 mt-2 text-lg italic">Honest. Unbiased. Performance-driven.</p>
        </div>
        <div className="flex gap-4">
           {/* Simple filter tabs mock */}
           <span className="text-sm font-bold text-primary border-b-2 border-primary cursor-default">ALL REVIEWS</span>
           <span className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors cursor-pointer uppercase">Electronics</span>
           <span className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors cursor-pointer uppercase">Home</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {reviews.map((review) => {
          const product = products.find(p => p.id === review.productId);
          return (
            <div key={review.id} className="group relative flex flex-col">
              <div className="aspect-video bg-gray-100 rounded-lg mb-6 overflow-hidden relative">
                 <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-bold text-2xl uppercase tracking-tighter opacity-20">
                    TESTED
                 </div>
                 <div className="absolute top-4 right-4 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                    {review.score}/100
                 </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                <Link href={`/reviews/${review.slug}`} className="after:absolute after:inset-0">
                  {review.title}
                </Link>
              </h2>

              <p className="text-gray-600 mb-6 flex-grow line-clamp-3 leading-relaxed">
                {review.summary}
              </p>

              {product && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MSRP</span>
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                   </div>
                   <div className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform">
                      VIEW REVIEW →
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
