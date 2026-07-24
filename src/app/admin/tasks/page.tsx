'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { getTasks, updateTaskStatus, triggerBenchmark, logout } from './actions';
import { Task } from '@/types';

function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
  }
  return '#';
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  // Memoized fetch helper to prevent re-renders and satisfy React dependency array
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await getTasks();
      setTasks(data);
    } catch {
      setErrorMessage('Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch tasks on initial render, deferred using setTimeout to satisfy cascading render prevention
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const result = await updateTaskStatus(taskId, newStatus);
      if (result.success) {
        setSuccessMessage('Task status updated successfully.');
        fetchTasks();
      } else {
        setErrorMessage(result.error || 'Failed to update task.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred.');
    }
  };

  const handleRunBenchmark = () => {
    setSuccessMessage('');
    setErrorMessage('');
    startTransition(async () => {
      try {
        const result = await triggerBenchmark();
        if (result.success) {
          setSuccessMessage(`Benchmark executed successfully! Generated ${result.count} new task(s).`);
          fetchTasks();
        } else {
          setErrorMessage(result.error || 'Failed to execute benchmark.');
        }
      } catch {
        setErrorMessage('Failed to execute benchmark.');
      }
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage competitor benchmarking tasks and content generation.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRunBenchmark}
              disabled={isPending || isLoading}
              className="px-4 py-2 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Running Benchmark...' : 'Run Benchmark Now'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm transition-colors text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Status Alerts */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-900 dark:text-green-300 rounded-lg text-sm font-medium">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 rounded-lg text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Tasks List Table */}
        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generated Tasks</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <span className="inline-block animate-pulse font-medium">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
              No tasks found. Click &quot;Run Benchmark Now&quot; to discover competitor activities and generate content tasks.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task Info</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Competitor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source Link</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {tasks.map((task) => {
                    const cleanUrl = sanitizeUrl(task.sourceUrl);
                    return (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{task.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{task.competitor}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {cleanUrl !== '#' ? (
                            <a
                              href={cleanUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                            >
                              View Competitor Article
                            </a>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600 italic">Invalid Link</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                            className="block w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="ignored">Ignored</option>
                          </select>
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
    </div>
  );
}
