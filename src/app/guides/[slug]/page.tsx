import { guides, products } from '@/lib/mockData';
import { notFound } from 'next/navigation';
import AffiliateDisclosure from '@/components/AffiliateDisclosure';
import AmazonButton from '@/components/AmazonButton';
import TopPickBadge from '@/components/TopPickBadge';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = guides.find(g => g.slug === slug);

  if (!guide) {
    notFound();
  }

  const recommendedProducts = products.filter(p => guide.recommendedProducts.includes(p.id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 border-b border-gray-200 pb-8 dark:border-gray-800">
        <span className="text-primary font-semibold uppercase tracking-wider text-sm">{guide.category}</span>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4">{guide.title}</h1>
        <p className="text-gray-500">{guide.date} • By {guide.author}</p>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-8 italic">
          &quot;{guide.excerpt}&quot;
        </p>
        <div className="text-gray-800 dark:text-gray-200">
          {guide.content}
          <p className="mt-4">
            Choosing the right product requires understanding your specific needs. In this guide, we break down the key factors to consider.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">Key Considerations</h2>
          <ul>
            <li>Performance and reliability</li>
            <li>Value for money</li>
            <li>Ease of use and setup</li>
            <li>Long-term durability</li>
          </ul>
        </div>
      </div>

      <section className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Top Recommendations</h2>
        <div className="space-y-8">
          {recommendedProducts.map((product, index) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center relative border border-gray-100 dark:border-gray-700">
              <div className="w-full md:w-48 h-48 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${product.imageUrl})` }}
                ></div>
              </div>
              <div className="flex-grow">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</h3>
                  {index === 0 && <TopPickBadge label="Top Pick" />}
                </div>
                <div className="flex items-center mb-4">
                   <span className="text-yellow-400 mr-1">★</span>
                   <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{product.rating} / 5.0</span>
                   <span className="mx-2 text-gray-300">|</span>
                   <span className="text-sm font-bold text-primary">${product.price}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-green-600 mb-1 uppercase tracking-tighter">Pros</h4>
                    <ul className="text-sm space-y-1">
                      {product.pros.map((pro, i) => <li key={i} className="text-gray-600 dark:text-gray-400">• {pro}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-600 mb-1 uppercase tracking-tighter">Cons</h4>
                    <ul className="text-sm space-y-1">
                      {product.cons.map((con, i) => <li key={i} className="text-gray-600 dark:text-gray-400">• {con}</li>)}
                    </ul>
                  </div>
                </div>
                <AmazonButton url={product.amazonUrl} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <AffiliateDisclosure />
    </div>
  );
}
