'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { CheckCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react';

export default function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const AUTH_TOKEN = 'demo-token'; // In production, this would come from a proper auth flow

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/admin/tasks', {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify({ taskId, status }),
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple demo password
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Admin Access</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <button type="submit" className="w-full bg-primary text-white py-2 rounded">Login</button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Automated Content Tasks</h1>
        <button
          onClick={() => {
            setLoading(true);
            fetch('/api/cron/benchmark?token=demo-token').then(() => fetchTasks());
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Run Benchmark Now
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No tasks generated yet.</td>
              </tr>
            ) : (
              tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(task.status)}
                      <span className="ml-2 text-sm capitalize">{task.status.replace('-', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{task.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${task.type === 'review' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {task.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={task.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                      aria-label="View source article (opens in a new tab)"
                    >
                      View <ExternalLink className="ml-1 w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
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
