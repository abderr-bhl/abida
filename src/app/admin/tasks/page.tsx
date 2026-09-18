'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { BenchmarkTask, TaskFilter, TaskStatus } from '@/lib/automation/types';
import { sanitizeUrl } from '@/lib/sanitize';
import {
  getTasksAction,
  triggerBenchmarkAction,
  updateTaskStatusAction,
  logoutAction,
} from './actions';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<BenchmarkTask[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTasksAction();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleRunBenchmark = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await triggerBenchmarkAction();
      setMessage(res.message);
      await fetchTasks();
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    startTransition(async () => {
      const res = await updateTaskStatusAction(taskId, newStatus);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    });
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Automated Task Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Competitive Benchmarking Tasks generated from Wirecutter & RTINGS feeds.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="px-4 py-2 bg-primary hover:bg-blue-700 text-white font-medium text-sm rounded-md shadow-sm transition-colors disabled:opacity-50"
          >
            {isPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
          </button>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-md transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
          {message}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['all', 'pending', 'in_progress', 'completed'] as TaskFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`py-2 px-4 text-sm font-medium border-b-2 capitalize transition-colors ${
              filter === f
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {f.replace('_', ' ')} (
            {f === 'all' ? tasks.length : tasks.filter((t) => t.status === f).length})
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading benchmark tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No tasks found for status &quot;{filter.replace('_', ' ')}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    {task.competitorSource}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {task.description}
                </p>
                {task.competitorUrl && (
                  <a
                    href={sanitizeUrl(task.competitorUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-primary hover:underline font-medium mt-1"
                  >
                    View Original Competitor Article →
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor={`status-${task.id}`} className="sr-only">
                  Task Status
                </label>
                <select
                  id={`status-${task.id}`}
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task.id, e.target.value as TaskStatus)
                  }
                  disabled={isPending}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
