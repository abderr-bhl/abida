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
      <header className="mb-12 border-b border-gray-200 pb-8 dark:border-gray-800 text-center">
        <span className="text-primary font-semibold uppercase tracking-wider text-sm">{guide.category}</span>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4 leading-tight">{guide.title}</h1>
        <p className="text-gray-500">{guide.date} • By {guide.author}</p>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-8 italic border-l-4 border-primary pl-6 py-2">
          &quot;{guide.excerpt}&quot;
        </p>
        <div className="text-gray-800 dark:text-gray-200">
          {guide.content}
          <p className="mt-4">
            Choosing the right product requires understanding your specific needs. In this guide, we break down the key factors to consider.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">Key Considerations</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0">
            <li className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start">
              <span className="text-primary mr-3 text-xl">✓</span>
              <div>
                <strong className="block text-gray-900 dark:text-white">Performance</strong>
                <span className="text-sm">Reliable results in real-world testing.</span>
              </div>
            </li>
             <li className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start">
              <span className="text-primary mr-3 text-xl">✓</span>
              <div>
                <strong className="block text-gray-900 dark:text-white">Value</strong>
                <span className="text-sm">Balancing features with price point.</span>
              </div>
            </li>
             <li className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start">
              <span className="text-primary mr-3 text-xl">✓</span>
              <div>
                <strong className="block text-gray-900 dark:text-white">Usability</strong>
                <span className="text-sm">Intuitive controls and easy setup.</span>
              </div>
            </li>
             <li className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start">
              <span className="text-primary mr-3 text-xl">✓</span>
              <div>
                <strong className="block text-gray-900 dark:text-white">Durability</strong>
                <span className="text-sm">Long-term build quality and warranty.</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <section className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">Top Recommendations</h2>
        <div className="space-y-12">
          {recommendedProducts.map((product, index) => (
            <div key={product.id} className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-8 items-start">
              {index === 0 && <div className="absolute -top-4 left-6"><TopPickBadge /></div>}
              <div className="w-full md:w-64 h-64 relative bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${product.imageUrl})` }}
                ></div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                <div className="flex items-center mb-6">
                   <div className="flex text-yellow-400 mr-2">
                     {[...Array(5)].map((_, i) => (
                       <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                     ))}
                   </div>
                   <span className="text-sm font-bold text-gray-900 dark:text-white">{product.rating} / 5.0</span>
                   <span className="mx-3 text-gray-300">|</span>
                   <span className="text-lg font-extrabold text-primary">${product.price}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <div>
                    <h4 className="text-xs font-black text-green-700 mb-3 uppercase tracking-widest">Why we like it</h4>
                    <ul className="text-sm space-y-2">
                      {product.pros.map((pro, i) => <li key={i} className="text-gray-700 dark:text-gray-300 flex items-start"><span className="text-green-500 mr-2">+</span>{pro}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-red-700 mb-3 uppercase tracking-widest">Drawbacks</h4>
                    <ul className="text-sm space-y-2">
                      {product.cons.map((con, i) => <li key={i} className="text-gray-700 dark:text-gray-300 flex items-start"><span className="text-red-500 mr-2">-</span>{con}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <AmazonButton url={product.amazonUrl} className="flex-1" />
                  <button className="flex-1 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Read Full Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AffiliateDisclosure />
    </div>
  );
}
