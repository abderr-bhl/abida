import { reviews, products } from '@/lib/mockData';
import { notFound } from 'next/navigation';
import AffiliateDisclosure from '@/components/AffiliateDisclosure';
import AmazonButton from '@/components/AmazonButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ReviewDetailPage({ params }: Props) {
  const { slug } = await params;
  const review = reviews.find(r => r.slug === slug);

  if (!review) {
    notFound();
  }

  const product = products.find(p => p.id === review.productId);

  if (!product) {
     notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="flex-grow">
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{review.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
               <span>{review.date}</span>
               <span>•</span>
               <span>By {review.author}</span>
            </div>
          </header>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="lead text-xl text-gray-600 dark:text-gray-300">{review.summary}</p>
            <div className="mt-8">
               {review.content}
               <p className="mt-4">
                 Our team spent hours testing the {product.name} to see if it lives up to the hype.
                 From the initial unboxing to long-term performance, we&apos;ve covered it all.
               </p>
            </div>
          </div>
        </div>

        <aside className="w-full md:w-80 flex-shrink-0 sticky top-8">
           <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-white mb-6">
                 <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${product.imageUrl})` }}
                ></div>
              </div>
              <div className="text-center mb-6">
                 <div className="text-5xl font-black text-primary mb-1">{review.score}</div>
                 <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Review Score</div>
              </div>
              <div className="space-y-4 mb-8">
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="font-bold text-gray-900 dark:text-white">${product.price}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rating</span>
                    <span className="font-bold text-gray-900 dark:text-white">{product.rating} / 5</span>
                 </div>
              </div>
              <AmazonButton url={product.amazonUrl} className="w-full" />
           </div>
        </aside>
      </div>

      <AffiliateDisclosure />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-green-50 p-8 rounded-2xl dark:bg-green-900/20">
            <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-4">What We Loved</h3>
            <ul className="space-y-3">
               {product.pros.map((pro, i) => (
                 <li key={i} className="flex items-start gap-3 text-green-700 dark:text-green-300">
                    <span className="mt-1">✓</span>
                    <span>{pro}</span>
                 </li>
               ))}
            </ul>
         </div>
         <div className="bg-red-50 p-8 rounded-2xl dark:bg-red-900/20">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-4">What Could Be Better</h3>
            <ul className="space-y-3">
               {product.cons.map((con, i) => (
                 <li key={i} className="flex items-start gap-3 text-red-700 dark:text-red-300">
                    <span className="mt-1">✗</span>
                    <span>{con}</span>
                 </li>
               ))}
            </ul>
         </div>
      </div>
    </div>
  );
}
