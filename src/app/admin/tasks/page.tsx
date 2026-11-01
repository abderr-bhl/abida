import { getStoredTasks } from '@/lib/automation/benchmark';
import BenchmarkTriggerButton from '@/components/BenchmarkTriggerButton';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = await getStoredTasks();

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Competitor Automated Benchmark Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated monitoring of US competitors (Wirecutter, RTINGS) generating content tasks and affiliate gap opportunities.
          </p>
        </div>
        <BenchmarkTriggerButton />
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Tasks</span>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{totalTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Action</span>
          <p className="text-3xl font-black text-amber-600 mt-1">{pendingTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">In Progress</span>
          <p className="text-3xl font-black text-blue-600 mt-1">{inProgressTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Completed</span>
          <p className="text-3xl font-black text-green-600 mt-1">{completedTasks}</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Actionable Backlog ({tasks.length})
          </h2>
          <span className="text-xs text-gray-500">
            Daily Cron Schedule: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">0 5 * * *</code> (05:00 UTC)
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 px-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No tasks generated yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Click &quot;Run Benchmark Now&quot; above to scan Wirecutter &amp; RTINGS or wait for the daily automated cron.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors flex flex-col md:flex-row md:items-start md:justify-between gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {task.priority} priority
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {task.category}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      Source: {task.competitor}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {task.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {task.description}
                  </p>

                  <div className="text-xs text-gray-500 dark:text-gray-500 pt-1 flex flex-wrap gap-4 items-center">
                    <span>Detected: {new Date(task.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <a
                      href={sanitizeUrl(task.competitorUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <span>View competitor article</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                  <TaskStatusSelect taskId={task.id} initialStatus={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
