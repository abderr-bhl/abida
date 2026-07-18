'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchTasksAction, updateTaskStatus, triggerBenchmark, logoutAdmin } from './actions';
import { Task } from '@/types';
import { ExternalLink, RefreshCw, LogOut, CheckCircle, Clock } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningBenchmark, setRunningBenchmark] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTasksAction();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tasks. Please ensure you are authenticated.');
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

  const handleRunBenchmark = async () => {
    try {
      setRunningBenchmark(true);
      setError(null);
      const record = await triggerBenchmark();
      alert(`Benchmark run complete! Generated ${record.tasksGenerated} new tasks.`);
      await loadTasks();
    } catch (err) {
      console.error(err);
      setError('Failed to run benchmark.');
    } finally {
      setRunningBenchmark(false);
    }
  };

  const handleStatusToggle = async (taskId: string, currentStatus: 'pending' | 'completed') => {
    const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await updateTaskStatus(taskId, nextStatus);
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
    } catch (err) {
      console.error(err);
      alert('Failed to update task status.');
    }
  };

  // URL Sanitizer to prevent XSS and malicious input (starts with http/https)
  const sanitizeUrl = (urlStr: string): string => {
    if (!urlStr) return '';
    try {
      const parsed = new URL(urlStr);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      // Catch bad URLs
    }
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitor and prioritize product research opportunities from Wirecutter and RTINGS feeds
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:outline-none disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${runningBenchmark ? 'animate-spin' : ''}`} />
            {runningBenchmark ? 'Benchmarking...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={() => logoutAdmin()}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No content gap tasks found.</p>
            <button
              onClick={handleRunBenchmark}
              disabled={runningBenchmark}
              className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
            >
              Scan Competitor Feeds Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-950">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Task
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-32">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-36">
                    Date Detected
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-32">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {tasks.map((task) => {
                  const safeUrl = sanitizeUrl(task.url);
                  return (
                    <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{task.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</div>
                        {safeUrl ? (
                          <div className="mt-2">
                            <a
                              href={safeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View competitor article for ${task.title} (opens in a new tab)`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus:outline-none rounded"
                            >
                              View Competitor Article
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-red-500 dark:text-red-400 block mt-2">
                            [Invalid or Unsafe Competitor Link]
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            task.source === 'Wirecutter'
                              ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200'
                              : 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200'
                          }`}
                        >
                          {task.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {task.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200'
                          }`}
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <Clock className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                          )}
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleStatusToggle(task.id, task.status)}
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus:outline-none ${
                            task.status === 'completed'
                              ? 'border-gray-300 hover:bg-gray-100 text-gray-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 focus-visible:ring-gray-400'
                              : 'border-green-600 hover:bg-green-50 text-green-700 dark:border-green-500/50 dark:hover:bg-green-950/40 dark:text-green-400 focus-visible:ring-green-500'
                          }`}
                        >
                          {task.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
