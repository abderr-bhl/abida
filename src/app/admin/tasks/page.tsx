import { getTasks } from '@/lib/automation/benchmark';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { updateTaskStatus, triggerBenchmark, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Automated Task Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor daily competitive benchmarks from Wirecutter and RTINGS to address content gaps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Benchmark Tasks ({tasks.length})
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No benchmark tasks found. Click &quot;Run Benchmark Now&quot; to generate automated tasks.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {task.competitor}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {task.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {task.description}
                  </p>
                  {task.url && (
                    <a
                      href={sanitizeUrl(task.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs text-primary hover:underline mt-1"
                    >
                      View Source Reference →
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 self-start md:self-center">
                  <TaskStatusSelect
                    taskId={task.id}
                    currentStatus={task.status}
                    onStatusChange={updateTaskStatus}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
