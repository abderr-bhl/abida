import React from 'react';
import { loadTasks } from '@/lib/automation/benchmark';
import { triggerBenchmark, updateTaskStatus, logout } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';
import TopPickBadge from '@/components/TopPickBadge';
import { BenchmarkTaskStatus } from '@/types';

export default async function AdminTasksPage() {
  const tasks = loadTasks();

  const counts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    ignored: tasks.filter((t) => t.status === 'ignored').length,
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Automated Competitive Benchmarking
            <TopPickBadge label="Automated" />
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor US competitors (Wirecutter, RTINGS) and manage daily content tasks.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <form action={triggerBenchmark}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Run Benchmark Now
            </button>
          </form>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Tasks</dt>
          <dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{counts.total}</dd>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <dt className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Pending</dt>
          <dd className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">{counts.pending}</dd>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <dt className="text-xs font-medium text-blue-600 dark:text-blue-400">In Progress</dt>
          <dd className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{counts.in_progress}</dd>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <dt className="text-xs font-medium text-green-600 dark:text-green-400">Completed</dt>
          <dd className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{counts.completed}</dd>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <dt className="text-xs font-medium text-gray-400 dark:text-gray-500">Ignored</dt>
          <dd className="mt-1 text-2xl font-bold text-gray-400 dark:text-gray-500">{counts.ignored}</dd>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Generated Content Tasks</h2>
        </div>
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No tasks found. Click &quot;Run Benchmark Now&quot; to fetch competitor articles.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => {
              const safeLink = sanitizeUrl(task.link);
              return (
                <li key={task.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {task.competitor}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize">
                          {task.type}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : task.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : task.status === 'ignored'
                              ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                      <div className="flex items-center gap-4 pt-1 text-xs text-gray-400 dark:text-gray-500">
                        <span>Published: {new Date(task.pubDate).toLocaleDateString()}</span>
                        {safeLink !== '#' && (
                          <a
                            href={safeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Original Article &rarr;
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      {(['pending', 'in_progress', 'completed', 'ignored'] as BenchmarkTaskStatus[]).map((status) => (
                        <form
                          key={status}
                          action={async () => {
                            'use server';
                            await updateTaskStatus(task.id, status);
                          }}
                        >
                          <button
                            type="submit"
                            disabled={task.status === status}
                            className={`px-2.5 py-1 text-xs font-medium rounded capitalize border ${
                              task.status === status
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 border-transparent cursor-default'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {status.replace('_', ' ')}
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
