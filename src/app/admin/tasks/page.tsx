import { loadTasks } from '@/lib/automation/benchmark';
import { triggerBenchmarkAction, updateTaskStatusAction, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

export const revalidate = 0;

export default async function AdminTasksPage() {
  const tasks = loadTasks();

  const counts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-8 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Automated Competitor Task Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated tasks generated from US competitor RSS feeds (Wirecutter, RTINGS)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-amber-200 dark:border-amber-900/30 shadow-sm">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{counts.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-blue-200 dark:border-blue-900/30 shadow-sm">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{counts.inProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-green-200 dark:border-green-900/30 shadow-sm">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{counts.completed}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Content Tasks</h2>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full font-mono">
            {tasks.length} items
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No tasks generated yet. Click &quot;Run Benchmark Now&quot; to fetch competitor articles.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => {
              const safeSourceUrl = sanitizeUrl(task.sourceUrl);
              return (
                <div key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-750/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                          {task.competitor}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                          {task.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(task.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {task.description}
                      </p>

                      {safeSourceUrl !== '#' && (
                        <a
                          href={safeSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-medium text-blue-600 hover:underline dark:text-blue-400 mt-1"
                        >
                          Source Article &rarr;
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-700">
                      {(['pending', 'in_progress', 'completed'] as const).map(status => (
                        <form
                          key={status}
                          action={async () => {
                            'use server';
                            await updateTaskStatusAction(task.id, status);
                          }}
                        >
                          <button
                            type="submit"
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              task.status === status
                                ? status === 'pending'
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : status === 'in_progress'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-green-600 text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
