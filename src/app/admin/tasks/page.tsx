import { loadTasks } from '@/lib/automation/benchmark';
import { logoutAction } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import BenchmarkTriggerButton from './BenchmarkTriggerButton';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = loadTasks();

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Automated Intelligence System
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            USA Competitor Benchmarks &amp; Tasks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Automatically track Wirecutter, RTINGS, and top US review publications to generate actionable editorial tasks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BenchmarkTriggerButton />
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Tasks</span>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{tasks.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-yellow-200 dark:border-yellow-900/40 shadow-sm">
          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase">Pending</span>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-blue-200 dark:border-blue-900/40 shadow-sm">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">In Progress</span>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-green-200 dark:border-green-900/40 shadow-sm">
          <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase">Completed</span>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generated Content Tasks</h2>
          <span className="text-xs text-gray-500">Updated automatically via daily cron or manual trigger</span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No tasks found. Click &quot;Run Benchmark Now&quot; above to fetch competitor topics.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase">
                  <th className="py-3 px-6">Task Title &amp; Details</th>
                  <th className="py-3 px-4">Competitor</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Detected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">
                        {task.title}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <a
                          href={sanitizeUrl(task.competitorUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <span>View Competitor Article</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <span className="text-xs text-gray-400 font-mono">
                          /{task.suggestedSlug}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {task.competitorSource}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap uppercase text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {task.type}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-bold uppercase ${
                          task.priority === 'high'
                            ? 'text-red-600 dark:text-red-400'
                            : task.priority === 'medium'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-400">
                      {new Date(task.detectedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
