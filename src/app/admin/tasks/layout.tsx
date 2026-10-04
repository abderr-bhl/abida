import React from 'react';
import { requireAuth } from '@/lib/auth';
import { logoutAction } from './actions';
import { LogOut, LayoutDashboard } from 'lucide-react';

export default async function AdminTasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap justify-between items-center pb-6 border-b border-gray-200 dark:border-gray-800 mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Competitive Benchmarking Admin
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automated daily content benchmarking & task management
              </p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
