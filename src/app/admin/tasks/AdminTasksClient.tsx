'use client';

import { useState, useTransition } from 'react';
import { BenchmarkTask, TaskStatus } from '@/lib/automation/benchmark';
import { triggerBenchmark, updateTaskStatus, logout } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

interface AdminTasksClientProps {
  initialTasks: BenchmarkTask[];
}

export default function AdminTasksClient({ initialTasks }: AdminTasksClientProps) {
  const [tasks, setTasks] = useState<BenchmarkTask[]>(initialTasks);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleRunBenchmark = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await triggerBenchmark();
      if (res.message) {
        setMessage(res.message);
      }
      if (res.success) {
        window.location.reload();
      }
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus);
    });
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Competitor Automated Tasks Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated benchmark tasks generated from US competitor market updates (Wirecutter, RTINGS)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
          </button>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-sm font-medium border border-blue-200 dark:border-blue-800">
          {message}
        </div>
      )}

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Tasks</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
        </div>
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
          <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">Pending</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
        </div>
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</p>
        </div>
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
          <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Completed</p>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{completedCount}</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Status:</span>
        <div className="flex gap-2">
          {['all', 'pending', 'in_progress', 'completed', 'ignored'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No tasks found matching the selected filter.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredTasks.map((task) => (
              <li key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                        {task.competitor}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Published: {new Date(task.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {task.description}
                    </p>
                    {task.url && (
                      <a
                        href={sanitizeUrl(task.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:underline font-medium"
                      >
                        View Original Competitor Article →
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <label htmlFor={`status-${task.id}`} className="sr-only">Status</label>
                    <select
                      id={`status-${task.id}`}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="block text-sm font-semibold rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary shadow-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="ignored">Ignored</option>
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
