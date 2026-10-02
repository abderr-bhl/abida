import React from 'react';
import { getTasks } from '@/lib/automation/benchmark';
import { TaskStatusSelect } from '@/components/TaskStatusSelect';
import { triggerBenchmarkAction, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';
import { ExternalLink, RefreshCw, LogOut, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const revalidate = 0; // dynamic

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Automated Competitive Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Daily content gap analysis & benchmarking for reviewguid.com US market strategy.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Run Benchmark Now</span>
            </button>
          </form>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{totalCount}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Action</div>
            <div className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
          </div>
          <Clock className="w-8 h-8 text-amber-500/20" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</div>
            <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</div>
          </div>
          <AlertCircle className="w-8 h-8 text-blue-500/20" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</div>
            <div className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</div>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500/20" />
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generated Content Tasks</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Source: Wirecutter & RTINGS RSS Feeds
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3">
            <p className="text-base">No tasks generated yet.</p>
            <p className="text-sm text-gray-400">Click &ldquo;Run Benchmark Now&rdquo; above to run competitive analysis.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        {task.category}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {task.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {task.description}
                    </p>

                    {task.competitorUrl && (
                      <div className="pt-1">
                        <a
                          href={sanitizeUrl(task.competitorUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                        >
                          <span>View competitor article</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:self-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
                      {task.updatedAt && (
                        <div>Updated: {new Date(task.updatedAt).toLocaleDateString()}</div>
                      )}
                    </div>
                    <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
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
