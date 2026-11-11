import { getBenchmarkTasks } from '@/lib/automation/benchmark';
import { runBenchmarkAction, logoutAction } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = await getBenchmarkTasks();

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Competitor Benchmark &amp; Automated Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Fully automated competitive intelligence pipeline monitoring US market leaders (Wirecutter, RTINGS).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={runBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-5 dark:bg-gray-900 dark:border-gray-800">
          <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">Total Benchmark Tasks</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{tasks.length}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-5 dark:bg-gray-900 dark:border-gray-800">
          <dt className="text-sm font-medium text-yellow-600 truncate">Pending Review</dt>
          <dd className="mt-1 text-3xl font-semibold text-yellow-600">{pendingCount}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-5 dark:bg-gray-900 dark:border-gray-800">
          <dt className="text-sm font-medium text-blue-600 truncate">In Progress</dt>
          <dd className="mt-1 text-3xl font-semibold text-blue-600">{inProgressCount}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-5 dark:bg-gray-900 dark:border-gray-800">
          <dt className="text-sm font-medium text-green-600 truncate">Completed</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">{completedCount}</dd>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generated Content Tasks</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">Daily Automated Schedule: 05:00 UTC</span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No competitor tasks yet. Click &quot;Run Benchmark Now&quot; above to fetch competitor feeds.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {task.competitor}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        {task.category}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {task.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                      <span>Detected: {new Date(task.createdAt).toLocaleDateString()}</span>
                      {task.sourceUrl && (
                        <a
                          href={sanitizeUrl(task.sourceUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          View competitor source
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center md:flex-col md:items-end gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                    <TaskStatusSelect taskId={task.id} initialStatus={task.status} />
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
