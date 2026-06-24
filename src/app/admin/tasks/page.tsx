'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Play,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { fetchTasksAction, runBenchmarkAction, updateTaskStatusAction } from './actions';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasksAction();
      setTasks(data);
    } catch (_err) {
      setError('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const handleRunBenchmark = async () => {
    setRunning(true);
    try {
      await runBenchmarkAction();
      await loadTasks();
    } catch (_err) {
      setError('Erreur lors de l\'exécution du benchmark');
    } finally {
      setRunning(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: Task['status']) => {
    try {
      const success = await updateTaskStatusAction(taskId, status);
      if (!success) throw new Error('Failed to update task');
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (_err) {
      setError('Erreur lors de la mise à jour de la tâche');
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'ignored': return <XCircle className="w-5 h-5 text-gray-400" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord des tâches</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez les opportunités de contenu identifiées par le benchmarking.</p>
        </div>
        <button
          onClick={handleRunBenchmark}
          disabled={running}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Play className={cn("w-4 h-4 mr-2", running && "animate-spin")} />
          {running ? 'Exécution...' : 'Lancer le benchmark'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.length === 0 ? (
              <li className="px-6 py-12 text-center text-gray-500">Aucune tâche trouvée.</li>
            ) : (
              tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((task) => (
                <li key={task.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {task.title}
                        </h3>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium uppercase",
                          task.competitor === 'Wirecutter' ? "bg-black text-white" : "bg-red-600 text-white"
                        )}>
                          {task.competitor}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                        <span>Créé le: {new Date(task.createdAt).toLocaleDateString()}</span>
                        <a
                          href={task.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-500 hover:underline"
                          aria-label={`Voir l'article original sur ${task.competitor} (opens in a new tab)`}
                        >
                          Voir la source <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as Task['status'])}
                        className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="pending">En attente</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminé</option>
                        <option value="ignored">Ignoré</option>
                      </select>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
