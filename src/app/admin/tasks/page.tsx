'use client';

import { useEffect, useState, useCallback } from 'react';
import { Task } from '@/types';
import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('No admin token found');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/admin/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Task Dashboard</h1>

      <div className="grid gap-6">
        {tasks.length === 0 ? (
          <p className="text-gray-500 italic">No automated tasks yet. Benchmark cron might need to run.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">{task.competitor}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{task.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{task.description}</p>

                {task.sourceUrl && (
                  <a
                    href={task.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    aria-label={`View source article (opens in a new tab)`}
                  >
                    View Source <ExternalLink className="ml-1 w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-4">
                 <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    {task.status === 'done' ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                     task.status === 'in-progress' ? <Clock className="w-5 h-5 text-blue-500" /> :
                     <AlertCircle className="w-5 h-5 text-gray-400" />}
                    <span className="capitalize">{task.status.replace('-', ' ')}</span>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
