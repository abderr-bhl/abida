import { loadTasks } from '@/lib/automation/benchmark';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';
import { triggerBenchmarkAction } from './actions';
import { logoutAction } from '@/app/admin/login/actions';
import { ExternalLink, RefreshCw, LogOut, CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = loadTasks();

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high' && t.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Automated Competitor Benchmark
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-primary dark:bg-blue-900/50">
              Daily Automation
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
            Continuously monitors top US affiliate competitors (Wirecutter, RTINGS) to detect coverage gaps and automatically generate high-priority editorial and review tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Log out of admin dashboard"
              className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg shadow-sm transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalTasks}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Pending Action</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingTasks}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">High Priority Gaps</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{highPriorityTasks}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{completedTasks}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Task Queue List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Automated Task Backlog ({tasks.length})
          </h2>
          <span className="text-xs text-gray-500">
            {inProgressTasks} in progress • {pendingTasks} pending review
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400">No benchmark tasks available.</p>
            <p className="text-sm text-gray-400 mt-1">Click &quot;Run Benchmark Now&quot; to fetch the latest competitor reviews.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  <th className="py-3.5 px-6">Task Title & Details</th>
                  <th className="py-3.5 px-6">Competitor</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </div>
                      <div className="mt-2">
                        <a
                          href={sanitizeUrl(task.sourceUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View Competitor Source <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {task.competitor}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-gray-600 dark:text-gray-300 text-xs">
                      {task.category}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <TaskStatusSelect taskId={task.id} initialStatus={task.status} />
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
