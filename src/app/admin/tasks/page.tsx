import { getTasks } from '@/lib/automation/benchmark';
import { runBenchmarkAction, logoutAction } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const published = tasks.filter(t => t.status === 'published').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Automated Competitor Intelligence</span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            Daily US Market Benchmark Tasks
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tracking Wirecutter, RTINGS, and US market leaders to benchmark gaps and automate review topics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={runBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-4 h-4 animate-spin-reverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm px-3.5 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Detected</span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase">Pending Review</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{pending}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 uppercase">In Production</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{inProgress}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <span className="text-xs font-semibold text-green-600 uppercase">Published</span>
          <div className="text-2xl font-black text-green-600 mt-1">{published}</div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Competitor Content Tasks</h2>
          <span className="text-xs text-gray-500 font-mono">CRON: 0 5 * * * UTC</span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-base font-medium">No competitor benchmark tasks found.</p>
            <p className="text-sm mt-1">Click &quot;Run Benchmark Now&quot; above to trigger feed analysis.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => {
              const safeSource = sanitizeUrl(task.sourceUrl);
              return (
                <div key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-grow space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 uppercase">
                          {task.competitor}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {task.category}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}>
                          {task.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className="text-xs text-gray-400">
                          Detected: {new Date(task.detectedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {task.description}
                      </p>

                      <div className="pt-1 flex items-center gap-4 text-xs">
                        {safeSource && (
                          <a
                            href={safeSource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Original: {task.originalTitle}</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center md:flex-col md:items-end gap-2">
                      <TaskStatusSelect taskId={task.id} initialStatus={task.status} />
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
