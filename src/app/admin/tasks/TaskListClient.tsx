'use client';

import { useState, useTransition, useCallback } from 'react';
import { Task } from '@/lib/automation/benchmark';
import { triggerBenchmark, updateTaskStatus, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

interface TaskListClientProps {
  initialTasks: Task[];
}

export default function TaskListClient({ initialTasks }: TaskListClientProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleRunBenchmark = useCallback(() => {
    setMessage(null);
    startTransition(async () => {
      const res = await triggerBenchmark();
      setMessage(res.message);
    });
  }, []);

  const handleStatusChange = useCallback((taskId: string, newStatus: Task['status']) => {
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus);
    });
  }, []);

  const handleLogout = useCallback(() => {
    startTransition(async () => {
      await logoutAction();
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {isPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Tasks: <strong className="text-gray-900 dark:text-white">{initialTasks.length}</strong>
          </span>
        </div>

        <button
          onClick={handleLogout}
          disabled={isPending}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>

      {message && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-900 dark:text-blue-200">
          {message}
        </div>
      )}

      {initialTasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No benchmarking tasks yet. Click &quot;Run Benchmark Now&quot; to fetch competitor updates.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {initialTasks.map((task) => {
              const safeSourceUrl = sanitizeUrl(task.sourceUrl);
              return (
                <li key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-3xl">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          {task.competitor}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(task.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {task.description}
                      </p>
                      <a
                        href={safeSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View source article for ${task.title} (opens in a new tab)`}
                        className="inline-flex items-center text-xs font-semibold text-primary hover:underline pt-1"
                      >
                        View Source Article →
                      </a>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                        disabled={isPending}
                        className="text-sm rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white py-1.5 px-3 focus:ring-primary focus:border-primary disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
