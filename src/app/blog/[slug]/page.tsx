import { newsPosts } from '@/lib/mockData';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = newsPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <p className="text-sm text-gray-500 mb-2">{post.date} • {post.author}</p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>
      </header>

      <div className="aspect-video relative bg-gray-200 rounded-xl mb-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${post.imageUrl})` }}
        ></div>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">{post.excerpt}</p>
        <div className="text-gray-800 dark:text-gray-200">
          {post.content}
          <p className="mt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </div>
    </div>
  );
}
