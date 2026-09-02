import { getAutomatedTasks } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import { logoutAction } from '../login/actions';
import { updateTaskStatusAction, triggerBenchmarkAction } from './actions';
import { TaskStatus } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = await getAutomatedTasks();

  const statusColors: Record<TaskStatus, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-7 sm:truncate">
            Competitive Benchmarking Tasks
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Automated tasks generated from monitoring competitor feeds (Wirecutter, RTINGS) for US market gaps.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              No tasks created yet. Click &quot;Run Benchmark Now&quot; to fetch competitor updates.
            </li>
          ) : (
            tasks.map((task) => {
              const safeSourceUrl = sanitizeUrl(task.sourceUrl);
              return (
                <li key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150 ease-in-out">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-lg text-gray-900 dark:text-white">
                          {task.title}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${
                            statusColors[task.status]
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                          {task.competitor}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {task.description}
                      </p>
                      <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        {safeSourceUrl !== '#' ? (
                          <a
                            href={safeSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                          >
                            Source Article ↗
                          </a>
                        ) : (
                          <span>Source unavailable</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {(['pending', 'in_progress', 'completed', 'dismissed'] as TaskStatus[]).map((status) => {
                        if (status === task.status) return null;
                        return (
                          <form
                            key={status}
                            action={async () => {
                              'use server';
                              await updateTaskStatusAction(task.id, status);
                            }}
                          >
                            <button
                              type="submit"
                              className="px-3 py-1 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                              Mark {status.replace('_', ' ')}
                            </button>
                          </form>
                        );
                      })}
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
