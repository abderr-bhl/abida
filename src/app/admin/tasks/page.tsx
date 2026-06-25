'use client';

import { useEffect, useState, useCallback } from 'react';
import { Task } from '@/types';
import { triggerBenchmarkAction, updateTaskStatusAction, fetchTasksAction } from './actions';
import { RefreshCw, ExternalLink, CheckCircle, Clock, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTasksAction();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Delay initial fetch to avoid cascading renders
    const timer = setTimeout(() => {
      loadTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    try {
      await triggerBenchmarkAction();
      await loadTasks();
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, status: Task['status']) => {
    try {
      await updateTaskStatusAction(taskId, status);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
        <button
          onClick={handleRunBenchmark}
          disabled={isRunning}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isRunning && "animate-spin")} />
          {isRunning ? 'Running...' : 'Run Benchmark Now'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.length === 0 ? (
              <li className="px-6 py-12 text-center text-gray-500">No tasks found. Run a benchmark to discover content.</li>
            ) : (
              tasks.map((task) => (
                <li key={task.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          task.status === 'completed' ? "bg-green-100 text-green-800" :
                          task.status === 'in-progress' ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        )}>
                          {task.status}
                        </span>
                        <span className="text-xs text-gray-400">{task.source}</span>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                        {task.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <a
                          href={task.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          View Original <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-xs text-gray-400">
                          Detected: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusUpdate(task.id, 'completed')}
                          className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50"
                          title="Mark as completed"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(task.id, 'in-progress')}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                          title="Start working"
                        >
                          <Clock className="w-5 h-5" />
                        </button>
                      )}
                      {task.status !== 'archived' && (
                        <button
                          onClick={() => handleStatusUpdate(task.id, 'archived')}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          title="Archive"
                        >
                          <Archive className="w-5 h-5" />
                        </button>
                      )}
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
