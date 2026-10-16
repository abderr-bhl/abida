import { getTasks, triggerBenchmark } from '@/app/admin/tasks/actions';
import { logoutAction } from '@/app/admin/login/actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Competitor Benchmark Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Automated content gap analysis & task generation for US competitor reviews.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks generated yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Run the benchmark process manually or wait for the daily automated cron job.
          </p>
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
            >
              Trigger Benchmark First Run
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
                  <th className="py-3 px-6">Task Title & Details</th>
                  <th className="py-3 px-6">Source</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Created</th>
                  <th className="py-3 px-6 text-right">Competitor Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-bold text-gray-900 dark:text-white mb-1">{task.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {task.source}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <TaskStatusSelect taskId={task.id} initialStatus={task.status} />
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <a
                        href={task.competitorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <span>View Source</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
