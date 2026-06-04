'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Simple client-side auth for demo
    const token = localStorage.getItem('admin_token');
    if (token === 'admin123') {
      setTimeout(() => {
        setIsAuthenticated(true);
        fetchTasks();
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
      alert('Wrong password (try admin123)');
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <form onSubmit={handleLogin} className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Admin Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mb-4 focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Password"
          />
          <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Automated Content Tasks</h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-semibold">Competitive Intelligence: Wirecutter & RTINGS</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem('admin_token'); setIsAuthenticated(false); }}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500">No pending tasks. Everything is up to date with competitors!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {tasks.map(task => (
            <div key={task.id} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 ${task.status === 'completed' ? 'border-green-500' : task.status === 'ignored' ? 'border-gray-300' : 'border-yellow-500'} border border-gray-200 dark:border-gray-700`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${task.competitor === 'Wirecutter' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
                      {task.competitor}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{task.description}</p>
                  <a
                    href={task.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    View Source <span className="text-[10px]">↗</span>
                  </a>
                </div>
                <div className="flex md:flex-col gap-2 justify-end min-w-[140px]">
                  {task.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        Mark Done
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'ignored')}
                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        Ignore
                      </button>
                    </>
                  )}
                  {task.status !== 'pending' && (
                    <span className={`text-center py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {task.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
