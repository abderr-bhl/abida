import { getTasks, runBenchmark } from '@/lib/automation/benchmark';
import { updateTaskStatusAction, triggerBenchmarkAction, handleLogoutAction } from './actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  let tasks = getTasks();

  // Populate benchmark tasks automatically if empty
  if (tasks.length === 0) {
    const result = await runBenchmark();
    tasks = result.tasks;
  }

  const counts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    dismissed: tasks.filter(t => t.status === 'dismissed').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Automated Competitor Task Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time daily content benchmarking against top US competitors (Wirecutter, RTINGS)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Benchmark Now
            </button>
          </form>

          <form action={handleLogoutAction}>
            <button
              type="submit"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Metrics Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Tasks</span>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{counts.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">Pending</span>
          <p className="text-2xl font-extrabold text-yellow-600 dark:text-yellow-400 mt-1">{counts.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">In Progress</span>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{counts.in_progress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Completed</span>
          <p className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-1">{counts.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dismissed</span>
          <p className="text-2xl font-extrabold text-gray-500 dark:text-gray-400 mt-1">{counts.dismissed}</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Competitor Benchmark Tasks
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Updated dynamically via automation
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No competitor tasks found. Click &quot;Run Benchmark Now&quot; to fetch latest competitor content.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => (
              <div key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {task.source}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                    {task.competitorUrl && (
                      <a
                        href={sanitizeUrl(task.competitorUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Source</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 self-end md:self-center">
                  <TaskStatusSelect
                    taskId={task.id}
                    currentStatus={task.status}
                    onStatusChange={updateTaskStatusAction}
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
