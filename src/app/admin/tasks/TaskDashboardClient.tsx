'use client';

import { useState, useTransition } from 'react';
import { Task, TaskStatus } from '@/types';
import { updateTaskStatus, triggerBenchmark, logoutAdmin } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

interface TaskDashboardClientProps {
  initialTasks: Task[];
}

export default function TaskDashboardClient({ initialTasks }: TaskDashboardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    startTransition(async () => {
      const result = await updateTaskStatus(taskId, newStatus);
      if (result.success) {
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
        setMessage(`Task status updated to ${newStatus}`);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    });
  };

  const handleRunBenchmark = () => {
    startTransition(async () => {
      setMessage('Running competitor benchmark...');
      const result = await triggerBenchmark();
      if (result.success) {
        setMessage(`Benchmark completed! Added ${result.added || 0} new tasks.`);
      } else {
        setMessage(`Benchmark error: ${result.error}`);
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdmin();
    });
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Automated competitive benchmarking & task management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="bg-primary hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
          >
            {isPending ? 'Running...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-sm">
          {message}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{tasks.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending</p>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</p>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{inProgressCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
          <p className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-2">{completedCount}</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Benchmarked Content Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No tasks found. Click &quot;Run Benchmark Now&quot; to fetch competitor RSS feeds and generate tasks.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => {
              const safeSourceUrl = sanitizeUrl(task.sourceUrl);
              return (
                <div key={task.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 dark:text-white text-lg">{task.title}</span>
                      {task.source && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                          {task.source}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                    {safeSourceUrl !== '#' && (
                      <a
                        href={safeSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View source article (opens in a new tab)"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Source Article →
                      </a>
                    )}
                    <p className="text-xs text-gray-400">
                      Created: {new Date(task.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      disabled={isPending}
                      className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
    </div>
  );
}
