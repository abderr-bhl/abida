'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import {
  getTasksAction,
  updateTaskStatusAction,
  triggerBenchmarkAction,
  logoutAction,
} from './actions';
import { BenchmarkTask, TaskStatus } from '@/types';
import { sanitizeUrl } from '@/lib/sanitize';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<BenchmarkTask[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedTasks = await getTasksAction();
      setTasks(fetchedTasks);
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch benchmark tasks.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const result = await updateTaskStatusAction(taskId, newStatus);
    if (result.success) {
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      setMessage({ type: 'success', text: result.message || 'Status updated.' });
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to update status.' });
    }
  };

  const handleRunBenchmark = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await triggerBenchmarkAction();
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadTasks();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Competitor Benchmarking & Gap Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Daily automated tracking of Wirecutter & RTINGS competitor updates for US market strategy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm shadow-sm transition disabled:opacity-50"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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

          <form action={logoutAction}>
            <button
              type="submit"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg text-sm transition"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`mt-6 p-4 rounded-lg text-sm flex justify-between items-center ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-xs underline hover:no-underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters & Stats */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 w-fit">
          {['all', 'pending', 'in_progress', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === f
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredTasks.length}</span> of{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{tasks.length}</span> tasks
        </div>
      </div>

      {/* Tasks List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading benchmark tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500">
            No tasks found for this filter. Click &quot;Run Benchmark Now&quot; to fetch competitor updates.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {task.sourceName}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : task.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">
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

                {task.sourceUrl && (
                  <a
                    href={sanitizeUrl(task.sourceUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-medium text-primary hover:underline gap-1 mt-1"
                  >
                    View Competitor Article
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>

              {/* Action dropdown/selector */}
              <div className="flex items-center gap-3 min-w-[160px]">
                <label htmlFor={`status-${task.id}`} className="sr-only">
                  Update status
                </label>
                <select
                  id={`status-${task.id}`}
                  value={task.status}
                  onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
