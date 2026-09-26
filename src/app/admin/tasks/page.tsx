import { getTasks } from '@/lib/automation/benchmark';
import { logoutAction } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import RunBenchmarkButton from '@/components/RunBenchmarkButton';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Automated Competitive Benchmarking Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time content gaps and reviews benchmarked against US market competitors (Wirecutter & RTINGS).
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <RunBenchmarkButton />
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Benchmarked Tasks</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{tasks.length}</dd>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Execution</dt>
          <dd className="mt-1 text-3xl font-semibold text-amber-600 dark:text-amber-400">
            {tasks.filter((t) => t.status === 'PENDING').length}
          </dd>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
            {tasks.filter((t) => t.status === 'COMPLETED').length}
          </dd>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Benchmarked Tasks Queue
          </h3>
        </div>
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No benchmarking tasks generated yet. Click &quot;Run Benchmark Now&quot; to scan competitor feeds.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source Competitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </div>
                      <a
                        href={sanitizeUrl(task.competitorUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        View Competitor Article &rarr;
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {task.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {new Date(task.createdAt).toLocaleString('en-US')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
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
