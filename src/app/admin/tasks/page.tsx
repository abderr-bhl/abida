import { getTasks } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import { triggerBenchmarkAction, updateTaskStatusAction, logoutAction } from './actions';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Automated Task Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Competitive Benchmarking & Content Gap Automation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg text-sm shadow-xs transition-colors"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Benchmark Now
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 my-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{tasks.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-xs">
          <p className="text-xs font-semibold uppercase text-amber-600 dark:text-amber-400">Pending</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-blue-200 dark:border-blue-900/50 shadow-xs">
          <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
          <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">Completed</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detected Content Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm mt-1">Click &quot;Run Benchmark Now&quot; above to scan competitor RSS feeds for new content gaps.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => {
              const safeSourceUrl = sanitizeUrl(task.sourceUrl);

              return (
                <div key={task.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {task.source}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        task.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {task.description}
                    </p>

                    <div>
                      <a
                        href={safeSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
                      >
                        View Source Article
                        <svg aria-hidden="true" className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Status Actions Form */}
                  <div className="flex items-center gap-2 shrink-0">
                    <form action={updateTaskStatusAction} className="flex gap-2">
                      <input type="hidden" name="taskId" value={task.id} />

                      {task.status !== 'pending' && (
                        <button
                          type="submit"
                          name="status"
                          value="pending"
                          className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Mark Pending
                        </button>
                      )}

                      {task.status !== 'in_progress' && (
                        <button
                          type="submit"
                          name="status"
                          value="in_progress"
                          className="px-3 py-1.5 rounded-md text-xs font-medium border border-blue-300 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          In Progress
                        </button>
                      )}

                      {task.status !== 'completed' && (
                        <button
                          type="submit"
                          name="status"
                          value="completed"
                          className="px-3 py-1.5 rounded-md text-xs font-medium border border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                        >
                          Complete
                        </button>
                      )}
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
