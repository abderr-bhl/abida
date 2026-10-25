import { getStoredTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, logoutAction } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';

export const revalidate = 0;

export default async function AdminTasksPage() {
  const tasks = getStoredTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Competitive Benchmarking Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated tasks generated from US competitor coverage (Wirecutter, RTINGS)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks generated yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Click &quot;Run Benchmark Now&quot; to fetch competitor RSS feeds and generate actionable review tasks.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => (
              <li key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {task.source}
                      </span>
                      <span className="text-xs text-gray-400">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {task.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {task.description}
                    </p>
                    <div className="mt-2">
                      <a
                        href={task.competitorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary hover:underline inline-flex items-center"
                      >
                        View Original Competitor Source →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
