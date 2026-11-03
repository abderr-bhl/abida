import { loadTasks } from '@/lib/automation/benchmark';
import { triggerBenchmarkAction } from './actions';
import { logoutAction } from '../login/actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';
import { Activity, RefreshCw, ExternalLink, CheckCircle2, Clock, ListOrdered, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = loadTasks();

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Automated Back-End Engine
            </span>
            <span className="text-xs text-gray-500">Target: US Market Competitors</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            Competitor Intelligence & Task Engine
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Continuous daily benchmarking against Wirecutter & RTINGS. Generates actionable content creation tasks to close market gaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Logout"
              className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 hover:text-red-600 hover:border-red-300 dark:text-gray-400 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Benchmarked</span>
            <ListOrdered className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{tasks.length}</p>
          <span className="text-xs text-gray-400 mt-1 block">Articles analyzed across competitors</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Actions</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">{pendingCount}</p>
          <span className="text-xs text-gray-400 mt-1 block">Awaiting article draft creation</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</span>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{inProgressCount}</p>
          <span className="text-xs text-gray-400 mt-1 block">Under content generation</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Completed</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{completedCount}</p>
          <span className="text-xs text-gray-400 mt-1 block">Published on reviewguid.com</span>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generated Content Tasks</h2>
          <span className="text-xs text-gray-500 font-mono">CRON: Daily @ 05:00 UTC</span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No competitor tasks logged yet.</p>
            <form action={triggerBenchmarkAction}>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer"
              >
                Scan Competitor Feeds Now
              </button>
            </form>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/40">
                  <th className="py-3 px-6">Task / Topic</th>
                  <th className="py-3 px-6">Competitor Source</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Detected At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="mt-2">
                        <a
                          href={sanitizeUrl(task.competitorUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                        >
                          <span>View original competitor article</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {task.competitor}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {task.contentType}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <TaskStatusSelect taskId={task.id} initialStatus={task.status} />
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-xs text-gray-500">
                      {new Date(task.detectedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
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
