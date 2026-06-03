'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';

export default function AdminTasks() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/tasks/list');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError('Could not load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === 'admin123') {
      // Defer to avoid cascading renders warning
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
    if (password === 'admin123') {
      localStorage.setItem('admin_token', 'admin123');
      setIsAuthenticated(true);
      fetchTasks();
    } else {
      alert('Invalid password');
    }
  };

  const markAsDone = async (id: string) => {
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'completed' }),
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: 'completed' } : t));
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <form onSubmit={handleLogin} className="p-8 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
            placeholder="Enter password"
          />
          <button type="submit" className="bg-primary text-white w-full py-2 rounded font-bold">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Automated Tasks Dashboard</h1>
        <button
          onClick={() => { localStorage.removeItem('admin_token'); setIsAuthenticated(false); }}
          className="text-sm text-gray-500 hover:text-red-500"
        >
          Logout
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <li className="p-6 text-center text-gray-500">No tasks found. Run benchmark to generate tasks.</li>
          ) : (
            tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((task) => (
              <li key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.priority}
                      </span>
                      <p className="text-sm text-gray-500">{task.source} • {new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mt-2 truncate">
                      {task.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {task.description}
                    </p>
                    <div className="mt-2">
                      <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-medium hover:underline">
                        View Source Article →
                      </a>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => markAsDone(task.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Mark as Done
                      </button>
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
