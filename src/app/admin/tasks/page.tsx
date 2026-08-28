import Link from 'next/link';
import { getTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, updateTaskStatus, logout } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';
import { TaskStatus } from '@/types';

export const revalidate = 0; // Dynamic server rendering for fresh task data

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Automated Benchmark Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Daily competitive analysis & task management for US affiliate market (reviewguid.com)
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              ← Back to Site
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Action & Stats Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Benchmark Actions
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Scan competitor feeds (Wirecutter, RTINGS) to detect new article content gaps.
              </p>
            </div>
            <div className="mt-6">
              <form action={triggerBenchmark}>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-sm"
                >
                  Run Benchmark Now
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Pending
              </span>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                {pendingCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting content strategy</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                In Progress
              </span>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                {inProgressCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Under active review</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Completed
              </span>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                {completedCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Published or covered</p>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Generated Content Tasks ({tasks.length})
            </h2>
            <span className="text-xs text-gray-500">Auto-updated from competitor analysis</span>
          </div>

          {tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-base font-medium">No tasks found.</p>
              <p className="text-xs mt-1">Click &quot;Run Benchmark Now&quot; above to fetch competitor feeds.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => {
                const safeSourceUrl = sanitizeUrl(task.sourceUrl);
                return (
                  <div
                    key={task.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          {task.category}
                        </span>
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                          {task.sourceName}
                        </span>
                        <span className="text-xs text-gray-400">
                          Created {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {task.description}
                      </p>

                      {safeSourceUrl !== '#' && (
                        <div>
                          <a
                            href={safeSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-medium text-primary hover:underline"
                          >
                            View Source Article →
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500 mr-1 hidden sm:inline">Status:</span>
                      {(['pending', 'in-progress', 'completed'] as TaskStatus[]).map((statusOption) => {
                        const isActive = task.status === statusOption;
                        return (
                          <form
                            key={statusOption}
                            action={async () => {
                              'use server';
                              await updateTaskStatus(task.id, statusOption);
                            }}
                          >
                            <button
                              type="submit"
                              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                                isActive
                                  ? statusOption === 'pending'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200'
                                    : statusOption === 'in-progress'
                                    ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200'
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-200'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                              }`}
                            >
                              {statusOption}
                            </button>
                          </form>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
