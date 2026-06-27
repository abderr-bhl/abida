'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { fetchTasksAction, runBenchmarkAction, updateTaskStatusAction } from './actions';
import { logoutAction } from '../login/actions';
import { ExternalLink, RefreshCw, CheckCircle, XCircle, Clock, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasksAction();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Small delay to avoid hydration issues if any
    const timer = setTimeout(() => {
      loadTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    try {
      await runBenchmarkAction();
      await loadTasks();
    } catch (err) {
      console.error('Benchmark failed:', err);
    } finally {
      setRunningBenchmark(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: Task['status']) => {
    try {
      await updateTaskStatusAction(taskId, status);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (err) {
      console.error('Update status failed:', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement des tâches...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de Bord des Tâches Automatisées</h1>
        <div className="flex gap-4">
          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", runningBenchmark && "animate-spin")} />
            {runningBenchmark ? 'Benchmark en cours...' : 'Lancer Benchmark Manuel'}
          </button>
          <button
            onClick={() => logoutAction()}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâche</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Aucune tâche pour le moment. Lancez un benchmark !</td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                    <div className="mt-2">
                       <a
                        href={task.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline inline-flex items-center gap-1 text-xs"
                        aria-label={`${task.title} (opens in a new tab)`}
                      >
                        Voir la source <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {task.sourceName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={cn(
                      "flex items-center gap-1",
                      task.status === 'completed' && "text-green-600",
                      task.status === 'ignored' && "text-red-600",
                      task.status === 'pending' && "text-yellow-600"
                    )}>
                      {task.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                      {task.status === 'ignored' && <XCircle className="w-4 h-4" />}
                      {task.status === 'pending' && <Clock className="w-4 h-4" />}
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition"
                        title="Marquer comme complété"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'ignored')}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition"
                        title="Ignorer"
                      >
                        <XCircle className="w-5 h-5" />
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
