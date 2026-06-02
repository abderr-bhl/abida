'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/admin/tasks/list');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsDone = async (id: string) => {
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'completed' }),
      });

      if (response.ok) {
        setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, status: 'completed' } : t));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      if (token === 'demo-token') {
        setTimeout(() => setAuthenticated(true), 0);
      }
    };

    const timer = setTimeout(() => {
      checkAuth();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (authenticated) {
      const timer = setTimeout(() => {
        fetchTasks();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple demo password
      localStorage.setItem('admin_token', 'demo-token');
      setAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Login
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">Demo Password: admin123</p>
        </form>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
        <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
          {pendingTasks.length} Pending Tasks
        </div>
      </div>

      <div className="grid gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Pending Tasks</h2>
          {pendingTasks.length === 0 ? (
            <p className="text-gray-500 italic">No pending tasks. Automation is running smoothly!</p>
          ) : (
            <div className="grid gap-4">
              {pendingTasks.map(task => (
                <div key={task.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {task.type}
                      </span>
                      <span className="text-xs text-gray-400">{task.competitor}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                    <a
                      href={task.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-xs font-medium hover:underline flex items-center"
                    >
                      View Source Article
                      <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  </div>
                  <button
                    onClick={() => markAsDone(task.id)}
                    className="whitespace-nowrap px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
                  >
                    Mark as Done
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {completedTasks.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 opacity-60">Completed Tasks</h2>
            <div className="grid gap-2 opacity-60">
              {completedTasks.map(task => (
                <div key={task.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 line-through">{task.title}</h3>
                    <p className="text-xs text-gray-500">Completed at {new Date().toLocaleDateString()}</p>
                  </div>
                  <span className="text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
