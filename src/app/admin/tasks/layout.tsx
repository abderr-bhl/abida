import { requireAuth } from '@/lib/auth';
import { logoutAction } from '@/app/admin/login/actions';

export default async function AdminTasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ReviewGuid Admin Dashboard
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Automated Competitive Benchmarking & Content Task Queue
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-900 px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
