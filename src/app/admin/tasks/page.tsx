'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTasksAction, getHistoryAction, updateTaskStatusAction, triggerBenchmarkAction, logoutAction } from './actions';
import { Task, BenchmarkRecord } from '@/types';

// Safe URL validator/sanitizer to protect against XSS and ensure link integrity
function sanitizeUrl(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // Ignore invalid url
  }
  return '#';
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<BenchmarkRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data fetching memoized with useCallback to prevent unnecessary re-renders
  const loadData = useCallback(async () => {
    try {
      const tasksRes = await getTasksAction();
      const historyRes = await getHistoryAction();

      if (tasksRes.success) {
        setTasks(tasksRes.tasks);
      } else {
        setError(tasksRes.error || 'Failed to fetch tasks.');
      }

      if (historyRes.success) {
        setHistory(historyRes.history);
      }
    } catch {
      setError('An error occurred while loading dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // UseEffect with deferred execution to prevent cascading renders
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const res = await updateTaskStatusAction(taskId, newStatus);
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
      } else {
        alert(res.error || 'Failed to update task status.');
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleTriggerBenchmark = async () => {
    setTriggering(true);
    try {
      const res = await triggerBenchmarkAction();
      if (res.success) {
        // Reload data after successful benchmark
        await loadData();
        alert('Benchmark run completed successfully!');
      } else {
        alert(res.error || 'Benchmark run failed.');
      }
    } catch {
      alert('An error occurred while running benchmark.');
    } finally {
      setTriggering(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-600 dark:text-gray-400">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Automated Competitive Benchmarking & Content Task Management
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-colors"
          >
            Logout
          </button>
          <button
            onClick={handleTriggerBenchmark}
            disabled={triggering}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
          >
            {triggering ? 'Running Benchmark...' : 'Run Benchmark Now'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats / Benchmark History */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-sm font-medium text-gray-500 block">Total Discovered Tasks</span>
          <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1 block">{tasks.length}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-sm font-medium text-gray-500 block">Pending Reviews / Guides</span>
          <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-500 mt-1 block">
            {tasks.filter(t => t.status === 'pending').length}
          </span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-sm font-medium text-gray-500 block">Last Automated Run</span>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-3 block">
            {history ? `${new Date(history.lastRun).toLocaleString()} (${history.status.toUpperCase()})` : 'Never Run'}
          </span>
          {history?.error && (
            <span className="text-xs text-red-500 block mt-1 overflow-hidden text-ellipsis whitespace-nowrap" title={history.error}>
              Error: {history.error}
            </span>
          )}
        </div>
      </div>

      {/* Tasks Table/List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generated Content Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No tasks found. Click &quot;Run Benchmark Now&quot; to discover competitor updates.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                      {task.competitor}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{task.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                  <div className="text-xs text-gray-400">
                    Source:{' '}
                    <a
                      href={sanitizeUrl(task.sourceUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded px-0.5"
                    >
                      {task.sourceUrl}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                    className="block rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-2 focus-visible:ring-primary px-3 py-1.5 cursor-pointer transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="ignored">Ignored</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
