import { loadTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, updateTaskStatus, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = await loadTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Competitor Benchmarking Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automatically generated tasks based on US market competitor updates (Wirecutter, RTINGS).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Competitor Tasks</span>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{tasks.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Review</span>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {tasks.filter((t) => t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-green-600 dark:text-green-400">Completed</span>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {tasks.filter((t) => t.status === 'completed').length}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Actionable Content Tasks</h2>
        </div>
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No benchmarking tasks yet. Click &quot;Run Benchmark Now&quot; or wait for the daily automated cron job.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => {
              const safeSourceUrl = sanitizeUrl(task.sourceUrl);
              return (
                <div key={task.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {task.competitor}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{task.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{task.description}</p>
                    <a
                      href={safeSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      View Source Article →
                    </a>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <form
                      action={async () => {
                        'use server';
                        await updateTaskStatus(task.id, 'pending');
                      }}
                    >
                      <button
                        type="submit"
                        disabled={task.status === 'pending'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          task.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 font-bold'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Pending
                      </button>
                    </form>

                    <form
                      action={async () => {
                        'use server';
                        await updateTaskStatus(task.id, 'in_progress');
                      }}
                    >
                      <button
                        type="submit"
                        disabled={task.status === 'in_progress'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          task.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        In Progress
                      </button>
                    </form>

                    <form
                      action={async () => {
                        'use server';
                        await updateTaskStatus(task.id, 'completed');
                      }}
                    >
                      <button
                        type="submit"
                        disabled={task.status === 'completed'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 font-bold'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Completed
                      </button>
                    </form>
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
