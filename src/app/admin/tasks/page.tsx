'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '../../../types';

export default function AdminTasksPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        setError('Failed to load tasks');
      }
    } catch (err) {
      setError('An error occurred while fetching tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === 'demo_admin_token') {
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
    // In production, this would verify against a backend or use a proper auth provider
    if (password === 'admin123') {
      localStorage.setItem('admin_token', 'demo_admin_token');
      setIsAuthenticated(true);
      fetchTasks();
    } else {
      alert('Invalid password');
    }
  };

  const markAsDone = async (id: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status: 'completed' }),
      });
      if (response.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: 'completed' as const } : t));
      }
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const sanitizeUrl = (url?: string) => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : '';
    } catch {
      return '';
    }
  };

  if (loading && !isAuthenticated) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Automated Content Tasks</h1>
        <button
          onClick={fetchTasks}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

      <div className="grid gap-6">
        {tasks.length === 0 ? (
          <p className="text-gray-500 italic text-center py-10">No tasks generated yet. Tasks appear when competitors publish new content.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={`p-6 border rounded-lg shadow-sm ${task.status === 'completed' ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-gray-500">{task.competitor}</span>
                  </div>
                  <h2 className="text-xl font-semibold">{task.title}</h2>
                </div>
                {task.status !== 'completed' && (
                  <button
                    onClick={() => markAsDone(task.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Mark as Done
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-4">{task.description}</p>
              {task.sourceUrl && (
                <a
                  href={sanitizeUrl(task.sourceUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  aria-label="View original article (opens in a new tab)"
                >
                  View original article
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
