import { getTasks } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import { TaskStatus } from '@/types';
import {
  logoutAction,
  triggerBenchmarkAction,
  updateTaskStatusAction,
} from './actions';

export const revalidate = 0;

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Competitive Benchmarking Tasks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Automated content gap identification from competitor feeds (Wirecutter, RTINGS).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium text-sm transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tasks.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {tasks.filter((t) => t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {tasks.filter((t) => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Completed</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {tasks.filter((t) => t.status === 'completed').length}
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks generated yet.</p>
          <p className="text-gray-400 text-sm mt-1">Click &quot;Run Benchmark Now&quot; above to fetch competitor RSS feeds.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadge(
                      task.status
                    )}`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {task.competitor}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  Created: {new Date(task.createdAt).toLocaleString()}
                </span>
              </div>

              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {task.title}
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {task.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <a
                  href={sanitizeUrl(task.sourceUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  Source Article
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Set Status:</span>
                  {(['pending', 'in_progress', 'completed', 'dismissed'] as TaskStatus[]).map(
                    (status) => (
                      <form
                        key={status}
                        action={updateTaskStatusAction.bind(null, task.id, status)}
                      >
                        <button
                          type="submit"
                          disabled={task.status === status}
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                            task.status === status
                              ? 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      </form>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
