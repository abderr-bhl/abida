import { fetchTasks, updateTaskStatusAction, triggerBenchmarkAction, logoutAction } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = await fetchTasks();

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Competitive Benchmarking Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automatically generated content tasks based on US market competitors (Wirecutter, RTINGS)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.all}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/50 shadow-sm">
          <p className="text-xs font-semibold uppercase text-yellow-600 dark:text-yellow-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{counts.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-blue-200 dark:border-blue-900/50 shadow-sm">
          <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">In Progress</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{counts.in_progress}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-green-200 dark:border-green-900/50 shadow-sm">
          <p className="text-xs font-semibold uppercase text-green-600 dark:text-green-400">Completed</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{counts.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Cancelled</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{counts.cancelled}</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Benchmark Tasks ({tasks.length})
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No tasks generated yet. Click &quot;Run Benchmark Now&quot; above to scan competitor RSS feeds.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/30 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">Task Title / Description</th>
                  <th scope="col" className="px-6 py-3 text-left">Category</th>
                  <th scope="col" className="px-6 py-3 text-left">Competitor</th>
                  <th scope="col" className="px-6 py-3 text-left">Source Link</th>
                  <th scope="col" className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="font-bold text-gray-900 dark:text-white">{task.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {task.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">
                      {task.competitor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <a
                        href={sanitizeUrl(task.sourceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Source Article
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-40">
                      <TaskStatusSelect
                        taskId={task.id}
                        currentStatus={task.status}
                        onStatusChange={updateTaskStatusAction}
                      />
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
