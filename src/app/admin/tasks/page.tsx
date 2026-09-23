import { getTasks } from '@/lib/automation/benchmark';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { triggerBenchmark, updateTaskStatus, logoutAction } from './actions';

export const revalidate = 0;

export default async function AdminTasksPage() {
  const tasks = getTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Gap Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Automated tasks generated from competitor benchmarking (Wirecutter, RTINGS).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="bg-primary hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg transition-colors text-sm cursor-pointer"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Click &quot;Run Benchmark Now&quot; to fetch latest competitor articles and generate content gap tasks.
          </p>
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="bg-primary hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              Run Benchmark Now
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    {task.competitor}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                        : task.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {task.description}
                </p>
                {task.sourceUrl && (
                  <a
                    href={task.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View Source Article
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <TaskStatusSelect
                  taskId={task.id}
                  currentStatus={task.status}
                  action={updateTaskStatus}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
