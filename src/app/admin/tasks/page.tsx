'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '../../../types';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === 'demo_admin_token') {
      // Use setTimeout to avoid cascading renders warning in lint
      setTimeout(() => {
        setIsAuthenticated(true);
        fetchTasks();
      }, 0);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, [fetchTasks]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a call to a login API that returns a JWT
    // For this demo, we use a simple check and a fixed token
    if (password === 'admin123') {
      localStorage.setItem('admin_token', 'demo_admin_token');
      setIsAuthenticated(true);
      fetchTasks();
    } else {
      alert('Incorrect password');
    }
  };

  const updateTaskStatus = async (task: Task, newStatus: Task['status']) => {
    const updated = { ...task, status: newStatus };
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Manage automated tasks generated from competitor benchmarking.
          </p>
        </div>
        <button
          onClick={() => { localStorage.removeItem('admin_token'); setIsAuthenticated(false); }}
          className="mt-4 sm:mt-0 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Logout
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.length === 0 ? (
            <li className="p-8 text-center text-gray-500">No tasks found. Run benchmarking to generate tasks.</li>
          ) : (
            tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((task) => (
              <li key={task.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-primary truncate">{task.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-500 space-x-4">
                      <span>Category: {task.category}</span>
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      {task.sourceUrl && (
                        <a
                          href={task.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          Source Link
                          <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task, e.target.value as Task['status'])}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
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
