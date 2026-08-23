'use client';

import React, { useState, useTransition, useActionState } from 'react';
import { Task } from '@/types';
import { triggerBenchmark, updateTaskStatus } from './actions';
import { logoutAction } from '@/app/admin/login/actions';
import { sanitizeUrl } from '@/lib/sanitize';

interface TaskDashboardClientProps {
  initialTasks: Task[];
}

export default function TaskDashboardClient({ initialTasks }: TaskDashboardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const [benchmarkState, benchmarkFormAction, isBenchmarking] = useActionState(
    triggerBenchmark,
    null
  );

  const handleStatusChange = (taskId: string, status: 'pending' | 'in-progress' | 'completed') => {
    startTransition(async () => {
      const res = await updateTaskStatus(taskId, status);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
        );
      }
    });
  };

  const filteredTasks = tasks.filter((t) => (filter === 'all' ? true : t.status === filter));

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Competitive Benchmarking Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Automated backend tasks tracking US competitors (Wirecutter, RTINGS).
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <form action={benchmarkFormAction}>
            <button
              type="submit"
              disabled={isBenchmarking || isPending}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center"
            >
              {isBenchmarking ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Running Benchmark...
                </>
              ) : (
                'Run Benchmark Now'
              )}
            </button>
          </form>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {benchmarkState?.message && (
        <div
          className={`p-4 rounded-md text-sm font-medium ${
            benchmarkState.success
              ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {benchmarkState.message}
        </div>
      )}

      <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
          Filter by Status:
        </span>
        {(['all', 'pending', 'in-progress', 'completed'] as const).map((statusKey) => (
          <button
            key={statusKey}
            onClick={() => setFilter(statusKey)}
            className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
              filter === statusKey
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {statusKey} ({statusKey === 'all' ? tasks.length : tasks.filter((t) => t.status === statusKey).length})
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No tasks found matching current criteria. Click &quot;Run Benchmark Now&quot; to fetch competitor updates.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.map((task) => {
              const safeSourceUrl = sanitizeUrl(task.sourceUrl);
              return (
                <div key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {task.sourceCompetitor}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${statusColors[task.status]}`}>
                          {task.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          Detected: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h2>

                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {task.description}
                      </p>

                      {safeSourceUrl && (
                        <div>
                          <a
                            href={safeSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-medium text-primary hover:underline"
                          >
                            View Source Article
                            <svg className="ml-1 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <select
                        value={task.status}
                        disabled={isPending}
                        onChange={(e) =>
                          handleStatusChange(
                            task.id,
                            e.target.value as 'pending' | 'in-progress' | 'completed'
                          )
                        }
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-1.5 px-3 text-xs font-medium text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
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
