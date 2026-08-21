import { getTasks, CompetitorTask } from '@/lib/automation/benchmark';
import { triggerBenchmark, updateTaskStatus, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Automated Content Tasks
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Automated competitive benchmarking identifies gaps vs US market leaders (Wirecutter, RTINGS).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <form action={triggerBenchmark}>
              <button
                type="submit"
                className="bg-primary hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-md shadow transition-colors"
              >
                Run Benchmark Now
              </button>
            </form>
            <form action={logoutAction}>
              <button
                type="submit"
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm px-4 py-2 rounded-md transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Discovered Tasks ({tasks.length})
            </h2>
          </div>

          {tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              No tasks found. Click &quot;Run Benchmark Now&quot; to discover competitor content.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task: CompetitorTask) => (
                <div
                  key={task.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {task.competitor}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : task.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                            : task.status === 'dismissed'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {task.description}
                    </p>

                    <div>
                      <a
                        href={sanitizeUrl(task.sourceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 underline inline-flex items-center gap-1"
                      >
                        View Source Competitor Article &rarr;
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <form
                      action={async () => {
                        'use server';
                        await updateTaskStatus(task.id, 'in_progress');
                      }}
                    >
                      <button
                        type="submit"
                        disabled={task.status === 'in_progress'}
                        className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                      >
                        In Progress
                      </button>
                    </form>

                    <form
                      action={async () => {
                        'use server';
                        await updateTaskStatus(task.id, 'completed');
                      }}
                    >
                      <button
                        type="submit"
                        disabled={task.status === 'completed'}
                        className="px-3 py-1.5 text-xs font-medium rounded border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 text-green-700 dark:text-green-300 disabled:opacity-50"
                      >
                        Complete
                      </button>
                    </form>

                    <form
                      action={async () => {
                        'use server';
                        await updateTaskStatus(task.id, 'dismissed');
                      }}
                    >
                      <button
                        type="submit"
                        disabled={task.status === 'dismissed'}
                        className="px-3 py-1.5 text-xs font-medium rounded border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
