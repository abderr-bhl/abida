'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { getTasks, triggerBenchmark, updateTaskStatus, handleLogout } from './actions';
import { RefreshCw, ExternalLink, CheckCircle, Clock, AlertCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Small delay to prevent hydration issues with server-to-client transitions
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleRunBenchmark = async () => {
    setIsRefreshing(true);
    try {
      await triggerBenchmark();
      await fetchTasks();
    } catch (error) {
      console.error('Failed to run benchmark:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'todo': return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRunBenchmark}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? 'Benchmarking...' : 'Run Benchmark Now'}
            </button>
            <button
              onClick={() => handleLogout()}
              className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Automated Tasks ({tasks.length})</h2>
          <p className="text-sm text-gray-500">Based on competitor content gaps</p>
        </div>

        {isLoading && tasks.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 p-12 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                <p className="text-gray-500">No tasks found. Run a benchmark to discover content opportunities.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          task.competitor === 'Wirecutter' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {task.competitor}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{task.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{task.description}</p>

                      <a
                        href={task.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:underline"
                      >
                        View Source <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 min-w-[140px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        {getStatusIcon(task.status)}
                        <span className="text-sm font-medium capitalize">{task.status.replace('-', ' ')}</span>
                      </div>

                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-primary focus:border-primary block w-full p-2 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archive</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
