import { getTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, updateTaskStatusAction, logoutAdmin } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Automated Task Manager
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Benchmark US market competitors (Wirecutter &amp; RTINGS) daily to identify content gaps.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <form action={triggerBenchmark}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                ⚡ Run Benchmark Now
              </button>
            </form>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8">
          {tasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No benchmark tasks generated yet.
              </p>
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                Click &quot;Run Benchmark Now&quot; to fetch latest competitor articles and generate tasks.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map((task) => (
                  <li key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-3xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            {task.competitor}
                          </span>
                          <span className="text-xs text-gray-400">
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                          {task.title}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {task.description}
                        </p>
                        <a
                          href={task.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-primary hover:underline gap-1 mt-1 font-medium"
                        >
                          Source Article ↗
                        </a>
                      </div>

                      <div className="w-full md:w-48 flex-shrink-0">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                          Status
                        </label>
                        <TaskStatusSelect
                          taskId={task.id}
                          currentStatus={task.status}
                          onStatusChange={updateTaskStatusAction}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
