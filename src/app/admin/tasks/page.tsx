'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { Loader2, RefreshCw, ExternalLink, CheckCircle, Clock } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tasks', {
        headers: {
          'Authorization': 'Bearer admin'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch {
      setError('Impossible de charger les tâches. Vérifiez votre connexion.');
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

  const handleTriggerBenchmark = async () => {
    setTriggering(true);
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin'
        },
        body: JSON.stringify({ action: 'trigger' })
      });
      if (!res.ok) throw new Error('Failed to trigger benchmark');
      await fetchTasks();
    } catch {
      alert('Erreur lors du déclenchement du benchmark');
    } finally {
      setTriggering(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin'
        },
        body: JSON.stringify({ action: 'update', taskId, status })
      });
      if (!res.ok) throw new Error('Failed to update task');
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: status as Task['status'] } : t));
    } catch {
      alert('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage automated content tasks from competitive benchmarking.</p>
        </div>
        <button
          onClick={handleTriggerBenchmark}
          disabled={triggering}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {triggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Run Benchmark Now
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-800">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            No tasks found. Run a benchmark to discover new content opportunities.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {tasks.map((task) => (
              <li key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                      <span className="text-sm text-gray-500">{task.competitor}</span>
                      <span className="text-xs text-gray-400">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {task.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                    <a
                      href={task.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                      aria-label="View source article (opens in a new tab)"
                    >
                      View Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Mark as completed"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                    )}
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'in-progress')}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as in-progress"
                      >
                        <Clock className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
