import { getTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, logoutAction } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Competitive Benchmarking Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated task backlog generated daily from competitor analysis (Wirecutter, RTINGS).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No tasks found in backlog.</p>
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors"
            >
              Generate First Benchmark Tasks
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => {
            const safeSourceUrl = task.sourceUrl ? sanitizeUrl(task.sourceUrl) : null;
            return (
              <div
                key={task.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {task.competitor}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {task.description}
                  </p>
                  {safeSourceUrl && safeSourceUrl !== '#' && (
                    <a
                      href={safeSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-primary hover:underline gap-1 mt-1 font-medium"
                    >
                      <span>View competitor source</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
