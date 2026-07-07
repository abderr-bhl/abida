'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTasks, updateTaskStatus, triggerBenchmark } from './actions';
import { Task, TaskStatus } from '@/types';
import { logout } from '../login/actions';
import { cn } from '@/lib/utils';
import { RefreshCw, ExternalLink, CheckCircle, Clock, AlertCircle, LogOut } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const data = await getTasks();
    setTasks(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  }, []);

  useEffect(() => {
    // Avoid cascading renders by using a timeout if needed, but here we just call it once on mount
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleStatusUpdate = async (taskId: string, status: TaskStatus) => {
    const result = await updateTaskStatus(taskId, status);
    if (result.success) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
    }
  };

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    await triggerBenchmark();
    await fetchTasks();
    setRunningBenchmark(false);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Manage automated competitive benchmarking tasks.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", runningBenchmark && "animate-spin")} />
            {runningBenchmark ? 'Running...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Competitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">Loading tasks...</td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">No tasks found. Run benchmark to discover new content.</td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">{task.status.replace('-', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">{task.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {task.competitor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <a
                          href={task.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-blue-700"
                          title="View Source"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(task.id, e.target.value as TaskStatus)}
                          className="text-xs border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
