'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTasksAction, updateTaskStatusAction, runBenchmarkAction, logout } from './actions';
import { Task } from '@/types';
import { ExternalLink, RefreshCw, LogOut, CheckCircle, Clock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    const data = await getTasksAction();
    setTasks(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Defer initial fetch to avoid hydration issues
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleStatusUpdate = async (taskId: string, status: Task['status']) => {
    const success = await updateTaskStatusAction(taskId, status);
    if (success) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
    }
  };

  const handleRunBenchmark = async () => {
    setIsRefreshing(true);
    await runBenchmarkAction();
    await fetchTasks();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage automated content tasks generated from competitor benchmarking.
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleRunBenchmark}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            Run Benchmark Now
          </button>
          <button
            onClick={() => logout()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              No tasks found. Run a benchmark to discover content gaps.
            </li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-primary truncate">{task.title}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        task.status === 'completed' ? "bg-green-100 text-green-800" :
                        task.status === 'in_progress' ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      )}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                      <span>Source: {task.competitor}</span>
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      {task.sourceUrl && (
                        <a
                          href={task.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                          aria-label={`View source article for ${task.title} (opens in a new tab)`}
                        >
                          View Source <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'in_progress')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Start Task"
                      >
                        <Play className="h-5 w-5" />
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'completed')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                        title="Complete Task"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    {task.status !== 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'pending')}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                        title="Reset to Pending"
                      >
                        <Clock className="h-5 w-5" />
                      </button>
                    )}
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
