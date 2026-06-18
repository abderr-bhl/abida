'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tasks', {
        headers: { 'Authorization': `Bearer ${password}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        setAuthorized(true);
      } else if (res.status === 401) {
        setAuthorized(false);
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (authorized) {
      // Deferring the call to prevent cascading render lint error
      const timer = setTimeout(() => {
        fetchTasks();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [authorized, fetchTasks]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchTasks();
  };

  const updateStatus = async (id: string, status: Task['status']) => {
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const runManualBenchmark = async () => {
    setLoading(true);
    try {
      await fetch('/api/cron/benchmark');
      fetchTasks();
    } catch (error) {
      console.error('Failed to run benchmark', error);
      setLoading(false);
    }
  };

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  if (loading && tasks.length === 0) return <div className="p-8 text-center">Loading tasks...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Automated Benchmark Tasks</h1>
        <button
          onClick={runManualBenchmark}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Benchmark Now'}
        </button>
      </div>

      <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No tasks found. Run benchmark to generate tasks.</td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{task.sourceUrl}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {task.competitor}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={cn(
                      "font-medium",
                      task.priority === 'high' ? "text-red-600" : "text-gray-600"
                    )}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2 py-1 text-xs font-semibold rounded-full",
                      task.status === 'completed' ? "bg-green-100 text-green-800" :
                      task.status === 'in_progress' ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    )}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => updateStatus(task.id, 'completed')}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Complete
                      </button>
                    )}
                    {task.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(task.id, 'in_progress')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Start
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
