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
        <span className="text-primary font-bold uppercase tracking-wider text-xs bg-blue-50 dark:bg-blue-950/40 text-primary px-2.5 py-1 rounded">
          {guide.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-4 mb-3 tracking-tight">
          {guide.title}
        </h1>
        <p className="text-sm text-gray-500">
          Published {guide.date} • By <span className="font-medium text-gray-700 dark:text-gray-300">{guide.author}</span>
        </p>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-8 italic border-l-4 border-primary pl-4 py-1">
          &quot;{guide.excerpt}&quot;
        </p>
        <div className="text-gray-800 dark:text-gray-200">
          {guide.content}
          <p className="mt-4">
            Choosing the right product requires understanding your specific needs. In this guide, our editorial team rigorously tests and compares products to deliver unbiased buyer advice.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">How We Test & Select</h2>
          <ul>
            <li>Real-world lab testing and performance reliability</li>
            <li>Value-to-price ratio in the US marketplace</li>
            <li>User ergonomics, setup simplicity, and ecosystem support</li>
            <li>Long-term durability and manufacturer warranty</li>
          </ul>
        </div>
      </div>

      <section className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended Picks</h2>
            <p className="text-sm text-gray-500 mt-1">Tested, ranked, and updated for USA buyers.</p>
          </div>
        </div>

        <div className="space-y-8">
          {recommendedProducts.map((product, index) => {
            const isTopPick = index === 0;

            return (
              <div
                key={product.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border transition-all ${
                  isTopPick
                    ? 'border-primary ring-1 ring-primary/30 relative'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {isTopPick && (
                  <div className="mb-4">
                    <TopPickBadge label="Top Pick for Most People" />
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-48 h-48 relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${product.imageUrl})` }}
                    ></div>
                  </div>
                  <div className="flex-grow w-full">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <span className="text-xl font-extrabold text-primary">
                        ${product.price}
                      </span>
                    </div>

                    <div className="flex items-center mb-4">
                      <span className="text-amber-500 mr-1">★</span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {product.rating}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">/ 5.0 on Amazon</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-xs text-gray-500 font-medium">Brand: {product.brand}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1.5 uppercase tracking-wide">
                          Why We Like It
                        </h4>
                        <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                          {product.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
                        <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-1.5 uppercase tracking-wide">
                          Downsides
                        </h4>
                        <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                          {product.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-500 font-bold">✕</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <AmazonButton url={product.amazonUrl} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AffiliateDisclosure />
    </div>
  );
}
