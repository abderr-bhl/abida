'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '@/types';
import { getTasks, updateTaskStatus, runBenchmark } from './actions';
import { logout } from '../login/actions';
import { cn } from '@/lib/utils';
import { RefreshCw, ExternalLink, LogOut, CheckCircle, Clock, Play } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const fetchTasks = useCallback(async () => {
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
    // Using setTimeout to avoid hydration/render issues
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleStatusUpdate = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, status);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    } catch {
      alert('Failed to update status');
    }
  };

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    try {
      const result = await runBenchmark();
      alert(`Benchmark completed. Found ${result.newTasksFound} new tasks.`);
      fetchTasks();
    } catch {
      alert('Failed to run benchmark');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in-progress': return <Play className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Competitive Benchmarking Tasks</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleRunBenchmark}
              disabled={isRunning}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRunning && "animate-spin")} />
              {isRunning ? 'Running...' : 'Run Benchmark Now'}
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No tasks found. Run a benchmark to discover new content opportunities.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={cn(
                        "text-xs font-bold uppercase px-2 py-1 rounded mr-3",
                        task.priority === 'high' ? "bg-red-100 text-red-700" :
                        task.priority === 'medium' ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {task.priority}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(task.createdAt).toLocaleDateString()} • {task.competitor}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{task.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{task.description}</p>
                    {task.sourceUrl && (
                      <a
                        href={task.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline mb-4"
                      >
                        View Original Source <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">{task.status}</span>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task.id, e.target.value as TaskStatus)}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
