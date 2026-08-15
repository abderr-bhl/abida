'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { TaskItem } from '@/lib/automation/benchmark';
import { updateTaskStatusAction, triggerBenchmarkAction, logoutAction } from './actions';
import Link from 'next/link';

interface AdminTasksClientProps {
  initialTasks: TaskItem[];
}

export default function AdminTasksClient({ initialTasks }: AdminTasksClientProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTasks(initialTasks);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialTasks]);

  const handleStatusChange = useCallback((taskId: string, newStatus: TaskItem['status']) => {
    startTransition(async () => {
      try {
        await updateTaskStatusAction(taskId, newStatus);
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
        );
        setMessage('Task status updated successfully.');
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error updating task status';
        setMessage(`Error: ${errorMsg}`);
      }
    });
  }, []);

  const handleRunBenchmark = useCallback(() => {
    startTransition(async () => {
      try {
        setMessage('Running competitor benchmark...');
        const res = await triggerBenchmarkAction();
        setMessage(`Benchmark complete. Added ${res.added} new task(s).`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Benchmark run failed';
        setMessage(`Error running benchmark: ${errorMsg}`);
      }
    });
  }, []);

  const handleLogout = useCallback(() => {
    startTransition(async () => {
      await logoutAction();
    });
  }, []);

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Automated Task Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Competitor benchmarking gaps (Wirecutter, RTINGS) automatically surfaced for ReviewGuid
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3 items-center">
          <button
            onClick={handleRunBenchmark}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isPending ? 'Processing...' : 'Run Benchmark Now'}
          </button>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-md bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200 text-sm flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-1.5 focus:outline-none focus:ring-primary"
          >
            <option value="ALL">All Statuses ({tasks.length})</option>
            <option value="PENDING">Pending ({tasks.filter(t => t.status === 'PENDING').length})</option>
            <option value="IN_PROGRESS">In Progress ({tasks.filter(t => t.status === 'IN_PROGRESS').length})</option>
            <option value="COMPLETED">Completed ({tasks.filter(t => t.status === 'COMPLETED').length})</option>
          </select>
        </div>
        <span className="text-xs text-gray-500">
          Total Tasks: {filteredTasks.length}
        </span>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks found matching current criteria.</p>
          <p className="text-sm text-gray-400 mt-2">Click &quot;Run Benchmark Now&quot; to fetch latest competitor gaps.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex-grow max-w-3xl">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    {task.competitor}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Category: {task.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {task.description}
                </p>
                <div className="flex items-center space-x-4 text-xs">
                  <Link
                    href={task.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    View Source Competitor Article →
                  </Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label htmlFor={`status-${task.id}`} className="sr-only">
                  Update Task Status
                </label>
                <select
                  id={`status-${task.id}`}
                  value={task.status}
                  onChange={e => handleStatusChange(task.id, e.target.value as TaskItem['status'])}
                  disabled={isPending}
                  className={`rounded-md text-xs font-semibold px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary ${
                    task.status === 'COMPLETED'
                      ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
