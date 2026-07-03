'use client';

import { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { getTasks, updateTaskStatus, runBenchmark } from './actions';
import { logout } from '../login/actions';
import { Task } from '@/types';
import { ExternalLink, RefreshCw, LogOut, CheckCircle, Clock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prevent cascading render lint error
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleStatusUpdate = async (taskId: string, status: Task['status']) => {
    await updateTaskStatus(taskId, status);
    fetchTasks();
  };

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    try {
      await runBenchmark();
      await fetchTasks();
    } finally {
      setRunningBenchmark(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage automated benchmarking tasks</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Play className={cn("w-4 h-4 mr-2", runningBenchmark && "animate-pulse")} />
            {runningBenchmark ? 'Running...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {tasks.length === 0 ? (
              <li className="px-6 py-12 text-center text-gray-500">
                No tasks found. Run a benchmark to discover new content.
              </li>
            ) : (
              tasks.map((task) => (
                <li key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="px-6 py-5 flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-primary truncate">
                          {task.title}
                        </p>
                        <span className={cn(
                          "ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                          task.priority === 'high' ? "bg-red-100 text-red-800" :
                          task.priority === 'medium' ? "bg-yellow-100 text-yellow-800" :
                          "bg-blue-100 text-blue-800"
                        )}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-400">
                        <Clock className="flex-shrink-0 mr-1.5 h-3 w-3" />
                        <span>Detected on {new Date(task.createdAt).toLocaleDateString()}</span>
                        <span className="mx-2">|</span>
                        <a
                          href={task.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                          aria-label={`Open source article for ${task.title} (opens in a new tab)`}
                        >
                          Source <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <select
                        value={task.status}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => handleStatusUpdate(task.id, e.target.value as Task['status'])}
                        className="text-xs border-gray-300 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        aria-label="Update task status"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                      {task.status === 'completed' && (
                        <CheckCircle className="text-green-500 w-5 h-5 mx-auto" />
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
