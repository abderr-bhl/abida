import { getTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, updateStatus, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Automated Task Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tasks automatically generated from US competitor benchmarking (Wirecutter, RTINGS).
          </p>
        </div>
        <div className="flex items-center gap-4">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No tasks generated yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Click &quot;Run Benchmark Now&quot; above to check competitor feeds for new articles.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Task Title & Details
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Competitor Source
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {tasks.map((task) => {
                  const safeSourceUrl = sanitizeUrl(task.sourceUrl);
                  return (
                    <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50 transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-bold text-gray-900 dark:text-white text-base">
                          {task.title}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Created: {new Date(task.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 mb-1">
                          {task.competitor}
                        </span>
                        <div>
                          <a
                            href={safeSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center"
                          >
                            View Source
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                              : task.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {task.status !== 'pending' && (
                            <form action={updateStatus.bind(null, task.id, 'pending')}>
                              <button
                                type="submit"
                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                              >
                                Mark Pending
                              </button>
                            </form>
                          )}
                          {task.status !== 'in_progress' && (
                            <form action={updateStatus.bind(null, task.id, 'in_progress')}>
                              <button
                                type="submit"
                                className="text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 underline"
                              >
                                Start
                              </button>
                            </form>
                          )}
                          {task.status !== 'completed' && (
                            <form action={updateStatus.bind(null, task.id, 'completed')}>
                              <button
                                type="submit"
                                className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline"
                              >
                                Complete
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
