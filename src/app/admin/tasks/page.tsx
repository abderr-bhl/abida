import { getTasks } from '@/lib/automation/benchmark';
import { triggerBenchmarkAction, updateTaskStatusAction } from './actions';
import { logoutAction } from '../login/actions';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Automated Benchmarking Tasks
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Competitive content gaps and benchmark monitoring backend for reviewguid.com
            </p>
          </div>
          <div className="flex items-center gap-3">
            <form action={triggerBenchmarkAction}>
              <button
                type="submit"
                className="bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Run Benchmark Now
              </button>
            </form>
            <form action={logoutAction}>
              <button
                type="submit"
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalTasks}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
            <div className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Gaps</div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingTasks}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressTasks}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
            <div className="text-sm font-medium text-green-600 dark:text-green-400">Completed</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{completedTasks}</div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Task Queue</h2>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tasks found. Click &quot;Run Benchmark Now&quot; to scan competitor feeds.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-grow space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-gray-900 dark:text-white text-lg">
                        {task.title}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {task.source}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : task.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
                      {task.competitorUrl && (
                        <a
                          href={sanitizeUrl(task.competitorUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center"
                        >
                          View Competitor Source
                          <svg
                            className="w-3 h-3 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="shrink-0 flex items-center gap-2">
                    <form action={updateTaskStatusAction} className="inline">
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="status" value="pending" />
                      <button
                        type="submit"
                        disabled={task.status === 'pending'}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950 dark:hover:bg-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 disabled:opacity-40 cursor-pointer"
                      >
                        Pending
                      </button>
                    </form>

                    <form action={updateTaskStatusAction} className="inline">
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="status" value="in_progress" />
                      <button
                        type="submit"
                        disabled={task.status === 'in_progress'}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 disabled:opacity-40 cursor-pointer"
                      >
                        In Progress
                      </button>
                    </form>

                    <form action={updateTaskStatusAction} className="inline">
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="status" value="completed" />
                      <button
                        type="submit"
                        disabled={task.status === 'completed'}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-800 disabled:opacity-40 cursor-pointer"
                      >
                        Completed
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
