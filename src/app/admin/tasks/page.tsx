'use client';

import { useState, useEffect, useCallback } from 'react';
import { TaskItem } from '@/lib/automation/benchmark';
import { getTasksServer, updateTaskStatus, triggerBenchmark, logoutAction } from './actions';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [message, setMessage] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTasksServer();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
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

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    const res = await updateTaskStatus(taskId, newStatus);
    if (res.success) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } else {
      setMessage(`Failed to update status: ${res.error}`);
    }
  };

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    setMessage(null);
    try {
      const res = await triggerBenchmark();
      if (res.success) {
        setMessage(`Benchmark complete! Added ${res.addedCount} new tasks.`);
        await fetchTasks();
      } else {
        setMessage(`Benchmark failed: ${res.error}`);
      }
    } catch {
      setMessage('Benchmark execution error.');
    } finally {
      setRunningBenchmark(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Automated Task Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Daily competitive benchmarking tasks generated automatically from US market competitors.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {runningBenchmark ? 'Running Benchmark...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={() => logoutAction()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
          {message}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        {(['all', 'pending', 'in_progress', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
              filter === tab
                ? 'bg-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab.replace('_', ' ')} ({tasks.filter(t => tab === 'all' || t.status === tab).length})
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No tasks found matching filter.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Task Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Competitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {task.description}
                      </div>
                      <a
                        href={task.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        View Source Article →
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {task.competitor}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : task.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value as 'pending' | 'in_progress' | 'completed')}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
