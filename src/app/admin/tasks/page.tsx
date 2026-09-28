import { getTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, logoutAdmin } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Bar */}
      <div className="md:flex md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold leading-7 text-gray-900 dark:text-white sm:text-4xl sm:truncate">
            Competitive Benchmarking Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated content gap analysis based on daily competitor monitoring (Wirecutter & RTINGS).
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 gap-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{tasks.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {tasks.filter(t => t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {tasks.filter(t => t.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Content Action Tasks</h2>
        </div>
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No tasks found. Click &quot;Run Benchmark Now&quot; to fetch competitor updates.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {task.competitor}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <a
                        href={sanitizeUrl(task.sourceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Source Article →
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
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
