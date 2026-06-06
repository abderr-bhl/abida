'use client';

import { useState, useEffect } from 'react';
import { Task } from '../../../types';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.sort((a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('admin_token');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === 'demo_admin_token') {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setIsAuthenticated(true), 0);
    } else {
      setTimeout(() => setIsLoading(false), 0);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // fetchTasks sets loading state, wrap in setTimeout to avoid lint error
      setTimeout(() => fetchTasks(), 0);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      localStorage.setItem('admin_token', 'demo_admin_token');
      setIsAuthenticated(true);
    } else {
      alert('Invalid password (hint: admin123)');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taskId, status: newStatus }),
      });

      if (response.ok) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Admin Dashboard</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Please sign in to manage tasks</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <input
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Automated Content Tasks</h1>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">No tasks found. Run benchmark to generate tasks.</div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mb-2 ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority.toUpperCase()} PRIORITY
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h2>
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: <span className="font-medium capitalize">{task.type}</span></span>
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      <a
                        href={task.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Source Article
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
