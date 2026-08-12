'use client';

import { useState, useTransition } from 'react';
import { Task } from '@/lib/automation/benchmark';
import { updateTaskStatus, triggerBenchmark, logoutAction } from './actions';
import { sanitizeUrl } from '@/lib/sanitize';

interface TaskListProps {
  initialTasks: Task[];
}

export default function TaskList({ initialTasks }: TaskListProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'completed' | 'ignored') => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setMessage(`Task status updated to ${newStatus}.`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRunBenchmark = () => {
    startTransition(async () => {
      try {
        const res = await triggerBenchmark();
        if (res.success) {
          setMessage(res.message);
        } else {
          setError(res.message);
        }
        setTimeout(() => setMessage(null), 5000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Benchmark execution failed.');
        setTimeout(() => setError(null), 5000);
      }
    });
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Benchmarking Content Gaps</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor and manage articles identified from competitors (Wirecutter & RTINGS).
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="px-5 py-2.5 bg-[#0060df] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer text-sm"
          >
            {isPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Task List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Content Tasks ({initialTasks.length})</h2>
        </div>

        {initialTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No tasks found. Run benchmark above to crawl competitor RSS feeds.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {initialTasks.map((task) => {
              const safeUrl = sanitizeUrl(task.sourceUrl);
              return (
                <div key={task.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1 max-w-3xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          task.source === 'Wirecutter'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                        }`}>
                          {task.source}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : task.status === 'ignored'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white pt-1">{task.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{task.description}</p>
                      {safeUrl && (
                        <div className="pt-2">
                          <a
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                          >
                            View original article
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Status Management Actions */}
                    <div className="flex flex-row md:flex-col gap-2 self-start flex-wrap">
                      <button
                        onClick={() => handleStatusChange(task.id, 'pending')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          task.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'completed')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          task.status === 'completed'
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                      >
                        Completed
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'ignored')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          task.status === 'ignored'
                            ? 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                      >
                        Ignore
                      </button>
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
