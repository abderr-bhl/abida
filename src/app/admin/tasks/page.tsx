'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { ExternalLink, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tasks');
      const data = await res.json();
      setTasks(data.sort((a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer state update to prevent cascading render lint error
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
      }
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const runBenchmark = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/cron/benchmark');
      await fetchTasks();
    } catch (error) {
      console.error('Failed to run benchmark', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Automation Tasks</h1>
          <p className="text-gray-500 mt-1">Manage tasks generated from competitor benchmarking.</p>
        </div>
        <button
          onClick={runBenchmark}
          disabled={refreshing}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-opacity"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Benchmarking...' : 'Run Benchmark Now'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-800">
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {tasks.length === 0 ? (
            <li className="p-8 text-center text-gray-500">No tasks found. Run a benchmark to discover new content opportunities.</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {task.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {task.status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                        {task.status === 'in-progress' && <AlertCircle className="h-5 w-5 text-blue-500" />}
                        {task.status === 'ignored' && <AlertCircle className="h-5 w-5 text-gray-400" />}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-primary truncate uppercase tracking-wider">{task.type}</p>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{task.title}</h3>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="ignored">Ignored</option>
                      </select>
                      {task.sourceUrl && (
                        <a
                          href={task.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                          title="View Source"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {task.description}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400">
                      <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>Created on {new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
