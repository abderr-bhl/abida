import { loadTasks } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import { triggerBenchmarkAction, updateTaskStatusAction, logoutAction } from './actions';

export const revalidate = 0;

export default async function AdminTasksPage() {
  const tasks = loadTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Automated Competitor Task Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Automated content gap identification from US competitors (Wirecutter, RTINGS).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors text-sm"
            >
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-lg mb-4">No tasks found in system.</p>
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Trigger First Competitor Benchmark
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => {
            const safeSourceUrl = sanitizeUrl(task.sourceUrl);
            return (
              <div
                key={task.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {task.competitor}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : task.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      Pub: {new Date(task.pubDate).toLocaleDateString('en-US')}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {task.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {task.description}
                  </p>
                  <div>
                    <a
                      href={safeSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary hover:underline inline-flex items-center"
                    >
                      View Source Article →
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <form action={updateTaskStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="taskId" value={task.id} />
                    <select
                      name="status"
                      defaultValue={task.status}
                      className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Update
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
