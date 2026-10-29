import { loadTasks } from '@/lib/automation/benchmark';
import { TaskStatusSelect } from '@/components/TaskStatusSelect';
import { triggerBenchmark, adminLogout } from './actions';

export const revalidate = 0;

export default async function AdminTasksPage() {
  const tasks = loadTasks();

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-5 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              Automated Competitor Benchmarks
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Daily tracked market gaps and tasks generated from US competitors (Wirecutter, RTINGS)
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <form action={triggerBenchmark}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Run Benchmark Now
              </button>
            </form>
            <form action={adminLogout}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
          <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Total Benchmark Tasks
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {tasks.length}
            </dd>
          </div>
          <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Pending Tasks
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </dd>
          </div>
          <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              In Progress
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">
              {inProgressCount}
            </dd>
          </div>
          <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Completed
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
              {completedCount}
            </dd>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-800">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No tasks found. Click &quot;Run Benchmark Now&quot; to fetch competitor data.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {tasks.map((task) => (
                <li key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {task.source}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          {task.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 flex items-center space-x-4">
                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        <a
                          href={task.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          View Competitor Article &rarr;
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
