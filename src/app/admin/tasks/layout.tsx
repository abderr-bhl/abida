import { requireAuth } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</span>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">Back to Site</Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
