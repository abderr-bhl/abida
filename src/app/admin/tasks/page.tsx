'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { RefreshCcw, ExternalLink, Trash2, CheckCircle } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Using setTimeout to avoid synchronous setState in effect as per project standards
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/cron/benchmark');
      await fetchTasks();
    } catch (error) {
      console.error('Failed to refresh benchmarks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const updateStatus = async (id: string, status: Task['status']) => {
    try {
      await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/admin/tasks?id=${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading tasks...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Strategy Dashboard</h1>
          <p className="text-gray-500 mt-1">Automated tasks from competitor benchmarking</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Running Benchmark...' : 'Run Benchmark Now'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                  No tasks found. Run a benchmark to discover content gaps.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.competitor === 'Wirecutter' ? 'bg-black text-white' : 'bg-red-100 text-red-800'
                    }`}>
                      {task.competitor}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{task.title}</span>
                      <a
                        href={task.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        View original <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold uppercase ${
                      task.priority === 'high' ? 'text-red-600' :
                      task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value as Task['status'])}
                      className="text-sm bg-gray-50 border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center gap-3">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus(task.id, 'completed')}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as completed"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete task"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
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
