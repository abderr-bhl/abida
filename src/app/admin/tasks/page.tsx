import React from 'react';
import { getTasks } from '@/lib/automation/benchmark';
import { triggerBenchmarkAction, updateTaskStatusAction } from './actions';
import { logoutAction } from '../login/actions';
import TaskStatusSelect from '@/components/TaskStatusSelect';
import { sanitizeUrl } from '@/lib/sanitize';

export default async function AdminTasksPage() {
  const tasks = getTasks();

  const counts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header with Stats & Actions */}
      <div className="md:flex md:items-center md:justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Automated Competitor Benchmark & Tasks
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Monitors US competitors (Wirecutter, RTINGS) to discover high-value buyer guides and generate automated content tasks.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
          <form action={triggerBenchmarkAction}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer transition-all"
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
              className="inline-flex items-center px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none cursor-pointer transition-all"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Benchmark Tasks</dt>
          <dd className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{counts.total}</dd>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl p-5 border border-amber-100 dark:border-amber-900/30">
          <dt className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Action</dt>
          <dd className="mt-2 text-3xl font-extrabold text-amber-600">{counts.pending}</dd>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl p-5 border border-blue-100 dark:border-blue-900/30">
          <dt className="text-xs font-semibold text-blue-600 uppercase tracking-wider">In Progress</dt>
          <dd className="mt-2 text-3xl font-extrabold text-blue-600">{counts.in_progress}</dd>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl p-5 border border-emerald-100 dark:border-emerald-900/30">
          <dt className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed</dt>
          <dd className="mt-2 text-3xl font-extrabold text-emerald-600">{counts.completed}</dd>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Content Tasks</h2>
          <span className="text-xs text-gray-500">Benchmark cron runs daily at 05:00 UTC</span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-base font-medium">No benchmark tasks generated yet.</p>
            <p className="text-sm mt-1">Click &ldquo;Run Benchmark Now&rdquo; above to run the competitor scanner immediately.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-4xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-primary uppercase">
                        {task.competitor}
                      </span>
                      {task.targetCategory && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {task.targetCategory}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        Found: {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap pt-1">
                      <span>
                        <strong className="text-gray-700 dark:text-gray-300">Competitor Article:</strong>{' '}
                        <a
                          href={sanitizeUrl(task.competitorUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {task.competitorArticleTitle} ↗
                        </a>
                      </span>
                      <span>
                        <strong className="text-gray-700 dark:text-gray-300">Strategy:</strong> {task.suggestedAction}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center lg:flex-col lg:items-end gap-3 mt-4 lg:mt-0">
                    <TaskStatusSelect
                      taskId={task.id}
                      currentStatus={task.status}
                      onUpdateAction={updateTaskStatusAction}
                    />
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
