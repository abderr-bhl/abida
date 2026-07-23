'use client';

import { useActionState, useState, useEffect, useCallback } from 'react';
import { triggerBenchmark, updateTaskStatus, logoutAction } from './actions';
import { Task, BenchmarkRecord } from '@/types';

interface DashboardClientProps {
  initialTasks: Task[];
  initialRecords: BenchmarkRecord[];
}

export default function DashboardClient({ initialTasks, initialRecords }: DashboardClientProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [records, setRecords] = useState<BenchmarkRecord[]>([]);
  const [filter, setFilter] = useState<string>('all');

  // Defer setting state to prevent cascading render lint errors
  useEffect(() => {
    const timer = setTimeout(() => {
      setTasks(initialTasks);
      setRecords(initialRecords);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialTasks, initialRecords]);

  // Sanitize URLs to prevent XSS
  const sanitizeUrl = useCallback((urlStr: string): string => {
    try {
      const parsed = new URL(urlStr);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      // Ignore invalid URL structures
    }
    return '#';
  }, []);

  const [benchmarkState, benchmarkFormAction, isBenchmarkPending] = useActionState(triggerBenchmark, null);
  const [, updateFormAction, isUpdatePending] = useActionState(updateTaskStatus, null);

  const filteredTasks = tasks.filter((t) => filter === 'all' || t.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-800 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Tasks Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Monitor and manage competitive intelligence tasks for reviewguid.com
          </p>
        </div>
        <div className="flex gap-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Sign Out
            </button>
          </form>
          <form action={benchmarkFormAction}>
            <button
              type="submit"
              disabled={isBenchmarkPending}
              className="px-4 py-2 text-sm font-semibold rounded-md text-gray-900 bg-accent hover:bg-amber-500 disabled:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{ color: '#111827' }}
            >
              {isBenchmarkPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
            </button>
          </form>
        </div>
      </div>

      {benchmarkState?.message && (
        <div className="p-4 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 rounded-md text-sm border border-green-200 dark:border-green-800">
          {benchmarkState.message}
        </div>
      )}
      {benchmarkState?.error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded-md text-sm border border-red-200 dark:border-red-800">
          {benchmarkState.error}
        </div>
      )}

      {/* Filter and Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Actionable Gap Tasks</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-700 rounded p-1 dark:bg-gray-800 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg text-gray-500">
              No tasks found. Run benchmark to fetch new items.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const sanitizedUrl = sanitizeUrl(task.sourceUrl);
                return (
                  <div
                    key={task.id}
                    className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 space-y-4"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="inline-block px-2 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 rounded mb-2">
                          {task.competitor}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                          {task.title}
                        </h3>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300'
                            : task.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-green-300'
                            : task.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap justify-between items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500">
                      <span>Published: {new Date(task.publishedAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-3">
                        {sanitizedUrl !== '#' && (
                          <a
                            href={sanitizedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={`View source article for ${task.title} (opens in a new tab)`}
                          >
                            Source Link ↗
                          </a>
                        )}

                        <form action={updateFormAction} className="flex items-center gap-1.5">
                          <input type="hidden" name="taskId" value={task.id} />
                          <select
                            name="status"
                            defaultValue={task.status}
                            className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1 dark:bg-gray-800 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            type="submit"
                            disabled={isUpdatePending}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            Update
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Benchmarking History Side Widget */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Execution History</h2>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-100 dark:border-gray-700 space-y-4">
            <p className="text-xs text-gray-500">
              Daily automated cron job executes at 05:00 UTC (&apos;0 5 * * *&apos;) to sync data.
            </p>
            {records.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No runs recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {records.map((rec) => (
                  <div key={rec.id} className="text-xs border-b border-gray-100 dark:border-gray-700 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {new Date(rec.triggeredAt).toLocaleString()}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rec.status === 'success'
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Created <span className="font-bold text-gray-900 dark:text-white">{rec.tasksCreatedCount}</span> tasks.
                    </p>
                    {rec.error && (
                      <p className="text-red-500 dark:text-red-400 mt-1 italic truncate" title={rec.error}>
                        Err: {rec.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
