'use client';

import { useState, useEffect, useCallback } from 'react';
import { triggerBenchmark, updateTaskStatus, logoutAction } from './actions';
import { Task } from '@/lib/automation/benchmark';
import { sanitizeUrl } from '@/lib/sanitize';
import { ExternalLink, Play, LogOut, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      // ignore
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

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    setMessage(null);
    try {
      const res = await triggerBenchmark();
      setMessage(res.message);
      await fetchTasks();
    } catch {
      setMessage('Failed to trigger benchmark.');
    } finally {
      setRunningBenchmark(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    await updateTaskStatus(taskId, status);
    fetchTasks();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Automated Tasks & Competitive Benchmarking
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor content gap analysis tasks automatically generated from US market competitor monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Play className="w-4 h-4" />
            {runningBenchmark ? 'Benchmarking...' : 'Run Benchmark Now'}
          </button>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </div>

      {message && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm border border-blue-200 dark:border-blue-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Generated Tasks ({tasks.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading benchmarking tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-gray-500">
            No tasks found. Click &quot;Run Benchmark Now&quot; to fetch latest competitor content.
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {task.competitor}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {task.description}
                  </p>
                  <a
                    href={sanitizeUrl(task.targetUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    View Original Competitor Content <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>

                  {task.status === 'COMPLETED' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {task.status === 'IN_PROGRESS' && (
                    <Clock className="w-5 h-5 text-amber-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
