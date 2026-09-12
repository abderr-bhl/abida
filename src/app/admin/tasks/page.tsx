import { getStoredTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, updateTaskStatus, logout } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = getStoredTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Automated Task Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated backend competitive benchmarking system (US Market: Wirecutter, RTINGS)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Benchmark Now
            </button>
          </form>
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium text-sm rounded-lg transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-500 uppercase">Total Tasks</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tasks.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="text-xs font-semibold text-yellow-600 uppercase">Pending</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {tasks.filter((t) => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="text-xs font-semibold text-blue-600 uppercase">In Progress</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {tasks.filter((t) => t.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="text-xs font-semibold text-green-600 uppercase">Completed</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {tasks.filter((t) => t.status === 'completed').length}
            </p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-12 text-center rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks generated yet.</p>
            <p className="text-sm text-gray-400 mt-1">Click &quot;Run Benchmark Now&quot; to fetch latest competitor articles.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const safeSourceUrl = sanitizeUrl(task.sourceUrl);
              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {task.competitor}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(task.createdAt).toLocaleString('en-US')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {task.description}
                    </p>
                    <a
                      href={safeSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                    >
                      View Competitor Source Link →
                    </a>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {(['pending', 'in_progress', 'completed', 'dismissed'] as const).map((st) => (
                      <form
                        key={st}
                        action={async () => {
                          'use server';
                          await updateTaskStatus(task.id, st);
                        }}
                      >
                        <button
                          type="submit"
                          disabled={task.status === st}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                            task.status === st
                              ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 cursor-default'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      </form>
                    ))}
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
