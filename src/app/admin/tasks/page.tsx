'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { fetchTasks, triggerBenchmark, updateTaskStatus } from './actions';
import { logoutAction } from '@/app/admin/login/actions';
import { BenchmarkTask } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<BenchmarkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [, startTransition] = useTransition();

  const loadAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAllTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAllTasks]);

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    setStatusMessage(null);
    try {
      const res = await triggerBenchmark();
      setStatusMessage(res.message);
      await loadAllTasks();
    } catch (err) {
      console.error('Failed to trigger benchmark:', err);
      setStatusMessage('Error executing benchmark job.');
    } finally {
      setRunningBenchmark(false);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus);
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
            : task
        )
      );
    });
  };

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-8 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Automated Competitive Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Daily competitor RSS feed benchmarking & content gap task queue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
          >
            {runningBenchmark ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {statusMessage && (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
          {statusMessage}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Tasks</span>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-yellow-200 dark:border-yellow-900/30 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">Pending</span>
          <p className="mt-2 text-3xl font-extrabold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-blue-200 dark:border-blue-900/30 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">In Progress</span>
          <p className="mt-2 text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-green-200 dark:border-green-900/30 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">Completed</span>
          <p className="mt-2 text-3xl font-extrabold text-green-600 dark:text-green-400">{stats.completed}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800 mb-6">
        {(['all', 'pending', 'in_progress', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 capitalize transition-colors ${
              filter === tab
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading tasks queue...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No tasks found for this filter.</p>
          <p className="text-xs text-gray-400 mt-2">Click &quot;Run Benchmark Now&quot; to fetch new competitor gaps.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => {
            const safeSourceUrl = sanitizeUrl(task.url);
            return (
              <div
                key={task.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {task.source}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
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
                        year: 'numeric'
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
                    className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                  >
                    <span>View Competitor Article</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label htmlFor={`status-${task.id}`} className="sr-only">Update Status</label>
                  <select
                    id={`status-${task.id}`}
                    value={task.status}
                    onChange={e =>
                      handleStatusChange(
                        task.id,
                        e.target.value as 'pending' | 'in_progress' | 'completed'
                      )
                    }
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
