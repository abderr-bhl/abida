import { getTasks } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import { triggerBenchmarkAction, updateTaskStatusAction, logoutAction } from './actions';
import { ExternalLink, RefreshCw, LogOut, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const revalidate = 0;

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Automated Tasks Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Competitive Benchmarking & USA Market Content Task Management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Run Benchmark Now
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{tasks.length}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-blue-500 opacity-80" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {tasks.filter((t) => t.status === 'pending').length}
            </p>
          </div>
          <Clock className="w-8 h-8 text-yellow-500 opacity-80" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Tasks</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
              {tasks.filter((t) => t.status === 'completed').length}
            </p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Benchmarked Competitor Content</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No tasks found. Click &quot;Run Benchmark Now&quot; to scan competitor feeds.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        {task.competitor}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{task.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                    {task.sourceUrl && (
                      <a
                        href={sanitizeUrl(task.sourceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Source Competitor Article <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <form
                      action={async () => {
                        'use server';
                        await updateTaskStatusAction(task.id, 'pending');
                      }}
                    >
                      <button
                        type="submit"
                        disabled={task.status === 'pending'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                          task.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold dark:bg-yellow-900/40 dark:text-yellow-300'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Pending
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
                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                          task.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 border-blue-300 font-semibold dark:bg-blue-900/40 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
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
                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800 border-green-300 font-semibold dark:bg-green-900/40 dark:text-green-300'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Completed
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
