import { getTasks } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { logoutAdminAction, triggerBenchmarkAction, updateTaskStatusAction } from './actions';
import { ExternalLink, RefreshCw, LogOut } from 'lucide-react';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  const totalTasks = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Competitor Benchmark Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Automated content gaps and review opportunities benchmarked against US competitors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0060df] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Benchmarks</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{totalTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Action</p>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">In Progress</p>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Completed</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generated Content Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No tasks found. Click &quot;Run Benchmark Now&quot; to fetch competitor feeds and generate tasks.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3.5">Task Title & Description</th>
                  <th className="px-6 py-3.5">Competitor</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map((task) => {
                  const sanitizedSource = sanitizeUrl(task.sourceUrl);
                  return (
                    <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">{task.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{task.description}</div>
                        {sanitizedSource !== '#' && (
                          <a
                            href={sanitizedSource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#0060df] hover:underline"
                          >
                            Source Article <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                        {task.competitor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {task.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TaskStatusSelect
                          taskId={task.id}
                          currentStatus={task.status}
                          onStatusChange={updateTaskStatusAction}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-400">
                        {new Date(task.createdAt).toLocaleDateString()}
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
