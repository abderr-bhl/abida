import { loadTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, updateTaskStatusAction, logoutAction } from './actions';
import { Task } from '@/types';

export default async function AdminTasksPage() {
  const tasks = await loadTasks();

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Competitive Benchmark Tasks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Automated gap analysis monitoring US competitors (Wirecutter & RTINGS)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
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
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Tracked Tasks</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Action</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{pendingTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{inProgressTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{completedTasks}</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Actionable Tasks</h2>
          <span className="text-xs text-gray-500">{tasks.length} item(s)</span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">No benchmark tasks found.</p>
            <p className="text-sm mt-1">Click &quot;Run Benchmark Now&quot; to fetch latest competitor articles.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task: Task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {task.competitor}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {task.priority} priority
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : task.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        Status: {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {task.description}
                    </p>

                    {task.sourceUrl && (
                      <div className="pt-1">
                        <a
                          href={task.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View source article on {task.competitor} →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <form
                      action={async () => {
                        'use server';
                        await updateTaskStatusAction(task.id, 'pending');
                      }}
                    >
                      <button
                        type="submit"
                        disabled={task.status === 'pending'}
                        className="px-3 py-1.5 text-xs font-semibold rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-40"
                      >
                        Mark Pending
                      </button>
                    </form>

                    <form
                      action={async () => {
                        'use server';
                        await updateTaskStatusAction(task.id, 'in_progress');
                      }}
                    >
                      <button
                        type="submit"
                        disabled={task.status === 'in_progress'}
                        className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40"
                      >
                        In Progress
                      </button>
                    </form>

                    <form
                      action={async () => {
                        'use server';
                        await updateTaskStatusAction(task.id, 'completed');
                      }}
                    >
                      <button
                        type="submit"
                        disabled={task.status === 'completed'}
                        className="px-3 py-1.5 text-xs font-semibold rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-40"
                      >
                        Complete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
