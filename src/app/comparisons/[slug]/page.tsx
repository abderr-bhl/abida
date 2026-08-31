import { comparisons, products } from '@/lib/mockData';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ComparisonDetailPage({ params }: Props) {
  const { slug } = await params;
  const comparison = comparisons.find(c => c.slug === slug);

  if (!comparison) {
    notFound();
  }

  const comparisonProducts = products.filter(p => comparison.products.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{comparison.title}</h1>
        <p className="text-gray-500">Last updated: {comparison.date}</p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="py-6 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">Features</th>
              {comparisonProducts.map(product => (
                <th key={product.id} className="py-6 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-center min-w-[200px]">
                  <div className="font-bold text-lg dark:text-white">{product.name}</div>
                  {product.id === comparison.winnerId && (
                    <span className="inline-block mt-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                       Winner
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
               <td className="py-6 px-4 border-b border-gray-100 dark:border-gray-800 font-semibold">Image</td>
               {comparisonProducts.map(product => (
                 <td key={product.id} className="py-6 px-4 border-b border-gray-100 dark:border-gray-800 text-center">
                    <div className="w-32 h-32 relative mx-auto rounded-lg overflow-hidden bg-gray-100">
                       <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${product.imageUrl})` }}
                      ></div>
                    </div>
                 </td>
               ))}
            </tr>
            {comparison.criteria.map((criterion, idx) => (
              <tr key={idx}>
                <td className="py-6 px-4 border-b border-gray-100 dark:border-gray-800 font-semibold">{criterion}</td>
                {comparisonProducts.map(product => (
                  <td key={product.id} className="py-6 px-4 border-b border-gray-100 dark:border-gray-800 text-center">
                     <span className="text-gray-600 dark:text-gray-400">
                       {idx === 0 ? product.rating + ' / 5' : 'Available'}
                     </span>
                  </td>
                ))}
              </tr>
            ))}
            <tr>
               <td className="py-6 px-4 border-b border-gray-100 dark:border-gray-800 font-semibold">Price</td>
               {comparisonProducts.map(product => (
                 <td key={product.id} className="py-6 px-4 border-b border-gray-100 dark:border-gray-800 text-center font-bold text-[#0060df]">
                    ${product.price}
                 </td>
               ))}
            </tr>
            <tr>
               <td className="py-6 px-4"></td>
               {comparisonProducts.map(product => (
                 <td key={product.id} className="py-6 px-4 text-center">
                    <a
                      href={product.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#FF9900] hover:bg-[#e68a00] text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors text-sm"
                    >
                      Buy on Amazon
                    </a>
                 </td>
               ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
