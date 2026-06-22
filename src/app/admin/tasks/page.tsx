'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { ExternalLink, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Use public env var for token if available, otherwise fallback to 'admin' for dev
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin';

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tasks', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
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
  }, [adminToken]);

  useEffect(() => {
    // Small delay to avoid hydration issues/cascading renders in some Next.js versions
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const triggerBenchmark = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'trigger-benchmark' })
      });
      await fetchTasks();
    } catch (error) {
      console.error('Failed to trigger benchmark:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const updateStatus = async (taskId: string, status: string) => {
    try {
      await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update-status',
          taskId,
          status
        })
      });
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) return <div className="p-8">Chargement des tâches...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord des tâches</h1>
        <button
          onClick={triggerBenchmark}
          disabled={refreshing}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Run Benchmark Now
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâche</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  Aucune tâche trouvée. Lancez un benchmark pour commencer.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                    <div className="text-sm text-gray-500">{task.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={task.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm focus-visible:ring-2 focus:outline-none"
                      aria-label={`Voir la source : ${task.title} (ouvre dans un nouvel onglet)`}
                    >
                      Voir source <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    {task.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(task.id, 'completed')}
                          className="text-green-600 hover:text-green-900" title="Marquer comme fait"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateStatus(task.id, 'ignored')}
                          className="text-gray-400 hover:text-gray-600" title="Ignorer"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
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
