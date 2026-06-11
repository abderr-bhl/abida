'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { ExternalLink, CheckCircle, Clock, Play } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (_err) {
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (response.ok) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      }
    } catch (_err) {
      console.error('Failed to update task status');
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Play className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Automated Task Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Content opportunities from competitor benchmarking</p>
        </div>
        <button
          onClick={() => fetchTasks()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Feed
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-800">
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {tasks.length === 0 ? (
            <li className="p-8 text-center text-gray-500">No tasks found. Run a benchmark to discover opportunities.</li>
          ) : (
            tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((task) => (
              <li key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.competitor === 'Wirecutter' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.competitor}
                      </span>
                      <span className="text-sm text-gray-500">{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {task.title}
                    </h2>
                    <div className="mt-2 flex items-center gap-4">
                      <a
                        href={task.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline gap-1"
                        aria-label={`View source article for ${task.title} (opens in a new tab)`}
                      >
                        Source Article <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="ml-6 flex items-center gap-4">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="text-sm font-medium capitalize">{task.status.replace('-', ' ')}</span>
                      </div>
                      <div className="flex gap-2">
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-100"
                          >
                            Mark Complete
                          </button>
                        )}
                        {task.status === 'pending' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in-progress')}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                          >
                            Start Task
                          </button>
                        )}
                      </div>
                    </div>
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
