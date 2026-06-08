'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  // In a real app, these would be environment variables
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
  const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN || 'demo_admin_token';

  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const res = await fetch('/api/admin/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
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
    if (token === AUTH_TOKEN) {
      // Defer state update to avoid cascading render warning
      setTimeout(() => {
        setIsAuthenticated(true);
        fetchTasks();
      }, 0);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, [fetchTasks, AUTH_TOKEN]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_token', AUTH_TOKEN);
      setIsAuthenticated(true);
      fetchTasks();
    } else {
      alert('Invalid password');
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <form onSubmit={handleLogin} className="p-8 border border-gray-200 rounded-lg shadow-sm w-96">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <button type="submit" className="w-full bg-primary text-white p-2 rounded hover:bg-blue-700">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Automated Content Tasks</h1>
        <button
          onClick={() => { localStorage.removeItem('admin_token'); setIsAuthenticated(false); }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Logout
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <li className="p-6 text-center text-gray-500">No tasks generated yet.</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full mr-3 ${
                        task.type === 'guide' ? 'bg-blue-100 text-blue-800' :
                        task.type === 'review' ? 'bg-green-100 text-green-800' :
                        task.type === 'comparison' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.type.toUpperCase()}
                      </span>
                      <h2 className="text-lg font-bold text-gray-900">{task.title}</h2>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{task.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      <a href={task.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        View Source Article →
                      </a>
                    </div>
                  </div>
                  <div className="ml-6 flex items-center space-x-2">
                    {task.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'ignored')}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                        >
                          Ignore
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    )}
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
