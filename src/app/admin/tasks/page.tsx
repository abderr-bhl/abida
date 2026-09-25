import { loadTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, logoutAdmin } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';

export const revalidate = 0;

export default async function AdminTasksPage() {
  const tasks = loadTasks();

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Automated Task Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Competitive Benchmarking against Wirecutter & RTINGS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{tasks.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Tasks</div>
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-green-600 dark:text-green-400">Completed</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Benchmarked Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No benchmarking tasks generated yet. Click &quot;Run Benchmark Now&quot; to scan competitors.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {task.competitor}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Category: {task.category}
                    </span>
                  </div>

                  <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {task.description}
                </p>

                <div className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 gap-y-2 gap-x-6">
                  {task.targetKeyword && (
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Keyword: </span>
                      {task.targetKeyword}
                    </div>
                  )}
                  {task.sourceUrl && (
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Source: </span>
                      <a
                        href={sanitizeUrl(task.sourceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Competitor Page
                      </a>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Created: </span>
                    {new Date(task.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
