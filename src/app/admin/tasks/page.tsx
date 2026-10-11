import { getTasks } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { triggerBenchmarkAction, logoutAdminAction } from './actions';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Competitor Benchmark Tasks
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Automated daily competitor analysis tracking US market competitors (Wirecutter, RTINGS)
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <form action={triggerBenchmarkAction}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Run Benchmark Now
              </button>
            </form>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No tasks generated yet. Click &quot;Run Benchmark Now&quot; to fetch competitor updates.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => (
                <li key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            task.competitor === 'Wirecutter'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}
                        >
                          {task.competitor}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {task.description}
                      </p>
                      {task.sourceUrl && (
                        <a
                          href={sanitizeUrl(task.sourceUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs text-primary font-medium hover:underline"
                        >
                          View Original Article →
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-start md:items-end">
                        <label className="text-xs text-gray-500 mb-1">Status</label>
                        <TaskStatusSelect taskId={task.id} initialStatus={task.status} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
