import { getTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, logoutAction } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';
import { ExternalLink, RefreshCw, LogOut, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Automated Competitor Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Daily automated benchmarks scan top US competitors (Wirecutter, RTINGS) to surface content opportunities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCount}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-lg">
            <RefreshCw className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pendingCount}</p>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-lg">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">In Progress</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{inProgressCount}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <PlayCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-500">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{completedCount}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-lg">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tasks Table / List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generated Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No tasks found. Click &quot;Run Benchmark Now&quot; above to trigger an automated scan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="py-3.5 px-6">Task Title & Details</th>
                  <th className="py-3.5 px-6">Competitor Source</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {tasks.map((task) => {
                  const safeSourceUrl = sanitizeUrl(task.sourceUrl);
                  return (
                    <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-6 max-w-md">
                        <p className="font-bold text-gray-900 dark:text-white">{task.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          {task.competitor}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {safeSourceUrl ? (
                          <a
                            href={safeSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View competitor source article for ${task.title} (opens in new tab)`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                          >
                            Source Article
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">No URL</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
